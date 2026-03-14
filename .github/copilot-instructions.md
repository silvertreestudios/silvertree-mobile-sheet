# Copilot Instructions — Silvertree Mobile Sheet

## Local Development

**Always use Docker Compose to run and test the app locally.** Do not use bare `npx expo start` or `npm start` outside of Docker.

### Starting the local environment

```bash
# First time in a new worktree — copy shared .env and pull LFS:
.\scripts\setup-local.ps1   # Windows
./scripts/setup-local.sh     # Linux/Mac

# Start the full stack (relay, FoundryVTT, mobile app)
docker compose up --build
```

### Persistent Docker volumes

All state is stored in **global named Docker volumes** that persist across branches and worktrees:
- `silvertree-foundryvtt-data` — FoundryVTT install, config, worlds, modules
- `silvertree-relay-data` — Relay database (accounts, API keys)

Once set up, `docker compose up --build` in any worktree will reuse the existing data.
`docker compose down` preserves volumes; only `docker compose down -v` deletes them.

### Shared `.env` for worktrees

Credentials are stored in a shared `.env` at the **parent directory** of all worktrees:
```
<worktree-parent>\.env
```

The setup scripts (`scripts/setup-local.ps1` and `scripts/setup-local.sh`) automatically
copy this shared `.env` into the current worktree if no local `.env` exists.

**Before starting Docker Compose in any new worktree**, always ensure `.env` is present:
1. Check if `.env` exists in the worktree root
2. If not, copy from the parent directory: `Copy-Item ..\.env .env`
3. If the parent doesn't have one either, copy `.env.example` and ask the user for credentials

### Services

| Service | URL | Description |
|---------|-----|-------------|
| Mobile App | http://localhost:8081 | Expo web dev server (hot reload) |
| Relay | http://localhost:3010 | REST API relay server |
| FoundryVTT | http://localhost:30000 | FoundryVTT game server |

### Important notes

- A **GM must be logged into the Foundry world** in a browser for the relay to have data access.
- The FoundryVTT REST API module runs **client-side in the GM's browser**, connecting to the relay at `ws://localhost:3010/`.
- If `.env` is missing credentials, prompt the user to fill them in before starting Docker.
- For production/E2E testing, use: `docker compose -f compose.yml -f compose.prod.yml up --build`
- The mobile-app container uses `--clear` to reset Metro's bundler cache on each start, and `CHOKIDAR_USEPOLLING=true` for reliable file watching through Docker bind mounts on Windows. If code changes aren't reflected in the browser, restart the container: `docker compose restart mobile-app`

## Testing

```bash
# Type check
npx tsc --noEmit

# Unit tests
npx jest --ci

# Full validation (types + tests + snapshots)
npm run validate
```

## Pre-commit checklist

Before every commit, review changes for:

- **Leftover debug code** — remove `console.log`, `console.error`, `debugger`, or any temporary logging added during development
- **Dead imports and unused code** — check that no removed features leave behind orphaned imports or unreferenced variables
- **Stale documentation** — if files or directories were added/removed/renamed, update README.md, .env.example, .gitattributes, and copilot-instructions.md to match
- **Stale config** — if file patterns changed (e.g., removing a directory), clean up related .gitignore, .gitattributes (LFS patterns), and CI config entries
- **Consistent data formats** — verify IDs, UUIDs, and keys use the same format throughout (e.g., full `Actor.xxx` UUIDs, not a mix of short and long forms)
- **Error handling** — ensure catch blocks don't silently swallow errors that should be surfaced or logged
