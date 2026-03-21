import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  serial,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Publishers ──────────────────────────────────────────────

export const publishers = pgTable("publishers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  display_name: varchar("display_name", { length: 200 }).notNull(),
  domain: varchar("domain", { length: 255 }),
  is_verified: boolean("is_verified").notNull().default(false),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// ─── Packages ────────────────────────────────────────────────

export const packages = pgTable(
  "packages",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull().unique(),
    display_name: varchar("display_name", { length: 300 }).notNull(),
    description: text("description").notNull().default(""),
    repository: text("repository").notNull().default(""),
    homepage: text("homepage"),
    license: varchar("license", { length: 100 }).notNull().default("unknown"),
    category: varchar("category", { length: 50 }).notNull().default("other"),

    // Array fields stored as JSONB
    frameworks: jsonb("frameworks").$type<string[]>().notNull().default([]),
    platforms: jsonb("platforms").$type<string[]>().notNull().default([]),
    peripherals: jsonb("peripherals").$type<string[]>().notNull().default([]),
    sensors: jsonb("sensors").$type<string[]>().notNull().default([]),
    components: jsonb("components").$type<string[]>().notNull().default([]),

    latest_version: varchar("latest_version", { length: 50 }),

    // Quality
    quality_score: integer("quality_score").notNull().default(0),
    quality_breakdown: jsonb("quality_breakdown").$type<{
      maintenance: number;
      ci_tests: number;
      documentation: number;
      popularity: number;
      compatibility: number;
    }>(),

    // Memory (latest version, default platform)
    memory_flash_kb: real("memory_flash_kb"),
    memory_ram_kb: real("memory_ram_kb"),

    // Stats
    downloads_total: integer("downloads_total").notNull().default(0),
    downloads_monthly: integer("downloads_monthly").notNull().default(0),
    stars: integer("stars").notNull().default(0),

    // Publisher
    publisher_id: integer("publisher_id").references(() => publishers.id),

    // GitHub crawler metadata
    github_owner: varchar("github_owner", { length: 200 }),
    github_repo: varchar("github_repo", { length: 200 }),
    last_commit_at: timestamp("last_commit_at"),
    has_ci: boolean("has_ci").notNull().default(false),
    has_tests: boolean("has_tests").notNull().default(false),
    has_examples: boolean("has_examples").notNull().default(false),
    readme_length: integer("readme_length").notNull().default(0),
    open_issues_count: integer("open_issues_count").notNull().default(0),
    total_issues_count: integer("total_issues_count").notNull().default(0),

    // Full-text search vector (populated by trigger or app)
    search_text: text("search_text").notNull().default(""),

    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_packages_category").on(table.category),
    index("idx_packages_quality").on(table.quality_score),
    index("idx_packages_downloads").on(table.downloads_monthly),
    index("idx_packages_updated").on(table.updated_at),
  ]
);

// ─── Package Versions ────────────────────────────────────────

export const versions = pgTable(
  "versions",
  {
    id: serial("id").primaryKey(),
    package_id: integer("package_id")
      .notNull()
      .references(() => packages.id, { onDelete: "cascade" }),
    version: varchar("version", { length: 50 }).notNull(),
    published_at: timestamp("published_at").defaultNow().notNull(),
    checksum_sha256: varchar("checksum_sha256", { length: 64 }),
    tarball_url: text("tarball_url"),

    // Per-version memory footprint per platform (JSONB)
    memory: jsonb("memory").$type<
      Record<string, { flash_kb: number; ram_kb: number }>
    >(),

    // Dependencies: { "package_name": "^1.2.0" }
    dependencies: jsonb("dependencies").$type<Record<string, string>>().notNull().default({}),

    // IDF version constraint
    idf_version: varchar("idf_version", { length: 50 }),

    // Changelog / release notes
    changelog: text("changelog"),
  },
  (table) => [
    uniqueIndex("idx_versions_pkg_ver").on(table.package_id, table.version),
  ]
);

// ─── Platform Compatibility ──────────────────────────────────

export const compatibility = pgTable(
  "compatibility",
  {
    id: serial("id").primaryKey(),
    package_id: integer("package_id")
      .notNull()
      .references(() => packages.id, { onDelete: "cascade" }),
    version_id: integer("version_id").references(() => versions.id, {
      onDelete: "cascade",
    }),
    platform: varchar("platform", { length: 30 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("unknown"), // tested | untested | broken | unknown
    tested_version: varchar("tested_version", { length: 50 }),
    notes: text("notes"),
    tested_at: timestamp("tested_at"),
  },
  (table) => [
    index("idx_compat_pkg").on(table.package_id),
    index("idx_compat_platform").on(table.platform),
  ]
);

// ─── Download Stats (daily aggregation) ──────────────────────

export const download_stats = pgTable(
  "download_stats",
  {
    id: serial("id").primaryKey(),
    package_id: integer("package_id")
      .notNull()
      .references(() => packages.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => [
    uniqueIndex("idx_downloads_pkg_date").on(table.package_id, table.date),
  ]
);

// ─── Type exports for drizzle queries ────────────────────────

export type InsertPackage = typeof packages.$inferInsert;
export type SelectPackage = typeof packages.$inferSelect;
export type InsertVersion = typeof versions.$inferInsert;
export type SelectVersion = typeof versions.$inferSelect;
export type InsertPublisher = typeof publishers.$inferInsert;
export type SelectPublisher = typeof publishers.$inferSelect;
