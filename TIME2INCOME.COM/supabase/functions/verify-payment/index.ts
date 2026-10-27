import { createVerifyPaymentHandler } from './handler.ts';

Deno.serve(createVerifyPaymentHandler());
