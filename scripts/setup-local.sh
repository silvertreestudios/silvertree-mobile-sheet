#!/bin/bash
# setup-local.sh — Bootstrap the local Podman E2E environment (Linux/Mac)
#
# Usage:
#   chmod +x scripts/setup-local.sh
#   ./scripts/setup-local.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"

echo "========================================"
echo " Silver Tree Mobile — Local E2E Setup"
echo "========================================"
echo ""

# ---------------------------------------------------------------------------
# 1. Check prerequisites
# ---------------------------------------------------------------------------
echo "[setup] Checking prerequisites..."

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "  ✗ $1 not found. Please install $1."
        return 1
    else
        echo "  ✓ $1 found: $(command -v "$1")"
        return 0
    fi
}

MISSING=0
HAS_CONTAINER=0
check_command docker && HAS_CONTAINER=1
if [ "${HAS_CONTAINER}" -eq 0 ]; then
    check_command podman && HAS_CONTAINER=1
fi
[ "${HAS_CONTAINER}" -eq 0 ] && MISSING=1

COMPOSE_CMD=""
if command -v docker &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v podman-compose &> /dev/null; then
    COMPOSE_CMD="podman-compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "  ✗ No compose tool found. Install Docker Desktop, podman-compose, or docker-compose."
    MISSING=1
fi
[ -n "${COMPOSE_CMD}" ] && echo "  ✓ ${COMPOSE_CMD} found: $(command -v "${COMPOSE_CMD}")"

if [ "${MISSING}" -ne 0 ]; then
    echo ""
    echo "[setup] ERROR: Missing prerequisites. Please install them and try again."
    exit 1
fi

echo ""

# ---------------------------------------------------------------------------
# 2. Create .env — prefer shared worktree-level .env, then fall back to template
# ---------------------------------------------------------------------------
echo "[setup] Setting up environment file..."

SHARED_ENV="$(dirname "${PROJECT_ROOT}")/.env"

if [ -f "${PROJECT_ROOT}/.env" ]; then
    echo "  .env already exists, skipping"
elif [ -f "${SHARED_ENV}" ]; then
    cp "${SHARED_ENV}" "${PROJECT_ROOT}/.env"
    echo "  Copied shared .env from ${SHARED_ENV}"
else
    cp "${PROJECT_ROOT}/.env.example" "${PROJECT_ROOT}/.env"
    echo "  Created .env from .env.example"
    echo "  ⚠  Please edit .env and fill in your FoundryVTT credentials!"
    echo ""
    echo "  TIP: Save a filled-in .env to the parent worktree directory:"
    echo "    ${SHARED_ENV}"
    echo "  It will be automatically copied into future worktrees."
fi

echo ""

# ---------------------------------------------------------------------------
# 3. Create worlds directory
# ---------------------------------------------------------------------------
echo "[setup] Setting up worlds directory..."

mkdir -p "${PROJECT_ROOT}/docker/worlds"
echo "  docker/worlds/ directory ready"
echo "  Place your world snapshot folder here."

echo ""

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
echo "========================================"
echo " Setup complete!"
echo "========================================"
echo ""
echo " Next steps:"
echo "   1. Edit .env with your FoundryVTT credentials and license key"
echo "   2. Place your world snapshot in docker/worlds/<world-name>/"
echo "   3. Set FOUNDRY_WORLD=<world-name> in .env"
echo "   4. Run: ${COMPOSE_CMD} up --build"
echo "   5. Visit http://localhost:3010 to create a relay API key"
echo "   6. Set RELAY_API_KEY=<key> in .env and restart"
echo ""
echo " Or run the seed script after starting:"
echo "   ./docker/relay/seed-api-key.sh"
echo ""
