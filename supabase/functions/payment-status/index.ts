import { createPaymentStatusHandler } from './handler.ts';

Deno.serve(createPaymentStatusHandler());
