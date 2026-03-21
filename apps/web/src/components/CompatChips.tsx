const chipColors: Record<string, string> = {
  esp32: "var(--color-accent-green)",
  esp32s2: "var(--color-accent-green)",
  esp32s3: "var(--color-accent-green)",
  esp32c3: "var(--color-accent-green)",
  esp32c6: "var(--color-accent-green)",
  stm32: "var(--color-accent-blue)",
  rp2040: "var(--color-accent-purple)",
  nrf52: "var(--color-accent-blue)",
  avr: "var(--color-accent-orange)",
  samd: "var(--color-accent-red)",
};

export function CompatChips({ platforms }: { platforms: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {platforms.map((p) => {
        const color = chipColors[p] ?? "var(--color-text-muted)";
        return (
          <span
            key={p}
            className="rounded-md px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-medium uppercase"
            style={{
              color,
              border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
            }}
          >
            {p}
          </span>
        );
      })}
    </div>
  );
}
