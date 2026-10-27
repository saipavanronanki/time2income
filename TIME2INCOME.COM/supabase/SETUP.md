# Supabase setup — beginner steps

## A. Create your free project
1. Open https://supabase.com/ and create an account.
2. Create a new project. Choose a strong database password and keep it private.
3. Wait for the project to finish provisioning.

## B. Upgrade the existing TIME2INCOME database
1. In the Supabase dashboard, open **SQL Editor**.
2. Choose a new query.
3. This existing project uses a legacy schema with a `categories` table. Do not rerun `schema.sql` against it.
4. Run `authenticated-marketplace.sql` to fix `permission denied for table profiles` and enforce the login-required marketplace access policy. This migration grants the authenticated role profile access while keeping row-level security enabled and removes anonymous marketplace reads.
5. Run all of `upgrade-live-project.sql` to add provider publication and secure booking responses while preserving existing rows.
6. Run all of `task-marketplace.sql` to enable worker task browsing, customer offers, and task assignment after acceptance.
7. Run all of `global-localization.sql` to add saved currency preferences and provider languages. This migration is already applied to the connected project.
8. Review the results. If any statement fails, stop and fix the error before proceeding.
9. If you intentionally want guests to browse published provider profiles instead, do not apply `authenticated-marketplace.sql`; retain the public policies from `upgrade-live-project.sql`.

## C. Configure authentication
1. Open **Authentication** in Supabase.
2. Configure email authentication. For early tests, use test accounts you control.
3. Enable email confirmation and set the production Site URL to your final HTTPS domain.
4. Add both the production URL and temporary hosting URL under allowed redirect URLs before testing signup.
5. Never treat an email typed into a form as authenticated identity; the app uses Supabase Auth.

Before public launch, configure a custom SMTP provider under **Authentication → Emails → SMTP Settings**. The Supabase default mailer is only for testing and does not deliver to arbitrary public users. Keep email confirmation enabled; enter SMTP credentials only in the Supabase dashboard, not in this repository or chat.

## H. One-time Razorpay platform activation

The site is a static Cloudflare Pages app; Razorpay order creation and verification run in Supabase Edge Functions. The fee is fixed server-side at one major currency unit (INR 1, USD 1, etc.) and is charged once per account. Only the currencies listed in `supabase/functions/_shared/razorpay.ts` are offered. Razorpay and the issuer may decline a currency or payment method even when international payments are enabled.

No local `.env` file or Razorpay SDK install is needed for this static site: the Supabase Edge Functions call Razorpay over HTTPS and read credentials from Supabase Function Secrets. Do not put a Razorpay secret in Cloudflare Pages, browser code, or this repository.

