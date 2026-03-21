"use client";

import { QualityBadge } from "./QualityBadge";
import { CompatChips } from "./CompatChips";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type PackageSummary = {
  name: string;
  display_name: string;
  description: string;
  platforms: string[];
  frameworks: string[];
  latest_version: string;
  quality_score: number;
  stars: number;
  downloads_monthly: number;
  updated_at: string;
  publisher_name?: string;
};

type FeaturedPackagesProps = {
  limit?: number;
  layout?: "grid" | "list";
};

function formatDownloads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatUpdated(updatedAt: string): string {
  const date = new Date(updatedAt);
  const diffMs = Date.now() - date.getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (days < 1) return "updated today";
  if (days === 1) return "updated 1d ago";
  return `updated ${days}d ago`;
}

function withQuery(
  basePath: string,
  params: URLSearchParams,
  updates: Record<string, string>
): string {
  const next = new URLSearchParams(params.toString());
  Object.entries(updates).forEach(([key, value]) => next.set(key, value));
  return `${basePath}?${next.toString()}`;
}

export function FeaturedPackages({
  limit = 6,
  layout = "grid",
}: FeaturedPackagesProps) {
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchPackages() {
      try {
        // Fetch packages from real database; supports live query filters from URL.
        const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const q = searchParams.get("q")?.trim();
        const category = searchParams.get("category")?.trim();
        const platform = searchParams.get("platform")?.trim();
        const framework = searchParams.get("framework")?.trim();
        const sort = searchParams.get("sort")?.trim() || "quality";
        const order = searchParams.get("order")?.trim() || "desc";

        const url = new URL(q ? `${api}/search` : `${api}/packages`);
        url.searchParams.set("page", "1");
        url.searchParams.set("per_page", String(limit));
        url.searchParams.set("sort", sort);
        url.searchParams.set("order", order);

        if (q) url.searchParams.set("q", q);
        if (category && category.toLowerCase() !== "all") {
          url.searchParams.set("category", category.toLowerCase());
        }
        if (platform) url.searchParams.set("platform", platform.toLowerCase());
        if (framework) url.searchParams.set("framework", framework.toLowerCase());

        const res = await fetch(url.toString(), { cache: "no-store" });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setPackages(data.data || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Failed to fetch packages:", err);
        setError(err instanceof Error ? err.message : "Failed to load packages");
      } finally {
        setLoading(false);
      }
    }

    fetchPackages();
  }, [searchParams, limit]);

  if (loading) {
    return (
      <div className={layout === "list" ? "space-y-4" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
        {[...Array(layout === "list" ? Math.min(limit, 8) : 6)].map((_, i) => (
          <div
            key={i}
            className={
              layout === "list"
                ? "card-surface h-36 animate-pulse bg-[var(--color-bg-card)] p-5"
                : "card-surface h-48 animate-pulse bg-[var(--color-bg-card)] p-5"
            }
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500 bg-red-50 p-4 text-sm text-red-700">
        Failed to load packages: {error}
      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-sm text-[var(--color-text-muted)]">
        No packages found for current filters.
      </div>
    );
  }

  if (layout === "list") {
    const rawParams = new URLSearchParams(searchParams.toString());

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {total.toLocaleString()} packages
          </p>
          <div className="flex items-center gap-2 text-xs">
            <Link
              href={withQuery("/packages", rawParams, { sort: "quality", order: "desc" })}
              className="rounded-md border border-[var(--color-accent-green)] px-2.5 py-1 text-[var(--color-accent-green)]"
            >
              Quality
            </Link>
            <Link
              href={withQuery("/packages", rawParams, { sort: "downloads", order: "desc" })}
              className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-text-secondary)] hover:border-[var(--color-accent-green)]"
            >
              Downloads
            </Link>
            <Link
              href={withQuery("/packages", rawParams, { sort: "updated", order: "desc" })}
              className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-text-secondary)] hover:border-[var(--color-accent-green)]"
            >
              Updated
            </Link>
            <Link
              href={withQuery("/packages", rawParams, { sort: "name", order: "asc" })}
              className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-text-secondary)] hover:border-[var(--color-accent-green)]"
            >
              A-Z
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {packages.map((pkg) => (
            <a
              key={pkg.name}
              href={`/packages/${pkg.name}`}
              className="card-surface flex flex-col gap-4 p-5 transition-all hover:border-[var(--color-accent-green)] lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-[family-name:var(--font-mono)] text-lg font-semibold text-[var(--color-text-primary)]">
                    {pkg.name}
                  </h3>
                  <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                    v{pkg.latest_version}
                  </span>
                </div>

                <p className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">
                  {pkg.description}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <CompatChips platforms={pkg.platforms} />
                  {pkg.frameworks.slice(0, 3).map((framework) => (
                    <span
                      key={`${pkg.name}-${framework}`}
                      className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase text-[var(--color-text-muted)]"
                    >
                      {framework}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 items-start gap-5 lg:min-w-[150px] lg:flex-col lg:items-end lg:gap-2">
                <div className="text-right">
                  <div className="text-3xl font-bold text-[var(--color-accent-green)]">
                    {pkg.quality_score}
                  </div>
                  <div className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">
                    quality
                  </div>
                </div>
                <div className="space-y-1 text-right text-xs text-[var(--color-text-muted)]">
                  <div>⭐ {pkg.stars?.toLocaleString() || 0}</div>
                  <div>{formatUpdated(pkg.updated_at)}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <a
          key={pkg.name}
          href={`/packages/${pkg.name}`}
          className="card-surface flex flex-col gap-3 p-5 transition-all hover:border-[var(--color-accent-green)]"
        >
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[var(--color-text-primary)]">
                {pkg.name}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                by {pkg.publisher_name || "unknown"}
              </p>
            </div>
            <QualityBadge score={pkg.quality_score} />
          </div>

          {/* Description */}
          <p className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">
            {pkg.description}
          </p>

          {/* Compat chips */}
          <CompatChips platforms={pkg.platforms} />

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-muted)]">
            <span className="font-[family-name:var(--font-mono)]">
              v{pkg.latest_version}
            </span>
            <span>⭐ {pkg.stars || 0}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
