import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consumeCase, getEntitlement } from "@/lib/entitlements";

// Increments the user's used-case counter. Called once a case completes.
// Pro users are not metered.
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const before = await getEntitlement(user.id);
  if (!before.isPro) {
    await consumeCase(user.id);
  }

  return NextResponse.json({ ok: true });
}
