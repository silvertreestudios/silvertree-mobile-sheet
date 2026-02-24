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
