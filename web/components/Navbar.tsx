"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "./Logo";
import { LangToggle } from "./LangToggle";
import { useLang } from "./LangProvider";

export function Navbar() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/entitlement")
      .then((r) => r.ok ? r.json() : null)
      .then((e) => e && setIsPro(e.isPro))
      .catch(() => {});
  }, [user]);

  async function signOut() {
    await createClient().auth.signOut();
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-7 w-7" />
          <span className="text-lg font-semibold tracking-tight">Casefy</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <LangToggle />
          <Link
            href="/pricing"
            className="rounded-lg px-3 py-2 text-muted transition-colors hover:text-white"
          >
            {t.nav.pricing}
          </Link>

          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-elevated" />
          ) : user ? (
            <>
              {isPro && (
                <span className="rounded-full bg-accent/20 px-2.5 py-1 text-xs font-semibold text-accent-soft ring-1 ring-accent/40">
                  PRO
                </span>
              )}
              <span className="hidden px-2 text-muted sm:inline">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="rounded-lg border border-border px-3 py-2 text-muted transition-colors hover:border-accent hover:text-white"
              >
                {t.nav.signOut}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-accent px-4 py-2 font-medium text-white transition-colors hover:bg-accent-soft"
            >
              {t.nav.signIn}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
