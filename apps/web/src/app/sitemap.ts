import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vantapm.vercel.app";
const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type PackageListResponse = {
  data?: Array<{ name: string; updated_at?: string }>;
  total_pages?: number;
};

async function fetchPackagePage(page: number): Promise<PackageListResponse> {
  const url = new URL(`${apiBase}/packages`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", "100");
  url.searchParams.set("sort", "updated");

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return {};
  }

  return response.json();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/packages`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/platforms`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const firstPage = await fetchPackagePage(1);
  const totalPages = Math.max(firstPage.total_pages || 1, 1);
  const pageResponses = [firstPage];

  for (let page = 2; page <= totalPages; page += 1) {
    pageResponses.push(await fetchPackagePage(page));
  }

  const packageRoutes: MetadataRoute.Sitemap = pageResponses
    .flatMap((response) => response.data || [])
    .map((pkg) => ({
      url: `${siteUrl}/packages/${pkg.name}`,
      lastModified: pkg.updated_at ? new Date(pkg.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...packageRoutes];
}