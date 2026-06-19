export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, UNLIMITED_PRICE_CENTS } from "@/lib/stripe";

// Creates a Stripe Checkout session for the "unlimited cases" upgrade.
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  // Use a pre-created Price if provided, otherwise build the line item inline.
  const priceId = process.env.STRIPE_PRICE_ID;

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: { user_id: user.id },
    line_items: priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: UNLIMITED_PRICE_CENTS,
              product_data: {
                name: "Casefy — Unlimited cases",
                description: "Lifetime access to unlimited PM interview cases.",
              },
            },
          },
        ],
    success_url: `${origin}/pricing?status=success`,
    cancel_url: `${origin}/pricing?status=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
