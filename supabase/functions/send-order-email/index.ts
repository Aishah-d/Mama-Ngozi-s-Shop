import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info" };
const esc = (s: string) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const naira = (n: number) => "₦" + Number(n).toLocaleString("en-NG");

function buildHtml(o: any) {
  const rows = o.order_items.map((i: any) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #E8D9D6">${esc(i.name)} <span style="color:#8a7077">× ${i.qty}</span></td>
      <td style="padding:10px 0;border-bottom:1px solid #E8D9D6;text-align:right">${naira(i.qty * i.unit_price)}</td>
    </tr>`).join("");
  return `<!doctype html><html><body style="margin:0;background:#FBF6F4;font-family:Arial,Helvetica,sans-serif;color:#2A1A20">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="background:#6B1535;color:#fff;padding:24px;font-size:22px;font-weight:bold">Mama Ngozi's</td></tr>
      <tr><td style="padding:24px">
        <h2 style="margin:0 0 8px;font-size:22px">Thank you, ${esc(o.name)}. Your order is in.</h2>
        <p style="margin:0 0 20px;color:#5b4249">Order <b>#${o.id.slice(0, 8)}</b> · ${new Date(o.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px">${rows}
          <tr><td style="padding-top:14px;font-weight:bold">Total</td><td style="padding-top:14px;text-align:right;font-weight:bold;font-size:18px;color:#2F5D3A">${naira(o.total)}</td></tr>
        </table>
        <div style="margin-top:24px;padding:16px;background:#FBF6F4;border-radius:8px;font-size:14px">
          <b>Delivering to</b><br>${esc(o.address)}<br>${esc(o.phone)}<br><br>
          <b>Payment</b><br>Pay on delivery.
        </div>
        <p style="margin:24px 0 0;font-size:13px;color:#8a7077">Questions about your order? Just reply to this email.</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { order_id } = await req.json();
    // Caller's JWT is used, so RLS ensures they can only email their own order
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } });
    const { data: o, error } = await sb.from("orders").select("*, order_items(*)").eq("id", order_id).single();
    if (error || !o) throw new Error("order not found");

    const text = `Hi ${o.name},\n\nThank you! We received order #${o.id.slice(0, 8)}.\n\n` +
      o.order_items.map((i: any) => `${i.qty} x ${i.name} - ${naira(i.qty * i.unit_price)}`).join("\n") +
      `\n\nTotal: ${naira(o.total)}\nDelivery to: ${o.address}\nPay on delivery.\n\n- Mama Ngozi's`;

    const domain = Deno.env.get("MAILGUN_DOMAIN")!;
    const base = Deno.env.get("MAILGUN_BASE") ?? "https://api.mailgun.net"; // EU: https://api.eu.mailgun.net
    const body = new URLSearchParams({
      from: `Mama Ngozi's <orders@${domain}>`, to: o.email,
      subject: `Order #${o.id.slice(0, 8)} confirmed`, text, html: buildHtml(o) });
    const r = await fetch(`${base}/v3/${domain}/messages`, { method: "POST",
      headers: { Authorization: "Basic " + btoa("api:" + Deno.env.get("MAILGUN_API_KEY")!) }, body });
    if (!r.ok) throw new Error("mailgun: " + await r.text());
    return new Response(JSON.stringify({ sent: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
