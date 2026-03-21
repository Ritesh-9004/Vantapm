type CompatRow = {
  platform: string;
  framework: string;
  status: string;
  testedVersion: string;
};

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  full: { label: "Full", color: "var(--color-accent-green)", icon: "●" },
  partial: { label: "Partial", color: "var(--color-accent-orange)", icon: "◐" },
  experimental: { label: "Experimental", color: "var(--color-accent-purple)", icon: "◌" },
  none: { label: "None", color: "var(--color-text-muted)", icon: "○" },
};

export function CompatMatrix({ rows }: { rows: CompatRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
            <th className="pb-2 pr-4">Platform</th>
            <th className="pb-2 pr-4">Framework</th>
            <th className="pb-2 pr-4">Status</th>
            <th className="pb-2">Tested Version</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {rows.map((row, i) => {
            const cfg = statusConfig[row.status] ?? statusConfig["none"]!;
            return (
              <tr key={i} className="text-[var(--color-text-secondary)]">
                <td className="py-2.5 pr-4 font-[family-name:var(--font-mono)]">
                  {row.platform}
                </td>
                <td className="py-2.5 pr-4">{row.framework}</td>
                <td className="py-2.5 pr-4">
                  <span
                    className="inline-flex items-center gap-1.5 font-medium"
                    style={{ color: cfg.color }}
                  >
                    <span>{cfg.icon}</span>
                    {cfg.label}
                  </span>
                </td>
                <td className="py-2.5 font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                  {row.testedVersion || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
