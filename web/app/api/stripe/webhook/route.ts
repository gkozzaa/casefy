export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe } from "@/lib/stripe";

// Stripe webhook: flips the user to Pro on successful payment.
// Uses the service-role key so it can update any profile server-side.
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json(
      { error: "webhook not configured" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      client_reference_id?: string | null;
      metadata?: Record<string, string> | null;
    };
    const userId = session.metadata?.user_id || session.client_reference_id;

    if (userId) {
      // Admin client (service role) — bypasses RLS for the upgrade write.
      const admin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { getAll: () => [], setAll: () => {} } }
      );
      await admin.from("profiles").update({ is_pro: true }).eq("id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
