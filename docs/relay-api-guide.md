# Relay API Debugging Guide

A reference for manually querying the [FoundryVTT REST API Relay](https://foundryvtt-rest-api-relay.fly.dev/docs/api) during local development. Useful for verifying the E2E stack is working and debugging data flow.

## Prerequisites

Before making API calls:

1. **Stack is running** — `docker-compose up` with all three services healthy
2. **GM is logged in** — Open http://localhost:30000 in a browser and log in as Gamemaster. The REST API module runs **client-side**, so it only has data access while a GM session is active.
3. **API key is set** — You need a valid `x-api-key` header for all requests

## Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/clients` | GET | List connected Foundry instances |
| `/structure` | GET | List entities (actors, items, scenes, etc.) |
| `/get` | GET | Get a specific entity by UUID |
| `/update` | PUT | Update an entity |
| `/create` | POST | Create a new entity |
| `/delete` | DELETE | Delete an entity |
| `/increase` | POST | Increase a numeric attribute |
| `/decrease` | POST | Decrease a numeric attribute |
| `/roll` | POST | Execute a dice roll |
| `/rolls` | GET | Get recent roll history |
| `/lastroll` | GET | Get the most recent roll |
| `/search` | GET | Search entities (requires QuickInsert module) |
| `/select` | POST | Select token(s) on the canvas |
| `/selected` | GET | Get currently selected token(s) |
| `/macros` | GET | List all macros |
| `/api/docs` | GET | Full API documentation (JSON) |

## Authentication

All requests require the `x-api-key` header:

```bash
API_KEY="your-api-key-here"
curl -s -H "x-api-key: $API_KEY" http://localhost:3010/clients
```

On Windows PowerShell:

```powershell
$apiKey = "your-api-key-here"
$headers = @{ "x-api-key" = $apiKey }
Invoke-RestMethod -Uri "http://localhost:3010/clients" -Headers $headers
```

## Common Workflows

### 1. Get the Client ID

The `clientId` is required for most endpoints. It identifies the connected Foundry instance.

```bash
curl -s -H "x-api-key: $API_KEY" http://localhost:3010/clients | jq .
```

Response:

```json
[
  {
    "clientId": "foundry-Prg6NToPlUFQrSzR",
    "worldId": "pathfinder2e-test",
    "systemId": "pf2e",
    "systemVersion": "7.11.2",
    "foundryVersion": "13.351",
    "activeUsers": 1
  }
]
```

> **If this returns an empty array `[]`**, the REST API module is not connected. Check that a GM is logged into the world in a browser and that the module's relay URL is set to `ws://localhost:3010/`.

### 2. List All Actors

Use `/structure` with `types=Actor` to list all actors in the world:

```bash
CLIENT_ID="foundry-Prg6NToPlUFQrSzR"

# Names and UUIDs only (lightweight)
curl -s -H "x-api-key: $API_KEY" \
  "http://localhost:3010/structure?clientId=$CLIENT_ID&types=Actor&recursive=true" | jq .

# With full entity data (large response)
curl -s -H "x-api-key: $API_KEY" \
  "http://localhost:3010/structure?clientId=$CLIENT_ID&types=Actor&includeEntityData=true&recursive=true" | jq .
```

The response includes all actors — player characters and NPCs. Look for `name` and `id` fields.

### 3. Get a Specific Actor

Use `/get` with the actor's UUID (format: `Actor.<id>`):

```bash
# By UUID (preferred — unambiguous)
curl -s -H "x-api-key: $API_KEY" \
  "http://localhost:3010/get?clientId=$CLIENT_ID&uuid=Actor.CqfFjgqQLy8UX99r" | jq .
```

The response contains the full actor document with all PF2e system data (abilities, skills, HP, items, feats, etc.).

### 4. Get the Currently Selected Token

If you have a token selected on the Foundry canvas:

```bash
# Get the selected token's actor data
curl -s -H "x-api-key: $API_KEY" \
  "http://localhost:3010/get?clientId=$CLIENT_ID&selected=true&actor=true" | jq .
```

### 5. Modify Actor Attributes

Increase or decrease numeric attributes using dot-notation paths:

```bash
# Increase HP by 5
curl -s -X POST -H "x-api-key: $API_KEY" -H "Content-Type: application/json" \
  "http://localhost:3010/increase?clientId=$CLIENT_ID&uuid=Actor.CqfFjgqQLy8UX99r" \
  -d '{"attribute": "system.attributes.hp.value", "amount": 5}' | jq .

# Decrease HP by 3
curl -s -X POST -H "x-api-key: $API_KEY" -H "Content-Type: application/json" \
  "http://localhost:3010/decrease?clientId=$CLIENT_ID&uuid=Actor.CqfFjgqQLy8UX99r" \
  -d '{"attribute": "system.attributes.hp.value", "amount": 3}' | jq .
```

### 6. Roll Dice

```bash
# Roll 1d20 + 5
curl -s -X POST -H "x-api-key: $API_KEY" -H "Content-Type: application/json" \
  "http://localhost:3010/roll?clientId=$CLIENT_ID" \
  -d '{"formula": "1d20 + 5", "flavor": "Attack Roll"}' | jq .

# Get the last roll result
curl -s -H "x-api-key: $API_KEY" \
  "http://localhost:3010/lastroll?clientId=$CLIENT_ID" | jq .
```

### 7. Update an Actor

```bash
curl -s -X PUT -H "x-api-key: $API_KEY" -H "Content-Type: application/json" \
  "http://localhost:3010/update?clientId=$CLIENT_ID&uuid=Actor.CqfFjgqQLy8UX99r" \
  -d '{"data": {"name": "Renamed Fighter"}}' | jq .
```

## PF2e-Specific Data Paths

Common attribute paths for the PF2e system:

| Path | Description |
|------|-------------|
| `system.attributes.hp.value` | Current HP |
| `system.attributes.hp.max` | Max HP |
| `system.attributes.hp.temp` | Temporary HP |
| `system.attributes.ac.value` | Armor Class |
| `system.attributes.speed.value` | Base speed |
| `system.attributes.perception.value` | Perception modifier |
| `system.saves.fortitude.value` | Fortitude save modifier |
| `system.saves.reflex.value` | Reflex save modifier |
| `system.saves.will.value` | Will save modifier |
| `system.abilities.str.mod` | Strength modifier |
| `system.abilities.dex.mod` | Dexterity modifier |
| `system.details.level.value` | Character level |
| `system.details.heritage.value` | Heritage |
| `system.details.class.value` | Class |

## Troubleshooting

### `/clients` returns `[]`

The REST API module is not connected. Check:
- A GM is logged into the world at http://localhost:30000
- The module is enabled (Game Settings → Manage Modules)
- The module's relay URL is `ws://localhost:3010/` (not `ws://relay:3010/`)
- The module's API key matches your relay API key

### `/get` returns "Entity not found"

- Ensure you're using the full UUID format: `Actor.CqfFjgqQLy8UX99r`
- Verify the ID exists via `/structure?clientId=...&types=Actor`

### `/search` returns "Quick Insert module not found"

The `/search` endpoint requires the [Quick Insert](https://gitlab.com/riccisi/foundryvtt-quick-insert) Foundry module to be installed and enabled. Use `/structure` as an alternative for listing entities.

### "This endpoint is only supported in Foundry VTT version 12"

The `/sheet` endpoint is deprecated and only works on Foundry v12. Use `/get` with a UUID instead to retrieve actor data on v13+.

### Large responses

The `/structure` endpoint with `includeEntityData=true` can return very large responses (multiple MB) for worlds with many NPCs. Pipe through `jq` to filter:

```bash
# Just get actor names and IDs
curl -s -H "x-api-key: $API_KEY" \
  "http://localhost:3010/structure?clientId=$CLIENT_ID&types=Actor&recursive=true" \
  | jq '.. | objects | select(.name? and .id?) | {name, id}'
```

## Full API Documentation

The relay serves its complete API documentation as JSON:

```bash
curl -s http://localhost:3010/api/docs | jq .
```

Upstream docs: https://foundryvtt-rest-api-relay.fly.dev/docs/api