Configuration is loaded by purpose: login/access checks need `SUPABASE_URL` and `SUPABASE_ANON_KEY`; server-side payment database operations additionally need `SUPABASE_SERVICE_ROLE_KEY`; `create-order` and `verify-payment` additionally need the matching `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. The `payment-status` access check does not need the service-role key or Razorpay credentials and fails closed if its authenticated access RPC cannot be verified.

1. Keep Razorpay credentials out of chat, source, browser storage, and shell history. Do not rotate or revoke a key automatically; rotate only after an authorized owner decides the existing key is compromised or unrecoverable.
2. The confirmed production app-data project is `epylulnketqwhqxxyjgz`; its schema matches this code (`worker_profiles`, `categories`, and `task_offers`). Project `uwtbjegbvqomjwxdxral` has a different schema and is not the production target. During the 2026-10-22 audit, production Edge Function Secrets showed no custom secrets, and runtime logs showed a Razorpay authentication rejection. Treat prior notes claiming production Test credentials were configured as stale.
3. Apply `platform-fee.sql` only after reviewing the production schema and existing policies. It blocks unpaid accounts—including existing accounts—from marketplace access until activation is verified. Before deploying the payment-order reconciliation handler, also apply `payment-order-reconciliation.sql`; it adds a nullable lease timestamp used to serialize concurrent order creation and safely recover ambiguous provider responses.
4. The functions were already deployed on production at the time of the audit. Deploy only after owner approval, regression tests, and required SQL migrations are verified. Specify the project ref explicitly:
   ```powershell
   supabase functions deploy create-order --project-ref epylulnketqwhqxxyjgz
   supabase functions deploy verify-payment --project-ref epylulnketqwhqxxyjgz
   ```
   The local Supabase CLI link metadata currently points to `uwtbjegbvqomjwxdxral`, not production. Never rely on the linked default target for deployment or database commands; explicitly select the reviewed project ref after approval.
   The isolated `payment-status` login fix should deploy only that function. Its access check validates the bearer token with Supabase Auth and calls `has_active_platform_access()` using the user's token and public anon key; it does not use the service-role key or Razorpay credentials.
5. Supabase supplies its project URL and API keys to Edge Functions. Add Razorpay credentials only through the intended project's **Edge Functions → Secrets** page. Use Test credentials only in a separate test project and Live credentials only in production. Never set a service-role key in Pages or browser code.
   Razorpay authentication failures must be resolved by verifying that the Key ID and Secret are a pair from the same Razorpay account and mode. Supabase masks secret values, so a saved-name/timestamp check cannot prove a pair matches. If a secret has been shared in chat or another untrusted channel, revoke it in Razorpay and configure its replacement directly in production Edge Function Secrets; never paste the replacement into chat.
6. No separate Supabase sandbox project or complete Razorpay sandbox payment was confirmed during the 2026-10-22 audit. Before testing, provision a separate test project, apply the schema/migrations reviewed for that project, deploy the three functions there, and configure Razorpay Test Mode credentials directly in that project's Edge Function Secrets. Keep `supabase/client.js` and production secrets unchanged.
7. Test signup, confirmation, sign-in, unpaid marketplace redirect, successful/failed/dismissed/pending checkout, duplicate callbacks, invalid signatures, captured-payment verification, and once-only activation using controlled test accounts. Verify unpaid users cannot query marketplace tables using their browser session.
8. Only after successful sandbox tests and explicit owner approval, configure a matching existing Razorpay Live Key ID/Secret pair through production Edge Function Secrets and deploy approved code. If the existing Live Secret is unavailable, stop and obtain owner approval before generating a replacement key pair. Verify Razorpay business/site approval, payment-method eligibility, settlement, receipts, refunds, tax treatment, and fee disclosures before enabling real customer payments. Do not make a real payment as a debugging test.

An account may be registered and email-confirmed before paying; sign-in checks activation through the authenticated `has_active_platform_access()` database function and redirects unpaid users to the activation checkout. The RPC must bind its result to `auth.uid()` and be executable only by authenticated users. The `payment-status` Edge Function uses the same RPC with the validated user's bearer token. Marketplace access is withheld until the captured payment is verified server-side. Do not manually insert entitlements or mark a payment as paid. Accounts created before this migration must also complete activation.

Razorpay's published India pricing is generally 2% plus GST on its fee for domestic payments and up to 3% plus GST for international cards. A one-unit fee may therefore leave very little after gateway charges. Check current pricing, minimums, and supported currencies with Razorpay before launch.

### Email delivery status and Resend configuration

As of 2026-10-21, email signup and confirmation are enabled. A controlled test signup received a confirmation email, completed the link, and signed in successfully. The temporary account and marketplace test records were removed. This verifies delivery to one inbox only; check the current SMTP sender and domain-verification status in Supabase and Resend before broad public signup.

Earlier notes from 2026-10-16 recorded Resend host `smtp.resend.com`, port `465`, username `resend`, a Gmail sender, and pending DNS verification for `auth.time2income.com`. Treat those values as historical until verified in the dashboard. Resend requires a domain you own and verify. If the current sender domain is still pending, complete verification before using an address on that domain, then configure:

- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: the Resend API key, entered only into Supabase's SMTP password field
- Sender address: an address on the verified domain

Do not put the Resend API key in browser code, this repository, a screenshot or chat. Keep email confirmation enabled and verify delivery with a controlled test signup before inviting users.

## D. Find the browser-safe project values
In project API settings, copy:
- Project URL
- Public anon/publishable key

These public client values can be used in a browser when Row Level Security is enabled. **Never copy the service-role/secret key into a web page, JavaScript file, screenshot, public repository or chat.**

## E. Test the marketplace flow
- Register a customer account and a separate worker account.
- As the worker, complete and publish the provider profile. Verify it appears to other signed-in users and does not expose email or other private account data.
- As the customer, sign in and request a booking. Verify it appears for both participants.
- As the worker, accept or decline it. As the customer, verify the status and test cancellation.

## F. Test localization and currencies
- Switch among English, Hindi, Gujarati, Arabic, and Japanese; verify Arabic is right-to-left and switching back restores the saved locale.
- Search/select a currency by code and name; verify INR, USD, and JPY formatting and the country-based suggestion.
- Enter a budget in a non-INR currency; verify the original currency remains visible and any conversion is marked approximate.
- Block the exchange-rate request in browser DevTools and verify the original amount remains visible with a conversion-unavailable notice.
- Verify no task title, description, profile bio, or message is automatically translated or overwritten.

## G. Test security before real use
- Create two separate test users.
- Confirm each can edit only their own profile.
- Confirm users cannot read another user's private bookings or offers.
- Confirm open tasks can be read by signed-in users, while only the task owner can edit/delete them.
- Confirm a worker cannot create an offer for a task they do not own incorrectly, and cannot alter another worker's offer.
- Do not launch public transactions until these tests and booking-overlap controls are complete.

## Local development
Open the project folder in VS Code, install/use Live Server, and choose **Open with Live Server** on `index.html`. Keep the Supabase client, localization, and currency scripts in the documented order; no build step is required.
