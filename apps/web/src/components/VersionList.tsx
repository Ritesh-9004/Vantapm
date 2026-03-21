type Version = {
  version: string;
  date: string;
  changelog: string;
};

export function VersionList({ versions }: { versions: Version[] }) {
  return (
    <div className="space-y-3">
      {versions.map((v, i) => (
        <div
          key={v.version}
          className="flex items-start gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3"
        >
          {/* Version tag */}
          <span
            className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 font-[family-name:var(--font-mono)] text-xs font-semibold ${
              i === 0
                ? "bg-[var(--color-accent-green-dim)] text-[var(--color-accent-green)]"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            v{v.version}
          </span>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {v.changelog}
            </p>
          </div>

          {/* Date */}
          <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
            {v.date}
          </span>
        </div>
      ))}
    </div>
  );
}
