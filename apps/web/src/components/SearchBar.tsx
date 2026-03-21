"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed) {
        router.push(`/packages?q=${encodeURIComponent(trimmed)}`);
      }
    },
    [query, router],
  );

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="flex items-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-colors focus-within:border-[var(--color-accent-green)]">
        {/* Prompt symbol */}
        <span className="pl-4 font-[family-name:var(--font-mono)] text-[var(--color-accent-green)]">
          ▸
        </span>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search packages, platforms, peripherals..."
          className="flex-1 bg-transparent px-3 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none"
        />

        <button
          type="submit"
          className="mr-2 rounded-lg bg-[var(--color-accent-green-dim)] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-green)]"
        >
          Search
        </button>
      </div>
    </form>
  );
}
