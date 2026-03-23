import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Syne } from "next/font/google";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vantapm.vercel.app";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VantaPM — Universal MCU Package Manager & Registry",
    template: "%s | VantaPM",
  },
  description:
    "Discover, compare, and install firmware libraries for ESP32, STM32, RP2040, nRF52, AVR, and more. Explore quality scores, compatibility, versions, and package metadata for embedded development.",
  keywords: [
    "MCU",
    "firmware",
    "package manager",
    "embedded package manager",
    "microcontroller package registry",
    "ESP32",
    "STM32",
    "RP2040",
    "nRF52",
    "Arduino",
    "ESP-IDF",
    "MicroPython",
    "Zephyr",
    "embedded",
    "VantaPM",
    "Vanta",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "VantaPM",
    title: "VantaPM — Universal MCU Package Manager & Registry",
    description:
      "Find embedded libraries for ESP32, STM32, RP2040, nRF52, AVR, and more with quality scores, compatibility data, and install-ready package pages.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VantaPM — Universal MCU Package Manager & Registry",
    description:
      "Discover embedded firmware libraries with compatibility, quality scores, and install-ready package pages.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} ${syne.variable}`}
    >
      <body className="antialiased">
        {/* ── Top Navigation ───────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
          <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <a href="/" className="flex items-center gap-2 font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight">
              <span className="text-[var(--color-accent-green)] glow-green">
                ▸
              </span>
              <span>vanta</span>
            </a>

            <div className="flex items-center gap-6 text-sm text-[var(--color-text-secondary)]">
              <a href="/packages" className="transition-colors hover:text-[var(--color-text-primary)]">
                Packages
              </a>
              <a href="/platforms" className="transition-colors hover:text-[var(--color-text-primary)]">
                Platforms
              </a>
              <a href="/docs" className="transition-colors hover:text-[var(--color-text-primary)]">
                Docs
              </a>
              <a
                href="https://github.com/Ritesh-9004/Vantapm"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[var(--color-text-primary)]"
              >
                GitHub
              </a>
            </div>
          </nav>
        </header>

        {/* ── Page Content ─────────────────────────────────── */}
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer className="border-t border-[var(--color-border)] py-8 text-center text-xs text-[var(--color-text-muted)]">
          <p>
            Built with{" "}
            <span className="text-[var(--color-accent-green)]">♥</span> for the
            embedded community
          </p>
          <p className="mt-1">Vanta — Universal MCU Package Registry</p>
        </footer>
      </body>
    </html>
  );
}
