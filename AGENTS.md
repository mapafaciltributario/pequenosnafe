<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project architecture rules

- **Checkout & Cakto integration.** `/checkout` and `/obrigado` run on TanStack Start server functions (`src/lib/checkout.functions.ts`) calling Cakto's direct REST API (`POST /public_api/payments/`, `GET /public_api/orders/{id}/`) with `X-Idempotency-Key`, while card tokenization, 3DS, and antifraud stay client-side in Cakto's official SDK (`src/lib/cakto-sdk.ts`) so raw card data never reaches the server.
- **Order confirmation & webhooks.** `/obrigado` verifies an HMAC-SHA256 access token plus live `status === "paid"` from Cakto before unlocking access or firing deduplicated `Purchase`; Cakto webhooks hit `POST /api/public/webhooks/cakto`, validate `X-Cakto-Signature` (`v1=HMAC-SHA256`), and dispatch server-side conversions to Meta CAPI and LowTrack (`POST https://lowtrack.com.br/api/webhook`).
- **Sales page.** `/` is composed from `src/components/sales/*`; every buy CTA uses `CheckoutButton` (→ `/checkout` via `buildCheckoutUrl`) so UTM/fbclid survive. Testimonials render only from `REAL_TESTIMONIALS` in production; demo items show only in dev, so no fabricated social proof ships.
