// Tiered seniority badge. Maps the backend's free-text seniority to a tier.
const TIERS: { match: string; label: string; ring: string; glow: string }[] = [
  { match: "staff", label: "Staff", ring: "from-amber-300 to-yellow-500", glow: "shadow-[0_0_40px_-8px_rgba(251,191,36,0.6)]" },
  { match: "senior", label: "Senior", ring: "from-accent-soft to-accent", glow: "shadow-[0_0_40px_-8px_rgba(83,74,183,0.7)]" },
  { match: "mid", label: "Mid", ring: "from-sky-400 to-blue-600", glow: "shadow-[0_0_40px_-8px_rgba(56,189,248,0.5)]" },
  { match: "junior", label: "Junior", ring: "from-slate-400 to-slate-600", glow: "" },
];

function resolveTier(seniority: string) {
  const s = seniority.toLowerCase();
  return TIERS.find((t) => s.includes(t.match)) ?? TIERS[3];
}

export function SeniorityBadge({ seniority }: { seniority: string }) {
  const tier = resolveTier(seniority);
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`rounded-2xl bg-gradient-to-br ${tier.ring} p-[2px] ${tier.glow}`}
      >
        <div className="rounded-2xl bg-surface px-6 py-4 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Seniority
          </div>
          <div className="mt-1 text-2xl font-bold">{seniority}</div>
        </div>
      </div>
    </div>
  );
}
