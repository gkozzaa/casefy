// Server-side Stripe client. Never import this into a client component.
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

// Price of the "unlimited cases" upgrade, in cents. Used when no
// STRIPE_PRICE_ID is configured and we create the line item inline.
export const UNLIMITED_PRICE_CENTS = 1900; // $19.00
