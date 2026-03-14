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
check_command podman || MISSING=1
COMPOSE_CMD=""
if command -v podman-compose &> /dev/null; then
    COMPOSE_CMD="podman-compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "  ✗ No compose tool found. Install podman-compose or docker-compose."
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
# 2. Create .env from template
# ---------------------------------------------------------------------------
echo "[setup] Setting up environment file..."

if [ -f "${PROJECT_ROOT}/.env" ]; then
    echo "  .env already exists, skipping"
else
    cp "${PROJECT_ROOT}/.env.example" "${PROJECT_ROOT}/.env"
    echo "  Created .env from .env.example"
    echo "  ⚠  Please edit .env and fill in your FoundryVTT credentials!"
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
