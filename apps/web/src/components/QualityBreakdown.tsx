const labels: Record<string, string> = {
  maintenance: "Maintenance",
  ci_tests: "CI & Tests",
  documentation: "Docs",
  popularity: "Popularity",
  compatibility: "Compat",
};

export function QualityBreakdown({
  breakdown,
  total,
}: {
  breakdown: Record<string, number>;
  total: number;
}) {
  return (
    <div className="space-y-4">
      {/* Big score */}
      <div className="flex items-center justify-center">
        <div className="relative h-24 w-24">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--color-accent-green)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(total / 100) * 263.9} 263.9`}
              className="animate-[score-fill_1s_ease-out]"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-mono)] text-xl font-bold text-[var(--color-accent-green)]">
            {total}
          </span>
        </div>
      </div>

      {/* Individual bars */}
      <div className="space-y-2.5">
        {Object.entries(breakdown).map(([key, value]) => (
          <div key={key}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-[var(--color-text-secondary)]">
                {labels[key] ?? key}
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[var(--color-text-muted)]">
                {value}/20
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-bg)]">
              <div
                className="h-full rounded-full bg-[var(--color-accent-green)] transition-all"
                style={{ width: `${(value / 20) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
