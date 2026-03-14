# Copilot Instructions — Silvertree Mobile Sheet

## Local Development

**Always use Docker Compose to run and test the app locally.** Do not use bare `npx expo start` or `npm start` outside of Docker.

### Starting the local environment

```bash
# First time in a new worktree — copy shared .env and pull LFS:
.\scripts\setup-local.ps1   # Windows
./scripts/setup-local.sh     # Linux/Mac

# Or manually:
git lfs pull
# Copy shared .env from the parent worktree directory if it exists,
# otherwise copy .env.example and fill in credentials:
cp ../.env .env   # shared .env lives one level above each worktree

# Start the full stack (relay, FoundryVTT, mobile app)
docker compose up --build
```

### Shared `.env` for worktrees

Credentials are stored in a shared `.env` at the **parent directory** of all worktrees:
```
C:\Users\Josh\.copilot\worktrees\silvertree-mobile-sheet\.env
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

## Testing

```bash
# Type check
npx tsc --noEmit

# Unit tests
npx jest --ci

# Full validation (types + tests + snapshots)
npm run validate
```
