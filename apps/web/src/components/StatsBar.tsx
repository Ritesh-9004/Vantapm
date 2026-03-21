"use client";

import { useEffect, useState } from "react";

type StatsResponse = {
  packages: number;
  platforms: number;
  frameworks: number;
};

function formatPackages(n: number): string {
  return n >= 1000 ? `${n.toLocaleString()}+` : `${n}`;
}

export function StatsBar() {
  const [stats, setStats] = useState<StatsResponse>({
    packages: 0,
    platforms: 0,
    frameworks: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${api}/packages/stats`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as StatsResponse;
        if (mounted) {
          setStats(data);
        }
      } catch {
      }
    }

    fetchStats();
    const id = setInterval(fetchStats, 15000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const items = [
    { label: "Packages", value: formatPackages(stats.packages), icon: "📦" },
    { label: "Platforms", value: String(stats.platforms), icon: "🔌" },
    { label: "Frameworks", value: String(stats.frameworks), icon: "⚙️" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-3">
      {items.map((s) => (
        <div
          key={s.label}
          className="card-surface flex flex-col items-center gap-1 py-5"
        >
          <span className="text-2xl">{s.icon}</span>
          <span className="font-[family-name:var(--font-syne)] text-xl font-bold text-[var(--color-accent-green)]">
            {s.value}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
