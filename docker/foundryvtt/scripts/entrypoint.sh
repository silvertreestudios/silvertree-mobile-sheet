#!/bin/bash
set -e

MODULES_DIR="/data/Data/modules"
MODULE_ID="foundry-rest-api"
MODULE_DIR="${MODULES_DIR}/${MODULE_ID}"

# ---------------------------------------------------------------------------
# 1. Install the foundryvtt-rest-api module if not already present
# ---------------------------------------------------------------------------
install_module() {
    echo "[setup] Checking for ${MODULE_ID} module..."

    if [ -d "${MODULE_DIR}" ] && [ -f "${MODULE_DIR}/module.json" ]; then
        echo "[setup] Module already installed at ${MODULE_DIR}"
        return
    fi

    echo "[setup] Downloading ${MODULE_ID} module..."
    mkdir -p "${MODULES_DIR}"

    # Fetch the latest release manifest
    local MANIFEST_URL="https://github.com/ThreeHats/foundryvtt-rest-api/releases/latest/download/module.json"
    local MANIFEST=$(curl -fsSL "${MANIFEST_URL}")

    # Extract the download URL from the manifest
    local DOWNLOAD_URL=$(echo "${MANIFEST}" | jq -r '.download // empty')

    if [ -z "${DOWNLOAD_URL}" ]; then
        echo "[setup] ERROR: Could not find download URL in module manifest"
        echo "[setup] Manifest content: ${MANIFEST}"
        exit 1
    fi

    echo "[setup] Downloading from ${DOWNLOAD_URL}..."
    local TMP_ZIP="/tmp/${MODULE_ID}.zip"
    curl -fsSL -o "${TMP_ZIP}" "${DOWNLOAD_URL}"

    mkdir -p "${MODULE_DIR}"
    unzip -o "${TMP_ZIP}" -d "${MODULE_DIR}"
    rm -f "${TMP_ZIP}"

    echo "[setup] Module installed successfully"
}

# ---------------------------------------------------------------------------
# 2. Configure the module in the target world
# ---------------------------------------------------------------------------
configure_world() {
    if [ -z "${FOUNDRY_WORLD}" ]; then
        echo "[setup] FOUNDRY_WORLD not set, skipping module configuration"
        return
    fi

    local WORLD_DIR="/data/Data/worlds/${FOUNDRY_WORLD}"

    if [ ! -d "${WORLD_DIR}" ]; then
        echo "[setup] WARNING: World directory ${WORLD_DIR} not found"
        echo "[setup] Module configuration will be skipped. Configure manually in Foundry."
        return
    fi

    echo "[setup] Configuring module for world: ${FOUNDRY_WORLD}"

    # Run the Node.js configuration script
    node /opt/foundryvtt-setup/configure-module.js \
        --world-dir="${WORLD_DIR}" \
        --relay-url="${RELAY_URL}" \
        --api-key="${RELAY_API_KEY}" \
        --module-id="${MODULE_ID}"
}

# ---------------------------------------------------------------------------
# 3. Configure auto-launch of the world
# ---------------------------------------------------------------------------
configure_auto_launch() {
    if [ -z "${FOUNDRY_WORLD}" ]; then
        echo "[setup] FOUNDRY_WORLD not set, skipping auto-launch configuration"
        return
    fi

    local OPTIONS_JSON="/data/Config/options.json"
    mkdir -p "$(dirname "${OPTIONS_JSON}")"

    if [ -f "${OPTIONS_JSON}" ]; then
        # Update existing options.json
        local TMP=$(mktemp)
        jq --arg world "${FOUNDRY_WORLD}" '.world = $world' "${OPTIONS_JSON}" > "${TMP}"
        mv "${TMP}" "${OPTIONS_JSON}"
    else
        # Create new options.json with world auto-launch
        cat > "${OPTIONS_JSON}" <<EOF
{
    "world": "${FOUNDRY_WORLD}"
}
EOF
    fi

    echo "[setup] Configured auto-launch for world: ${FOUNDRY_WORLD}"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
echo "========================================"
echo " FoundryVTT Local E2E Setup"
echo "========================================"

install_module
configure_world
configure_auto_launch

echo "[setup] Configuration complete, starting FoundryVTT..."
echo "========================================"

# Delegate to the base image's entrypoint
exec /home/node/entrypoint.sh "$@"
