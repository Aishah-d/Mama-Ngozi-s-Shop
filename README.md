# Mama Ngozi's Online Shop

An online shop for a Lagos food trader (zobo, chin chin, puff puff, kunu, groundnut, party packs). Customers sign in with Google, order online, and pay on delivery.

**Live site:** https://stunning-dolphin-d2779d.netlify.app

## Features
- Product listing, cart and checkout
- Google sign-in (Supabase Auth with Google Cloud OAuth)
- Orders saved in a Supabase Postgres database, with Row Level Security
- "My orders" page: orders persist across logout and reopening the page
- HTML confirmation email sent through Mailgun after each order

## Stack
- Frontend: static HTML, CSS and JavaScript (`index.html`)
- Database and auth: Supabase
- Email: Mailgun, called from a Supabase Edge Function
- Hosting: Netlify

## Project structure
- `index.html`: the whole frontend
- `schema.sql`: tables, security policies, `place_order()` function and seed products
- `supabase/functions/send-order-email/index.ts`: sends the confirmation email
- `PRD.md` and `AGENTS.md`: product plan and context for coding agents

## Setup
1. Create a Supabase project and run `schema.sql` in the SQL Editor.
2. Put your Supabase URL and anon key at the top of the script in `index.html`.
3. Enable Google in Supabase (Authentication, Sign In / Providers) with a Client ID and secret from Google Cloud Console. Add the Supabase callback URL as an authorized redirect URI in Google.
4. Add your site URL under Authentication, URL Configuration (Site URL and Redirect URLs).
5. Create a Mailgun account. Authorize your test recipients on the sandbox domain.
6. Link and deploy the function:
```
   npx supabase login
   npx supabase link --project-ref YOUR-PROJECT-REF
   npx supabase secrets set MAILGUN_API_KEY=your-key MAILGUN_DOMAIN=your-domain
   npx supabase functions deploy send-order-email
```
7. Host the folder on Netlify, Vercel or Cloudflare Pages.

Never commit the Mailgun key, Google client secret or Supabase service-role key.

## Known limits
- Email uses the Mailgun sandbox, so it only reaches authorized recipients.
- Payment is pay on delivery. Paystack test mode is planned.

## Session log
- **Session 1:** Built and deployed the shop. Sign-in, checkout, orders, logout, reopen and sign in again all work, and the confirmation email sends.
  - Next: add a verified Mailgun domain, rotate the Mailgun key, add Paystack test payments.
