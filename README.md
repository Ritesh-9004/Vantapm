<div align="center">
  <h1>📦 VantaPM</h1>
  <strong>Universal MCU package manager &amp; registry</strong>
  <br /><br />
  <hr />

  <img alt="Version" src="https://img.shields.io/badge/version-0.2.0-blue?style=for-the-badge" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" />
  <img alt="Language" src="https://img.shields.io/badge/language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Runtime" src="https://img.shields.io/badge/runtime-Bun-f9f1e1?style=for-the-badge&logo=bun&logoColor=black" />
  <img alt="Framework" src="https://img.shields.io/badge/framework-Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img alt="Crawler" src="https://img.shields.io/badge/crawler-Python_3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img alt="Database" src="https://img.shields.io/badge/database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <br /><br />
  <a href="https://github.com/Ritesh-9004/Vantapm/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/Ritesh-9004/Vantapm?style=for-the-badge&logo=github&color=yellow" /></a>
  <a href="https://github.com/Ritesh-9004/Vantapm/issues"><img alt="Issues" src="https://img.shields.io/github/issues/Ritesh-9004/Vantapm?style=for-the-badge&logo=github&color=red" /></a>
  <a href="https://vantapm.vercel.app"><img alt="Registry" src="https://img.shields.io/badge/registry-live-brightgreen?style=for-the-badge&logo=vercel&logoColor=white" /></a>
  <a href="https://vantapm.onrender.com/health"><img alt="API" src="https://img.shields.io/badge/API-live-brightgreen?style=for-the-badge&logo=render&logoColor=white" /></a>

  <hr />
</div>

### Find, install, and publish firmware libraries for any microcontroller — ESP32, STM32, RP2040, nRF52, and more.

Like [pub.dev](https://pub.dev) (discovery) + [npm](https://www.npmjs.com) (workflow) — but purpose-built for embedded firmware.

---

## Who should follow which steps?

- **End users (recommended path):** Use the prebuilt CLI binary from GitHub Releases. No Node.js, Bun, Docker, or repo clone required.
- **Contributors/maintainers:** Use the monorepo setup below to run web, API, crawler, and database locally.

## End User CLI Setup (No Repo Clone)

### 1. Download the CLI binary

Go to [Releases](https://github.com/Ritesh-9004/Vantapm/releases) and download the latest asset for your OS:

- **Windows:** `vanta.exe`
- **macOS:** `vanta`
- **Linux:** `vanta-linux`

### 2. Put it in your PATH

- **Windows:** place `vanta.exe` in a folder like `C:\Tools\vanta\` and add that folder to PATH.
- **macOS/Linux:** move binary to `/usr/local/bin/vanta` and make it executable.

```bash
chmod +x vanta
sudo mv vanta /usr/local/bin/vanta
```

### 3. Use the CLI

```bash
vanta doctor
vanta init
vanta search bme280 --platform esp32
vanta install bblanchon/ArduinoJson
vanta list
```

### Is `.exe` ready right now?

- The automation is ready in [.github/workflows/release.yml](.github/workflows/release.yml).
- `vanta.exe` is attached automatically when a new tag (for example `v0.2.1`) is pushed.

---

## Architecture

```
vanta/
├── apps/
│   ├── web/         → Registry website (Next.js 15, Tailwind CSS)
│   ├── api/         → REST API (Hono, Bun, Drizzle ORM)
│   └── crawler/     → GitHub auto-indexer (Python, PyGithub)
├── packages/
│   ├── types/       → Shared TypeScript types
│   └── core/        → Business logic (boards, semver, quality)
├── docker-compose.yml → PostgreSQL + pgAdmin
└── turbo.json        → Turborepo orchestration
```

| Component | Tech Stack |
|-----------|------------|
| **Web** | Next.js 15 · React 19 · Tailwind CSS 4 · Lucide Icons |
| **API** | Hono · Bun · Drizzle ORM · PostgreSQL 16 · Zod |
| **Crawler** | Python 3.10+ · PyGithub · httpx · APScheduler · psycopg3 |
| **Monorepo** | Turborepo · pnpm workspaces |

## Features

- **Browse & search** real embedded libraries crawled from GitHub
- **Quality scores (0–100)** auto-computed from maintenance, docs, tests, popularity, compatibility
- **Hardware compatibility matrix** — platforms & frameworks per package
- **Publisher info** — linked to GitHub owner profiles
- **Version detection** — from manifests (`library.properties`, `idf_component.yml`) and GitHub releases
- **Framework awareness** — Arduino, ESP-IDF, MicroPython, Zephyr, bare-metal

## Contributor Setup (Monorepo)

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20
- [pnpm](https://pnpm.io/) ≥ 10
- [Bun](https://bun.sh/) (for the API)
- [Python](https://www.python.org/) ≥ 3.10 (for the crawler)
- [Docker](https://www.docker.com/) (optional, only if you want local PostgreSQL)

### Quick Start

#### 1. Clone & install

```bash
git clone https://github.com/Ritesh-9004/Vantapm.git
cd vanta
pnpm install
```

#### 2. Configure the database

```bash
# Option A (local PostgreSQL via Docker)
docker compose up -d
```

Local mode spins up PostgreSQL 16 on port `5432` (user: `postgres`, password: `dev`, database: `vanta`).

If you're using a hosted database (for example Neon), skip Docker and set `DATABASE_URL` in `apps/api/.env` to your hosted connection string.

#### 3. Set up environment variables

```bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env.local

# Crawler (requires a GitHub token)
cp apps/crawler/.env.example apps/crawler/.env
# Then edit apps/crawler/.env and add your GitHub token
```

> **GitHub Token**: Create a [Personal Access Token (Classic)](https://github.com/settings/tokens) with scopes: `public_repo`, `read:org`, `read:user`.

#### 4. Push the database schema

```bash
pnpm db:push
```

#### 5. Run the crawler (one-time seed)

```bash
cd apps/crawler
pip install -r requirements.txt
python main.py
```

The crawler discovers up to 50 MCU libraries from GitHub per run (configurable). It auto-stops after 10 minutes maximum.

#### 6. Start local services

```bash
# From the repo root
pnpm dev
```

This starts:
- **Web** → [http://localhost:3000](http://localhost:3000)
- **API** → [http://localhost:4000](http://localhost:4000)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/packages` | List packages (paginated, with publisher info) |
| `GET` | `/packages/stats` | Registry stats (total packages, platforms, frameworks) |
| `GET` | `/packages/:name` | Package detail (full metadata, quality breakdown) |
| `GET` | `/search?q=...` | Full-text search across packages |

## Project Scripts

```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Production build
pnpm lint         # TypeScript type checking
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio (DB browser)
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Run pending migrations
```

## Crawler Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `GITHUB_TOKEN` | — | **Required.** GitHub PAT for API access |
| `MAX_REPOS_PER_RUN` | `50` | Max repos to process per crawl |
| `MIN_STARS` | `5` | Minimum stars to consider a repo |
| `CRAWL_INTERVAL_HOURS` | `6` | Re-crawl interval (scheduler mode) |
| `RESCAN_SUCCESS_AFTER_HOURS` | `24` | Skip recently-scanned repos |

Run with `--schedule` flag for continuous mode:
```bash
python main.py --schedule
```

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)
