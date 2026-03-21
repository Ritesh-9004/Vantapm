export function QualityBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? "var(--color-accent-green)"
      : score >= 65
        ? "var(--color-accent-orange)"
        : "var(--color-accent-red)";

  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-[family-name:var(--font-mono)] text-xs font-semibold"
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="4" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
        <circle
          cx="5"
          cy="5"
          r="4"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray={`${(score / 100) * 25.13} 25.13`}
          strokeLinecap="round"
          transform="rotate(-90 5 5)"
        />
      </svg>
      {score}
    </span>
  );
}
