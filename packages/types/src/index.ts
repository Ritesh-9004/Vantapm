// ─── Platform & Hardware ──────────────────────────────────────

/** Supported MCU platforms */
export type Platform =
  | "esp32"
  | "esp32s2"
  | "esp32s3"
  | "esp32c3"
  | "esp32c6"
  | "esp32h2"
  | "esp32p4"
  | "stm32"
  | "rp2040"
  | "rp2350"
  | "nrf52"
  | "avr"
  | "samd";

/** Supported firmware frameworks */
export type Framework =
  | "arduino"
  | "espidf"
  | "micropython"
  | "zephyr"
  | "stm32hal"
  | "picoSDK"
  | "bare-metal";

/** Hardware peripherals a library may use */
export type Peripheral =
  | "i2c"
  | "spi"
  | "uart"
  | "adc"
  | "dac"
  | "pwm"
  | "gpio"
  | "can"
  | "usb"
  | "sdio"
  | "i2s"
  | "rmt"
  | "ledc"
  | "pcnt"
  | "mcpwm"
  | "twai"
  | "ethernet";

/** Package categories */
export type Category =
  | "sensor"
  | "display"
  | "communication"
  | "iot"
  | "motor"
  | "audio"
  | "ai"
  | "security"
  | "power"
  | "filesystem"
  | "protocol"
  | "gui"
  | "storage"
  | "utility"
  | "other";

// ─── Package Types ────────────────────────────────────────────

/** Memory footprint of a package */
export interface MemoryFootprint {
  flash_kb: number;
  ram_kb: number;
}

/** Quality score breakdown */
export interface QualityBreakdown {
  maintenance: number;    // 0-20 — last commit recency
  ci_tests: number;       // 0-20 — has CI, has tests
  documentation: number;  // 0-20 — readme quality, examples
  popularity: number;     // 0-20 — stars, downloads
  compatibility: number;  // 0-20 — declared targets, frameworks
}

/** Compatibility status per platform */
export type CompatStatus = "tested" | "untested" | "broken" | "unknown";

/** Platform compatibility entry */
export interface PlatformCompat {
  platform: Platform;
  status: CompatStatus;
  tested_version?: string;
  notes?: string;
}

/** A single version of a package */
export interface PackageVersion {
  version: string;
  published_at: string;
  checksum_sha256: string;
  tarball_url: string;
  memory?: Record<Platform, MemoryFootprint>;
  dependencies: Record<string, string>; // name -> semver range
  idf_version?: string;
}

/** Full package as returned by the API */
export interface Package {
  name: string;
  display_name: string;
  description: string;
  repository: string;
  homepage?: string;
  license: string;
  category: Category;

  frameworks: Framework[];
  platforms: Platform[];
  peripherals: Peripheral[];
  sensors?: string[];       // e.g. ["BME280", "BMP280"]
  components?: string[];    // e.g. ["ILI9341", "SSD1306"]

  latest_version: string;
  versions: PackageVersion[];

  quality_score: number;
  quality_breakdown: QualityBreakdown;
  compatibility: PlatformCompat[];

  memory?: MemoryFootprint; // latest version, default platform

  downloads_total: number;
  downloads_monthly: number;
  stars: number;

  publisher: Publisher;

  created_at: string;
  updated_at: string;
}

/** Package summary for list/search views */
export interface PackageSummary {
  name: string;
  display_name: string;
  description: string;
  category: Category;
  frameworks: Framework[];
  platforms: Platform[];
  latest_version: string;
  quality_score: number;
  memory?: MemoryFootprint;
  downloads_monthly: number;
  stars: number;
  updated_at: string;
  publisher_name: string;
  is_verified: boolean;
}

/** Publisher / author */
export interface Publisher {
  name: string;
  display_name: string;
  domain?: string;
  is_verified: boolean;
  avatar_url?: string;
}

// ─── API Request/Response Types ──────────────────────────────

/** Search query parameters */
export interface SearchParams {
  q?: string;
  framework?: Framework;
  platform?: Platform;
  category?: Category;
  min_quality?: number;
  sort?: "quality" | "downloads" | "updated" | "name";
  order?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

/** Paginated list response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/** API error response */
export interface ApiError {
  error: string;
  message: string;
  status: number;
  suggestion?: string;
}
