import Stripe from "stripe";

export const UNLIMITED_PRICE_CENTS = 1900;

// Lazy singleton — never instantiated at module load time so the build
// succeeds even when STRIPE_SECRET_KEY is not yet configured.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}
