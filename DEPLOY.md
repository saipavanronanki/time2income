# Static deployment checklist

The site is plain HTML, CSS, and JavaScript. It has no build command; deploy the public files `index.html`, `help.html`, `privacy.html`, `terms.html`, `styles.css`, `redesign.css`, `app.js`, `auth.html`, `auth.js`, `payment.html`, `payment.js`, `payment.css`, `localization.js`, `currency.js`, `pwa.js`, `sw.js`, `manifest.webmanifest`, `favicon.ico`, `_headers`, `offline.html`, `robots.txt`, `sitemap.xml`, `assets/`, and `supabase/client.js`. Preserve nested folder paths in ZIP uploads. Do not upload `supabase/functions/`, SQL migrations, `supabase/.temp/`, local backups, or repository-only documentation.

`privacy.html` and `terms.html` are currently marked as drafts and contain placeholders. Do not publish these pages or enable user registration/payment until the operator identity, monitored contact address, retention details, and final legal review are complete.

## 1. Prepare Supabase

1. In the existing TIME2INCOME Supabase project, confirm the additive migrations `upgrade-live-project.sql`, `task-marketplace.sql`, `global-localization.sql`, `marketplace-collaboration.sql`, and `booking-completion.sql` are applied. `supabase/authenticated-marketplace.sql` was applied and verified on 2026-10-21 for this login-required experience. It removes anonymous marketplace reads and grants signed-in profile access. Do not run `schema.sql` against this project; its table names differ from the live schema.
2. Before deploying the nearby-provider changes, apply `supabase/provider-location-coordinates.sql` in the existing project. It adds nullable, coarse provider coordinates and grants their read access only to authenticated users. Existing profiles remain searchable without coordinates; providers opt in from their profile editor. Do not deploy the new `app.js` before this migration, because it selects the new columns.
3. In Authentication settings, enable email sign-in. The connected project’s Site URL is `https://time2income.com`; allow the production custom domain as a redirect destination.
4. In `supabase/client.js`, verify the project URL and public anon/publishable key. Never put a service-role/secret key in browser code.
5. Email signup and confirmation are enabled. A controlled test on 2026-10-21 received a confirmation email, completed the link, and signed in successfully; the temporary account and marketplace records were removed. This verifies one recipient only. Check the current SMTP sender and domain-verification status in Supabase and Resend before broad public signup; do not commit or share SMTP credentials.
6. Keep email confirmation enabled. Do not disable verification as a workaround for missing SMTP. SMTP credentials must be entered directly into Supabase, never committed to this repository or shared in chat.

## 2. Publish the static site

The current production build is deployed to Cloudflare Pages. For a future manual deployment, upload the project root as a ZIP with standard forward-slash paths, preserving nested folders. On Windows, verify the ZIP contains paths such as `supabase/client.js` (not `supabase\client.js`); a folder upload avoids this path-separator issue. No build command or publish subdirectory is needed. Open the assigned HTTPS URL and test signup, email confirmation, profile publishing for signed-in users, booking chat, provider start/completion, customer confirmation or issue reporting, and the next-task action.

The verified primary URL is https://time2income.com/ and the Cloudflare Pages project URL is https://time2income.pages.dev/. The former Netlify fallback is an older build and must not be used for the login-required release.

## Razorpay activation fee

The Razorpay checkout is deployed on Cloudflare Pages and the three Supabase Edge Functions are deployed on project `epylulnketqwhqxxyjgz`. During the 2026-10-22 audit, production Edge Function Secrets showed no custom secrets; runtime logs showed Razorpay authentication failures, and the `create-order` function returned HTTP 500. A separate Supabase test project and a complete sandbox payment have not been confirmed. **Live payments are not ready.** Follow [supabase/SETUP.md](supabase/SETUP.md) for the test-first recovery process. Do not deploy static files alone expecting payment verification to work. Never place `RAZORPAY_KEY_SECRET` or a Supabase service-role key in Cloudflare Pages assets, `.env` files committed to source, or browser scripts.

The login access check uses the authenticated `has_active_platform_access()` RPC. `payment-status` validates the bearer token with Supabase Auth and invokes that RPC using the user's token; it must not require a service-role key or Razorpay credentials. Deploy an approved isolated update only with an explicit project reference, for example `supabase functions deploy payment-status --project-ref epylulnketqwhqxxyjgz`.

Keep `supabase/client.js` with the site because it contains the public browser configuration. Do not upload local backups or unrelated files if the host offers an explicit publish-directory option.

For local development, open the project folder in VS Code and use the Live Server extension on `index.html`; there is no build command.

## PWA and mobile installation

- The HTTPS website exposes `manifest.webmanifest`, PNG install icons and a registered service worker. On Android, open `https://time2income.com/` in Chrome and choose **Install app** (or **Add to Home screen**); if an old home-screen icon does nothing, remove it and install again. On iPhone/iPad, use Safari Share > Add to Home Screen.
- The website and installed PWA are the same web app: after deployment, changes appear in the PWA automatically when reopened online. While the PWA is open, a new service worker refreshes the page automatically when safe, or after an open form is closed.
- The service worker uses network-first navigation; if the page cannot load or the request takes over eight seconds, it shows a local offline page with a retry button. It caches only explicitly listed static files and does not cache Supabase/Auth, FX or private account responses.
- This install route is a PWA, not a native Android APK or iOS app. Store distribution still requires native packaging, signing credentials, developer accounts and store approval; no such native release is currently published.
- The QR code points to the verified live website. Store badges remain “Coming soon” until official store listings exist.
- A PWA is not a native store app. Google Play and Apple App Store distribution still require native packaging, developer accounts, store assets, privacy/compliance declarations, submission and approval.

## Search engine indexing

- `robots.txt`, `sitemap.xml`, canonical URL, Open Graph metadata and truthful `WebSite` structured data target `https://time2income.com/`.
- `time2income.com` and `time2income.pages.dev` serve the current Cloudflare Pages release.
- HTTPS works on the apex custom domain; `www` resolves and redirects to the canonical apex.
- Google Search Console Domain ownership is verified, and `https://time2income.com/sitemap.xml` was submitted successfully with 1 page discovered.
- Search visibility is not immediate or guaranteed; crawling and indexing can take time. Keep Google's TXT verification record in DNS.

## Current launch blockers

- A controlled confirmation-email test succeeded for one inbox; broad deliverability is not guaranteed. Keep email confirmation enabled and verify the current SMTP sender/domain status before inviting users.
- The production marketplace uses real published provider profiles and open tasks; no demo profiles are inserted into production.
- The production activation checkout is unavailable until matching Live credentials are configured securely and verified; no separate sandbox test project or completed end-to-end test was confirmed in the 2026-10-22 audit. Complete and verify successful, failed, dismissed, pending, duplicate, invalid-signature, and paid/unpaid access flows in a separate Test-mode project before any production change. Booking chat and completion confirmation do not collect or release work/booking payments. Identity verification and booking-overlap controls are not implemented.

## 3. Custom domain status

`time2income.com` serves the Cloudflare Pages project and is the primary production URL. Confirm the Cloudflare Pages custom-domain binding and DNS records in the dashboard before changing DNS. Do not redirect users to the stale Netlify fallback.

## Launch boundary

Profile search and booking requests are a prototype flow. Booking chat and provider-completion/customer-confirmation controls are implemented, but booking payments/settlement, ratings, identity checks, calendar availability, and booking-overlap prevention are not. The separate account-activation fee remains unavailable until the setup and verification steps above are complete. Do not represent payment settlement or booking guarantees as available.