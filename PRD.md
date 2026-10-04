# PRD: Mama Ngozi's online shop

## Product
Online shop for a small Lagos food trader (zobo, chin chin, puff puff, kunu, groundnut, party packs). Customers order online and pay on delivery. The owner stops taking orders by WhatsApp and phone call only.

## Users
- **Customer:** browses, adds to cart, checks out, comes back later to see past orders.
- **Owner (later):** sees incoming orders. Not in v1.

## Stack
- Frontend: static HTML/CSS/JS (`index.html`), hosted on Netlify/Vercel/Cloudflare Pages
- Database + Auth: Supabase (Postgres, Row Level Security, Google OAuth)
- Email: Mailgun, called from a Supabase Edge Function
- Google Cloud Console: OAuth client

## Requirements (HNG checks)
1. Google sign-in works
2. Signed-in user sees their orders
3. Log out works
4. Close and reopen, sign in again, previous orders still there
5. Checkout sends a real, nicely formatted HTML confirmation email

## Phases
1. **Foundation:** Supabase project, schema, seed products, RLS
2. **Shop:** product grid, cart, checkout page
3. **Auth:** Google OAuth via Supabase
4. **Orders:** `place_order()` function, My orders page
5. **Email:** Mailgun via Edge Function, HTML template
6. **Ship:** deploy, set redirect URLs, run test checklist
7. **Optional:** Paystack test-mode payment

## Out of scope for v1
Owner dashboard, stock counts, delivery fees, real payments.

## Done when
The test checklist in README.md passes on the deployed URL.
