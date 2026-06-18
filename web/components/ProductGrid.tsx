"use client";

import { useRouter } from "next/navigation";
import { PRODUCTS } from "@/lib/products";

// Clicking a product routes into the interview flow for it.
export function ProductGrid() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {PRODUCTS.map((p) => (
        <button
          key={p.name}
          onClick={() =>
            router.push(`/interview?product=${encodeURIComponent(p.name)}`)
          }
          className="group relative overflow-hidden rounded-xl border border-border bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent"
        >
          <div
            className="absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
            style={{ background: p.accent }}
          />
          <div className="text-2xl">{p.emoji}</div>
          <div className="mt-3 font-semibold">{p.name}</div>
          <div className="text-xs text-muted">{p.tagline}</div>
        </button>
      ))}
    </div>
  );
}
