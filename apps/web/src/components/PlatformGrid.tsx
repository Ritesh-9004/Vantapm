const platforms = [
  {
    name: "ESP32",
    icon: "⚡",
    description: "Wi-Fi & Bluetooth SoCs by Espressif",
    color: "var(--color-accent-green)",
    boards: ["ESP32", "ESP32-S2", "ESP32-S3", "ESP32-C3", "ESP32-C6"],
  },
  {
    name: "STM32",
    icon: "🔧",
    description: "ARM Cortex-M series by STMicroelectronics",
    color: "var(--color-accent-blue)",
    boards: ["STM32F1", "STM32F4", "STM32H7", "STM32L4"],
  },
  {
    name: "RP2040",
    icon: "🍓",
    description: "Dual-core ARM by Raspberry Pi",
    color: "var(--color-accent-purple)",
    boards: ["Raspberry Pi Pico", "Pico W"],
  },
  {
    name: "nRF52",
    icon: "📡",
    description: "BLE SoCs by Nordic Semiconductor",
    color: "var(--color-accent-blue)",
    boards: ["nRF52832", "nRF52840"],
  },
  {
    name: "AVR",
    icon: "🎯",
    description: "Classic 8-bit MCUs by Microchip",
    color: "var(--color-accent-orange)",
    boards: ["ATmega328P", "ATmega2560"],
  },
  {
    name: "SAMD",
    icon: "🔋",
    description: "ARM Cortex-M0+ by Microchip",
    color: "var(--color-accent-red)",
    boards: ["SAMD21", "SAMD51"],
  },
];

export function PlatformGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {platforms.map((p) => (
        <a
          key={p.name}
          href={`/packages?platform=${p.name.toLowerCase()}`}
          className="card-surface flex flex-col gap-2 p-5 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{p.icon}</span>
            <h3
              className="font-[family-name:var(--font-syne)] text-lg font-semibold"
              style={{ color: p.color }}
            >
              {p.name}
            </h3>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {p.description}
          </p>
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {p.boards.map((b) => (
              <span
                key={b}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]"
              >
                {b}
              </span>
            ))}
          </div>
        </a>
      ))}
    </div>
  );
}
