# Time Economy Marketplace — v4 Backend Starter Pack

TIME2INCOME is a static HTML/CSS/JavaScript marketplace connected to Supabase Auth and the database. Demo professionals appear only in local previews; the signed-in marketplace directory contains published provider profiles from Supabase.

## What is included
- Existing local website prototype (`index.html`, `styles.css`, `app.js`).
- Installable PWA files (`manifest.webmanifest`, `pwa.js`, `sw.js`, `offline.html`) and app icons under `assets/`.
- `localization.js`: searchable 33-language catalog and English-safe core UI translations. The income, safety, tutorial, challenge and FAQ sections use English source copy and fall back to English until translations are added.
- `currency.js`: ISO currency list, country suggestions, Intl formatting, cached exchange-rate estimates.
- `supabase/schema.sql`: starter schema for a new project; it does not match the existing live schema.
- `supabase/upgrade-live-project.sql`: repeatable upgrade matched to the existing TIME2INCOME Supabase schema.
- `supabase/task-marketplace.sql`: worker task browsing, customer offers, and secure offer acceptance.
- `supabase/global-localization.sql`: add preferred-currency and provider-language columns to the live schema.
- `supabase/authenticated-marketplace.sql`: policy change to restrict provider discovery and marketplace tables to signed-in users and ensure account-profile read access.
- `supabase/provider-location-coordinates.sql`: additive migration for optional, coarse provider coordinates used for nearby-first recommendations. Apply before deploying the matching `app.js`.
- `payment.html`, `payment.js`, and `payment.css`: one-time activation checkout UI; marketplace access remains blocked until the backend verifies a captured Razorpay payment.
- `supabase/functions/`: authenticated Razorpay order creation and server-side signature/capture verification. The `payment-status` function validates the Supabase user session and calls the user-scoped access RPC; it does not require a service-role key or Razorpay secrets.
- `supabase/platform-fee.sql`: private payment and entitlement records plus restrictive RLS/write guards for unpaid accounts. Review and apply only after backing up and checking the connected project.
- `supabase/SETUP.md`: exact free-tier setup steps.
- `supabase/client.example.js`: safe browser-client configuration example using the public anon/publishable key only.

## Run locally
1. Open the project folder in VS Code and use Live Server on `index.html`. HTTPS or localhost is required to test PWA installation and service workers; opening the file directly provides only a static preview. Supabase, exchange rates and QR generation need an internet connection.
2. Confirm `supabase/client.js` contains the correct Supabase project URL and public anon/publishable key. Never use a service-role/secret key in this file.
3. The existing TIME2INCOME Supabase project has the three additive migrations applied. Do not rerun `schema.sql` against this existing project.
4. Configure Authentication, allowed redirect URLs, and custom SMTP before inviting public users. Details are in [supabase/SETUP.md](supabase/SETUP.md).
5. `supabase/authenticated-marketplace.sql` is applied in the connected production Supabase project; use it for a fresh deployment only after confirming the existing schema and RLS policies.
6. Apply `supabase/provider-location-coordinates.sql` before deploying the nearby-provider location changes. It adds optional coordinates and grants access only to signed-in users; existing profiles remain valid with no coordinates.
7. Razorpay activation integration is **not ready for payments**: production logs show Razorpay authentication failures, production Edge Function Secrets showed no custom secrets during the 2026-10-22 audit, and no complete sandbox test was confirmed. Follow [supabase/SETUP.md](supabase/SETUP.md) to prepare a separate Test-mode Supabase project before configuring or deploying production changes. Do not use a key that has been shared outside the Razorpay/Supabase secret manager.

