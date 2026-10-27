# Repository Guidance

## Project
- This is a plain HTML, CSS, and browser JavaScript marketplace prototype. There is no package manifest or automated test suite in the repository.
- `index.html` loads the Supabase JS v2 CDN, `supabase/client.js`, then `app.js`. Preserve this load order and the existing global-script style unless deliberately migrating the app.
- `app.js`, `styles.css`, and `index.html` are the active application files. The `app-backup*.js` files and `app copy.js` are snapshots; do not use them as implementation targets unless asked.

## Running and Checking
- Open `index.html` in a modern browser to run the app. Network access is needed for the Supabase CDN and backend requests.
- There is no configured build, lint, or test command. For browser-facing changes, check the relevant flow in a browser and inspect the console and network errors.
- Keep user-facing copy, existing language translations, and DOM IDs aligned when changing interface behavior.

## Supabase and Security
- The browser client uses a public/publishable key. Never add a service-role key, password, or other secret to browser files, documentation, or source control.
- Treat `supabase/schema.sql` and Row Level Security policies as the backend contract. Do not weaken RLS to make a UI query work; reconcile the query and schema intentionally.
- `supabase/schema.sql` is a starter schema for a new project and does not match the legacy production schema. The active `app.js` worker-directory query uses `is_published`, `work_preference`, `service_city`, and `service_country`; do not apply the starter schema to production.
- Payment readiness is configuration-dependent. The 2026-10-22 production audit confirmed missing Razorpay custom secrets and runtime authentication errors. A separate sandbox project and complete sandbox payment have not been confirmed. Recheck production dashboard state before making payment or deployment claims.
- `README.md` describes the app as local-storage-only, but the active `index.html` and `app.js` load and use Supabase. Keep documentation aligned with the active implementation when editing docs.
- The marketplace is a prototype. Do not represent demo data or incomplete booking flows as production-ready; backend authorization and booking transitions must remain enforced server-side.
## Deploy policy
- The user wants changes batched: build all requested features first, then deploy once when the user says final (or asks to go live), to avoid repeated hosting logins.
- Netlify deploys are blocked (credits exceeded) as of 2026-10-17; the user is moving to a free host (Cloudflare Pages). Check the current host before deploying, then verify live URLs, including /supabase/client.js returning 200.
- Do not upload the APK or any secrets (release.jks) unless the user asks.
