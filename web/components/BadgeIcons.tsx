// Premium Cypherpunk shield — gold with Z cutout
export function CypherpunkShield({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ filter: "drop-shadow(0 0 4px rgba(245,166,35,0.4))", flexShrink: 0 }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#F5A623" />
      <path d="M12 3l7 2.5v6.5c0 4-4 7.2-7 9" fill="rgba(255,255,255,0.15)" />
      <path d="M9 8h6l-6 8h6" stroke="#050505" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Standard verified checkmark — simple circle check
export function VerifiedCheck({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
