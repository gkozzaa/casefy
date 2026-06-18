// Entitlement helpers built on the `profiles` table (see supabase/schema.sql).
// Free tier = 1 completed case. After that the user must upgrade to Pro.
import { createClient } from "./supabase/server";

export const FREE_CASE_LIMIT = 1;

export interface Entitlement {
  isPro: boolean;
  casesUsed: number;
  canStartCase: boolean;
  remainingFree: number;
}

export async function getEntitlement(userId: string): Promise<Entitlement> {
  const supabase = createClient();

  const { data } = await supabase
    .from("profiles")
    .select("is_pro, cases_used")
    .eq("id", userId)
    .single();

  const isPro = data?.is_pro ?? false;
  const casesUsed = data?.cases_used ?? 0;
  const remainingFree = Math.max(0, FREE_CASE_LIMIT - casesUsed);

  return {
    isPro,
    casesUsed,
    canStartCase: isPro || remainingFree > 0,
    remainingFree,
  };
}

// Atomically increments the case counter via the SQL function `increment_cases_used`.
export async function consumeCase(userId: string): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("increment_cases_used", { uid: userId });
}
