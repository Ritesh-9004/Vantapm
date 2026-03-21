CREATE TABLE "compatibility" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" integer NOT NULL,
	"version_id" integer,
	"platform" varchar(30) NOT NULL,
	"status" varchar(20) DEFAULT 'unknown' NOT NULL,
	"tested_version" varchar(50),
	"notes" text,
	"tested_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "download_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"display_name" varchar(300) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"repository" text DEFAULT '' NOT NULL,
	"homepage" text,
	"license" varchar(100) DEFAULT 'unknown' NOT NULL,
	"category" varchar(50) DEFAULT 'other' NOT NULL,
	"frameworks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"platforms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"peripherals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sensors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"components" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"latest_version" varchar(50),
	"quality_score" integer DEFAULT 0 NOT NULL,
	"quality_breakdown" jsonb,
	"memory_flash_kb" real,
	"memory_ram_kb" real,
	"downloads_total" integer DEFAULT 0 NOT NULL,
	"downloads_monthly" integer DEFAULT 0 NOT NULL,
	"stars" integer DEFAULT 0 NOT NULL,
	"publisher_id" integer,
	"github_owner" varchar(200),
	"github_repo" varchar(200),
	"last_commit_at" timestamp,
	"has_ci" boolean DEFAULT false NOT NULL,
	"has_tests" boolean DEFAULT false NOT NULL,
	"has_examples" boolean DEFAULT false NOT NULL,
	"readme_length" integer DEFAULT 0 NOT NULL,
	"open_issues_count" integer DEFAULT 0 NOT NULL,
	"total_issues_count" integer DEFAULT 0 NOT NULL,
	"search_text" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "packages_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "publishers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" varchar(200) NOT NULL,
	"domain" varchar(255),
	"is_verified" boolean DEFAULT false NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "publishers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" integer NOT NULL,
	"version" varchar(50) NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"checksum_sha256" varchar(64),
	"tarball_url" text,
	"memory" jsonb,
	"dependencies" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"idf_version" varchar(50),
	"changelog" text
);
--> statement-breakpoint
ALTER TABLE "compatibility" ADD CONSTRAINT "compatibility_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compatibility" ADD CONSTRAINT "compatibility_version_id_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "download_stats" ADD CONSTRAINT "download_stats_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_publisher_id_publishers_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "public"."publishers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "versions" ADD CONSTRAINT "versions_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_compat_pkg" ON "compatibility" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "idx_compat_platform" ON "compatibility" USING btree ("platform");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_downloads_pkg_date" ON "download_stats" USING btree ("package_id","date");--> statement-breakpoint
CREATE INDEX "idx_packages_category" ON "packages" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_packages_quality" ON "packages" USING btree ("quality_score");--> statement-breakpoint
CREATE INDEX "idx_packages_downloads" ON "packages" USING btree ("downloads_monthly");--> statement-breakpoint
CREATE INDEX "idx_packages_updated" ON "packages" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_versions_pkg_ver" ON "versions" USING btree ("package_id","version");