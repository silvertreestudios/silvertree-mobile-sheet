# Silvertree Mobile Sheet

A React Native mobile application for **Pathfinder 2nd Edition** that allows players to manage their character sheet on the go.

## Overview

Silvertree Mobile Sheet connects to a [FoundryVTT REST API Relay](https://foundryvtt-rest-api-relay.fly.dev/docs/api) server to read and update a player's PF2e character sheet in real time. The UI is designed after the Pathbuilder 2e mobile application.

## Features

- **Connection Setup** – Enter your relay server URL and API key, then select your Foundry world
- **Character Selection** – Browse and select player characters from your connected Foundry world
- **Character Sheet Tabs**
  - **Overview** – HP (with +/− controls), AC, Perception, Speed, Saving Throws, Hero Points, Currency, Conditions
  - **Abilities** – STR/DEX/CON/INT/WIS/CHA scores and modifiers
  - **Skills** – All 16 PF2e skills with proficiency rank and modifier, tap to roll
  - **Feats & Actions** – Actions, reactions, feats, features, and spells with detail modal
  - **Inventory** – Equipment categorized by type with bulk, price, and detail modal

## Tech Stack

- [Expo](https://expo.dev) (React Native)
- [React Navigation](https://reactnavigation.org) (native stack)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) (persistent configuration)
- TypeScript

## Getting Started

### Prerequisites

- Node.js v18+
- [Expo Go](https://expo.dev/go) app on your device **or** an Android/iOS emulator

### Installation

```bash
npm install
```

### Running

```bash
# Start the Expo development server
npm start

# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

### Configuration

On first launch, enter:
1. **Relay URL** – defaults to `https://foundryvtt-rest-api-relay.fly.dev`
2. **API Key** – obtain from the relay dashboard after creating an account
3. **Foundry World** – tap "Refresh" to see connected worlds, then select yours

## API

The app communicates with the [FoundryVTT REST API Relay](https://foundryvtt-rest-api-relay.fly.dev/docs/api) using the following endpoints:

| Endpoint | Usage |
|----------|-------|
| `GET /clients` | List connected Foundry worlds |
| `GET /search` | Search for actor entities |
| `GET /get` | Retrieve a specific actor by UUID |
| `PUT /update` | Update actor data |
| `POST /increase` | Increase an attribute (e.g., HP) |
| `POST /decrease` | Decrease an attribute (e.g., HP) |
| `POST /roll` | Perform a dice roll |

All requests require the `x-api-key` header with your API key.

## Local E2E Environment

A containerized setup for running the full stack locally — FoundryVTT, relay server, and the mobile app (web build) — for end-to-end testing against a known world snapshot.

### Architecture

```
Browser (GM session)
    │
    ▼ WebSocket (ws://localhost:3010/)
┌─────────────────┐         ┌──────────────┐         ┌──────────────┐
│  FoundryVTT     │◄───────►│ Relay Server │◄───REST──│  Mobile App  │
│  :30000         │ module   │  :3010       │         │  :8081       │
└─────────────────┘         └──────────────┘         └──────────────┘
```

> **Key concept:** The FoundryVTT REST API module runs **client-side in the GM's browser**, not inside the Foundry container. The browser connects to the relay via WebSocket at `ws://localhost:3010/`. A GM must be logged into the Foundry world for the relay to have access to game data.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or [Podman](https://podman.io/) + podman-compose)

> **Note:** All commands below use `docker compose` (Docker Compose v2 plugin). If you're using Podman, substitute `podman-compose` wherever you see `docker compose`.
- A [FoundryVTT](https://foundryvtt.com) license (username, password, and license key)
- [Git LFS](https://git-lfs.github.com/) (for world snapshot binaries)

### Quick Start

#### 1. Bootstrap

```bash
# Pull LFS files (world snapshots)
git lfs pull

# Run the setup script
# Linux/Mac:
chmod +x scripts/setup-local.sh && ./scripts/setup-local.sh
# Windows:
.\scripts\setup-local.ps1
```

#### 2. Configure `.env`

Edit `.env` with your credentials (see [`.env.example`](.env.example) for all options):

```env
FOUNDRY_USERNAME=your-foundry-username
FOUNDRY_PASSWORD=your-foundry-password
FOUNDRY_LICENSE_KEY=XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
FOUNDRY_WORLD=pathfinder2e-test
```

#### 3. Start the stack

```bash
docker compose up --build
```

Wait for all three services to become healthy (relay starts first, then Foundry, then the mobile app). First build takes several minutes.

#### 4. Create a relay API key

```bash
# Option A: Use the seed script
bash docker/relay/seed-api-key.sh

# Option B: Visit http://localhost:3010 in your browser
#   → Register an account → Generate an API key
```

Add the key to `.env`:

```env
RELAY_API_KEY=your-generated-api-key
```

Then restart so all services pick up the key:

```bash
docker compose down && docker compose up -d
```

#### 5. First-time Foundry setup (browser)

These steps are only needed the first time (or after `docker compose down -v` which clears volumes):

1. **Open** http://localhost:30000 in your browser
2. **Accept the EULA** / verify your license when prompted
3. **Log in as Gamemaster** (admin password is `admin`, set in `compose.yml`)
4. **Enable the REST API module:**
   - Go to **Game Settings → Manage Modules**
   - Check **"FoundryVTT REST API"** and save
5. **Verify the module's relay URL:**
   - Go to **Game Settings → Module Settings → REST API**
   - **Relay URL** must be `ws://localhost:3010/` (the browser needs localhost, not the Docker container name)
   - **API Key** should match your `RELAY_API_KEY`
6. **Stay logged in as GM** — the relay only has data access while a GM session is active

> **Tip:** The entrypoint script auto-configures the module settings in the world database. However, on first run, Foundry may require you to manually enable the module and accept the license. After that, subsequent `docker compose up` runs should work without browser interaction (as long as volumes are preserved).

#### 6. Verify the connection

```bash
# Check that FoundryVTT appears as a connected client
curl -s -H "x-api-key: YOUR_API_KEY" http://localhost:3010/clients | jq .
```

You should see a client with your `worldId` and `systemId`. See the [Relay API Debugging Guide](docs/relay-api-guide.md) for more query examples.

### Production Mode (for E2E Tests)

Uses a static Expo web export served by nginx instead of the dev server:

```bash
docker compose -f compose.yml -f compose.prod.yml up --build
```

### Daily Commands

```bash
# Start (dev mode, detached)
docker compose up -d

# Start (production mode for e2e)
docker compose -f compose.yml -f compose.prod.yml up --build

# Stop (preserves volumes — world state, relay DB, etc.)
docker compose down

# Reset all data (removes volumes — clean slate for testing)
docker compose down -v

# View logs
docker compose logs -f foundryvtt
docker compose logs -f relay
docker compose logs -f mobile-app

# Rebuild a single service
docker compose up --build relay
```

### World Data

World data is stored in the **`silvertree-foundryvtt-data`** Docker named volume, which persists across all branches and `docker compose down` (only removed with `docker compose down -v`). This means once you set up FoundryVTT with your world, it's available from any worktree.

The repository's `docker/worlds/` directory contains a seed snapshot for bootstrapping. On first run, FoundryVTT will auto-download and configure itself; just log in and set up your world via the browser.

### Troubleshooting

| Problem | Solution |
|---------|----------|
| Relay container crashes with `sqlite3` error | The Dockerfile recompiles sqlite3 native bindings. If you see this, rebuild: `docker compose build --no-cache relay` |
| Foundry shows "no such file or directory" on entrypoint | Shell scripts have Windows CRLF line endings. Run `git checkout -- docker/` or ensure `.gitattributes` enforces LF. |
| `/clients` returns empty array | A GM must be logged into the Foundry world in a browser. The REST API module is client-side. |
| Module relay URL uses `ws://relay:3010/` | Change to `ws://localhost:3010/` in Foundry module settings — the browser runs on the host, not inside Docker. |
| Port 8081 already in use | Kill the stale process: `netstat -ano \| findstr :8081` then `Stop-Process -Id <PID>` (Windows) or `lsof -ti:8081 \| xargs kill` (Mac/Linux). |
| World data looks stale after `git pull` | Run `git lfs pull` to download updated binary files. |

### Environment Variables

See [`.env.example`](.env.example) for all configurable variables. Key ones:

| Variable | Description |
|----------|-------------|
| `FOUNDRY_USERNAME` | FoundryVTT.com account username |
| `FOUNDRY_PASSWORD` | FoundryVTT.com account password |
| `FOUNDRY_LICENSE_KEY` | Your Foundry license key |
| `FOUNDRY_WORLD` | World folder name to auto-launch (e.g., `pathfinder2e-test`) |
| `RELAY_API_KEY` | Shared API key for relay authentication |
| `RELAY_URL` | WebSocket URL for the REST API module (`ws://localhost:3010/`) |
| `MOBILE_RELAY_URL` | REST URL the mobile app uses (`http://localhost:3010`) |
