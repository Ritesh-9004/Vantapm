type MemoryEntry = { flash: number; ram: number; heap_peak: number };

function formatBytes(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg)]">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function MemoryWidget({
  memory,
}: {
  memory: Record<string, MemoryEntry>;
}) {
  const entries = Object.entries(memory);
  /* Find max of each metric for proportional bars */
  const maxFlash = Math.max(...entries.map(([, m]) => m.flash));
  const maxRam = Math.max(...entries.map(([, m]) => m.ram));
  const maxHeap = Math.max(...entries.map(([, m]) => m.heap_peak));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {entries.map(([platform, m]) => (
        <div key={platform} className="card-surface p-4">
          <h4 className="mb-3 font-[family-name:var(--font-mono)] text-sm font-semibold uppercase text-[var(--color-text-secondary)]">
            {platform}
          </h4>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs text-[var(--color-text-muted)]">
                <span>Flash</span>
                <span className="font-[family-name:var(--font-mono)]">
                  {formatBytes(m.flash)}
                </span>
              </div>
              <Bar value={m.flash} max={maxFlash * 1.2} color="var(--color-accent-blue)" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-[var(--color-text-muted)]">
                <span>RAM</span>
                <span className="font-[family-name:var(--font-mono)]">
                  {formatBytes(m.ram)}
                </span>
              </div>
              <Bar value={m.ram} max={maxRam * 1.2} color="var(--color-accent-green)" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-[var(--color-text-muted)]">
                <span>Heap Peak</span>
                <span className="font-[family-name:var(--font-mono)]">
                  {formatBytes(m.heap_peak)}
                </span>
              </div>
              <Bar value={m.heap_peak} max={maxHeap * 1.2} color="var(--color-accent-orange)" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
