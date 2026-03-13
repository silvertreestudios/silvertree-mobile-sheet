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

## Local E2E Environment (Podman)

A containerized setup for running the full stack locally — FoundryVTT, relay server, and the mobile app (web build) — for end-to-end testing against a known world snapshot.

### Architecture

```
FoundryVTT (port 30000) ──WebSocket──► Relay Server (port 3010) ◄──REST── Mobile App (port 8081)
```

### Prerequisites

- [Podman](https://podman.io/) and [podman-compose](https://github.com/containers/podman-compose) (or Docker/docker-compose)
- Git
- A [FoundryVTT](https://foundryvtt.com) license

### Quick Start

```bash
# 1. Run the setup script (clones relay repo, creates .env)
# Linux/Mac:
chmod +x scripts/setup-local.sh && ./scripts/setup-local.sh
# Windows:
.\scripts\setup-local.ps1

# 2. Edit .env with your FoundryVTT credentials and license key
#    Set FOUNDRY_WORLD to your world folder name

# 3. Place your world snapshot in docker/worlds/<world-name>/

# 4. Start the stack
podman-compose up --build

# 5. First run only: create a relay API key
#    Visit http://localhost:3010, create an account, generate a key
#    OR run: bash docker/relay/seed-api-key.sh
#    Then set RELAY_API_KEY=<key> in .env and restart

# 6. Access the services
#    FoundryVTT:  http://localhost:30000
#    Relay:       http://localhost:3010
#    Mobile App:  http://localhost:8081
```

### Production Mode (for E2E Tests)

Uses a static Expo web export served by nginx instead of the dev server:

```bash
podman-compose -f compose.yml -f compose.prod.yml up --build
```

### Daily Commands

```bash
# Start (dev mode)
podman-compose up

# Start (production mode for e2e)
podman-compose -f compose.yml -f compose.prod.yml up --build

# Stop
podman-compose down

# Reset all data (volumes)
podman-compose down -v

# View logs
podman-compose logs -f foundryvtt
podman-compose logs -f relay
podman-compose logs -f mobile-app
```

### Environment Variables

See [`.env.example`](.env.example) for all configurable variables. Key ones:

| Variable | Description |
|----------|-------------|
| `FOUNDRY_USERNAME` | FoundryVTT.com account username |
| `FOUNDRY_PASSWORD` | FoundryVTT.com account password |
| `FOUNDRY_LICENSE_KEY` | Your Foundry license key |
| `FOUNDRY_WORLD` | World folder name to auto-launch |
| `RELAY_API_KEY` | Shared API key for relay auth |
