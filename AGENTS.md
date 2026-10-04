# AGENTS.md: context for coding agents

## Project
Shop website for Mama Ngozi's. Read `PRD.md` for scope and `README.md` for setup and the session log.

## Stack and layout
- `index.html`: whole frontend (vanilla JS, supabase-js from CDN). Config constants at the top of the script.
- `schema.sql`: tables, RLS policies, `place_order()` RPC, seed products
- `supabase/functions/send-order-email/index.ts`: Deno Edge Function that sends the HTML email via Mailgun

## Rules
- Never put the Mailgun API key, Google client secret or Supabase service-role key in frontend code or in git. Only the Supabase URL and anon key belong in `index.html`.
- Orders are created only through the `place_order()` RPC. It prices items from the `products` table. Do not trust prices from the client.
- Keep RLS on for every table. Users may only read their own orders and order items.
- Currency is Nigerian naira, whole numbers.
- Keep it dependency-free: no build step unless asked.
- Escape any user-provided text placed into HTML (the email template uses `esc()`).

## Commands
- Run locally: `npx serve -l 3000`
- Deploy function: `supabase functions deploy send-order-email`
- Set secrets: `supabase secrets set MAILGUN_API_KEY=... MAILGUN_DOMAIN=...`

## End of session
Update the "Session log" in `README.md`: what changed, what works, what is blocked, next step.