## Sign-in and marketplace access
- `auth.html` is the separate sign-in, registration, and password-reset entry point. Registration confirms the email when Supabase requires it and stores the same account metadata used by the marketplace. After authentication, access is checked with the authenticated `has_active_platform_access()` database function, independently of Razorpay configuration.
- Sign-in and marketplace/payment-page access checks use the authenticated `has_active_platform_access()` database function and do not depend on Razorpay credentials. The `payment-status` Edge Function remains available for compatible clients but must not be required for login.
- `index.html` is the authenticated marketplace workspace. A valid Supabase session is required; guests are redirected to `auth.html`. Provider listings, open tasks, booking actions, and account activity are shown only after sign-in.
- The workspace has separate navigable views: `index.html?page=marketplace`, `?page=tasks`, `?page=activity`, `?page=profile`, and `?page=guides`.
- Provider profiles appear in the marketplace directory when providers complete and publish their profile. Profile creation starts unpublished so providers can finish their details before appearing.

There is no build step or package manager in this project. For static hosting, publish the project folder as-is and configure the Supabase site/redirect URLs to match the deployed URL.

## New Supabase project
The included `schema.sql` is a separate starter schema and does not match the legacy table names used by this live deployment. Do not apply it to the existing TIME2INCOME project. Reconcile the schema intentionally before using it for a new project.

## Set up a cloud backend (free tier, subject to provider limits)
1. Create a Supabase account and a new project at https://supabase.com/.
2. In the project dashboard, open SQL Editor.
3. Open `supabase/schema.sql`, copy the full SQL, paste it into SQL Editor and run it.
4. In Project Settings / API, copy the Project URL and the public anon/publishable key.
5. Use them only in the browser client config. Never use a service-role/secret key in browser code.
6. Enable and configure the authentication method(s) you intend to use in Authentication settings.
7. Before collecting real users, test each RLS policy with separate customer and worker accounts.

## Important limitations
- Booking participants can chat inside their booking. Providers accept and start work, then mark it complete; customers confirm completion or report an issue. Confirmation completes a linked task and offers a next-task action. This flow does not collect or release payment.
- This is a marketplace prototype, not a complete production backend. A one-time account-activation Razorpay flow exists, but production credentials are currently unavailable and payments are not ready. Booking/work payments, identity verification, and booking calendar/overlap protection are not implemented.
- Signed-in users can browse published worker profiles and open tasks. Customers must sign in to request a booking; providers sign in to accept or decline it. Apply `supabase/authenticated-marketplace.sql` to remove the previous anonymous read access.
- Public email registration requires custom SMTP in Supabase because the default mailer is limited to project-team addresses.
- A controlled confirmation-email test succeeded on 2026-10-21: a new test account received the email, confirmed through its link, and signed in. The temporary account and marketplace test records were removed. This verifies delivery to one inbox only; check the current SMTP sender/domain status in Supabase and Resend before broad public signup. SMTP credentials are not stored in this repository.
- The production directory shows real published providers and open tasks when available. Providers must complete and publish their own profiles; no demo profiles are inserted into production.
- The website has PWA install support on compatible browsers. On Android, open `https://time2income.com/` in an up-to-date Chrome browser and choose **Install app**; if the home-screen icon does nothing, remove it and install again from Chrome. This is the website installed as an app, not an APK.
- The website and installed PWA use the same deployed files. After a website update is published, the installed PWA receives it automatically when reopened online; an active session refreshes automatically when safe or after the current form is closed. No separate app-store update is needed.
- The service worker caches only an explicit list of static assets plus the offline page. App navigation falls back to a visible retry page if the network request fails or takes longer than eight seconds. Supabase/Auth, FX and account data are network-only and are never stored by the service worker.
- Google Play and Apple App Store buttons are marked “Coming soon”. No native Android/iOS app or signed APK/AAB has been built or published.
- Demo profiles are examples only and cannot receive bookings.
- The selector offers 33 locales. Core navigation/actions have partial translations for the listed locales; untranslated copy—including the income, safety, tutorial, challenge and FAQ sections—falls back to English and needs human review before representing the entire UI as fully localized.
- FX estimates use the public `open.er-api.com` endpoint, are cached in the browser for six hours, and never change the original task or agreed booking amount.
- UI strings without a reviewed translation fall back to English; user-generated content is never auto-translated or overwritten.
- Do not put private keys, passwords, identity documents or real customer data into this prototype.

## Deployment
Follow [DEPLOY.md](DEPLOY.md) for a static-host deployment and custom-domain checklist.
