# Copilot Agent Instructions

## CI Checks — MUST pass before finishing work

Before completing any task and requesting review, you **MUST** run and ensure all of the following checks pass:

```bash
# 1. TypeScript type-check
npm run typecheck

# 2. Unit tests (with coverage)
npm run test:ci
```

These are the exact same checks that run in the GitHub Actions CI workflow (`.github/workflows/ci.yml`). If either check fails, fix the issues before asking for a review.

## Project Overview

This is an Expo React Native app (TypeScript) for Pathfinder 2e character sheets. Key directories:

- `src/api/` – API client for the FoundryVTT REST Relay
- `src/components/` – Shared UI components
- `src/contexts/` – React contexts (character data, config)
- `src/navigation/` – React Navigation setup
- `src/screens/` – Screen components (CharacterSheet tabs, etc.)
- `src/types/` – TypeScript type definitions
- `src/utils/` – Utility helpers and theme constants
- `src/__tests__/` – Unit tests (mirrors `src/api/` and `src/utils/`)

## Dependency Installation

Use `npm ci --legacy-peer-deps` (required due to a peer-dep conflict between `@testing-library/react-native` and React 19.1.0).

## Testing

- Dev: `npm test` — runs Jest without coverage or CI flags
- CI: `npm run test:ci` — runs Jest with `--ci --coverage`
- Tests live in `src/__tests__/{api,utils}/`
