# Casefy — Frontend

AI-powered Product Manager interview simulator. Practice live PM cases on real
products and get scored across 7 dimensions.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase Auth ·
Stripe.

## What's here

| Route | Purpose |
| --- | --- |
| `/` | Landing — hero, 12 products, how-it-works |
| `/login` | Supabase Auth (password + magic link) |
| `/interview?product=Spotify` | Live chat interview + 7-dimension progress bar |
| `/result/[sessionId]` | FIFA-style skill radar, seniority badge, feedback, LinkedIn share |
| `/pricing` | Paywall — 1 free case, then Stripe Checkout for unlimited |

The interview screen talks directly to the FastAPI backend (`5_api.py`):
`POST /session/start` → `POST /session/respond` (looped) → `POST /session/{id}/evaluate`.

Because the backend keeps sessions in memory, the evaluation result is cached in
`sessionStorage` and read by the result page (with a live re-evaluate fallback).

## Setup

1. **Install**

   ```bash
   cd web
   npm install
   ```

2. **Environment** — copy and fill:

   ```bash
   cp .env.local.example .env.local
   ```

   See the file for each variable.

3. **Supabase** — run `supabase/schema.sql` in the Supabase SQL editor. It
   creates the `profiles` table (entitlements), an auto-profile trigger, and the
   `increment_cases_used` RPC.

4. **Stripe (optional for local UI)** — to test the upgrade flow, forward
   webhooks:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   Put the printed `whsec_…` in `STRIPE_WEBHOOK_SECRET`.

5. **Run** (backend + frontend):

   ```bash
   # in the repo root
   uvicorn 5_api:app --reload --port 8000
   # in web/
   npm run dev
   ```

   Open http://localhost:3000.

## Paywall logic

Free tier = **1 completed case** per user (`profiles.cases_used`). The interview
page checks `/api/entitlement` before starting and bounces to `/pricing?reason=limit`
when the free case is spent. A successful Stripe payment flips `is_pro = true`
via the webhook, lifting the cap.

## Design

Dark mode, `#0F0F14` canvas, `#534AB7` accent purple, white text. Inter
typeface. The skill radar is hand-rolled SVG (no chart dependency).
