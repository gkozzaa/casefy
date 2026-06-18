import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEntitlement } from "@/lib/entitlements";

// Returns the current user's case entitlement (used by the interview gate).
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const entitlement = await getEntitlement(user.id);
  return NextResponse.json(entitlement);
}
