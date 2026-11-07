# TIME2INCOME Messaging Add-ons

This package adds: (1) booking-linked conversation timeline support, (2) a persistent customer-support chat, and (3) booking/payment/refund event cards in booking chats.

## Existing booking chat
The project already uses `bookings` + `booking_messages` for customer/provider chats. This update preserves that flow and adds a read-only `booking_chat_events` timeline. Booking creation and status changes are recorded by database triggers. Payment/refund events are recorded when the booking row's `payment_status`, `payment_state`, `transaction_status`, `refund_status`, or `refund_state` fields are updated to recognized successful states. If your payment Edge Function writes to a separate payment table and does not update these booking fields, add a server-side trigger there to insert the corresponding `booking_chat_events` row. Do not let browser clients insert system events.

## Customer support chat
New files: `support-chat.html`, `support-chat.js`, `messaging-addons.css`. The Messages page now links to Contact support. Support chat persists messages in Supabase and subscribes to Realtime.

## Apply migration
1. Back up your Supabase database.
2. Open Supabase Dashboard → SQL Editor.
3. Run `supabase/migrations/202611070001_messaging_support_and_booking_events.sql`.
4. Ensure the `supabase_realtime` publication is enabled (migration attempts to add `support_messages`).
5. Assign support staff using trusted Supabase Auth `app_metadata`, e.g. `role: "support"` or `support_agent: true`. Never use user-editable `user_metadata` for staff authorization.
6. Deploy the website files.

## Security notes
- Support conversation creation is performed by `start_support_conversation()`; messages require authenticated sender identity and conversation access.
- Support staff are authorized only through trusted `app_metadata`.
- Booking event rows are written by a database trigger and are read-only to clients.
- Existing booking chat RLS/RPCs remain unchanged. Review existing policies before applying to production.

## Important verification
The migration assumes `public.bookings` has `id`, `customer_id`, and `worker_id`, consistent with the existing application queries. Payment/refund event detection is intentionally dynamic against common booking JSON fields; inspect your actual payment Edge Function and schema to ensure it updates one of those fields. Test customer-to-provider, customer-to-support, support-agent-to-customer, booking status, payment and refund flows in a staging Supabase project before production.
