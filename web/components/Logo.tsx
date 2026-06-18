// Casefy mark — a stylized "C" / signal glyph in the accent purple.
export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="#534AB7" />
      <path
        d="M21.5 11.2a7 7 0 1 0 0 9.6"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="22.5" cy="16" r="2.2" fill="white" />
    </svg>
  );
}
