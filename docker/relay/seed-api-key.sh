#!/bin/bash
# seed-api-key.sh
#
# Helper script to create a test user and API key on the relay server.
# Run this after the relay container is healthy on first setup.
#
# Usage:
#   ./docker/relay/seed-api-key.sh [relay_url]
#
# Example:
#   ./docker/relay/seed-api-key.sh http://localhost:3010

set -e

RELAY_URL="${1:-http://localhost:3010}"
TEST_EMAIL="test@local.dev"
TEST_PASSWORD="testpassword123"

echo "========================================"
echo " Relay Server API Key Seeder"
echo " Relay URL: ${RELAY_URL}"
echo "========================================"

# Wait for relay to be ready
echo "[seed] Waiting for relay server to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0
until curl -sf "${RELAY_URL}" > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ "${RETRY_COUNT}" -ge "${MAX_RETRIES}" ]; then
        echo "[seed] ERROR: Relay server not ready after ${MAX_RETRIES} attempts"
        exit 1
    fi
    echo "[seed] Waiting... (${RETRY_COUNT}/${MAX_RETRIES})"
    sleep 2
done
echo "[seed] Relay server is ready!"

# Register a test user
echo "[seed] Registering test user: ${TEST_EMAIL}"
REGISTER_RESPONSE=$(curl -sf -X POST "${RELAY_URL}/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"${TEST_EMAIL}\", \"password\": \"${TEST_PASSWORD}\"}" \
    2>&1) || true

echo "[seed] Register response: ${REGISTER_RESPONSE}"

# Login to get a session token
echo "[seed] Logging in..."
LOGIN_RESPONSE=$(curl -sf -X POST "${RELAY_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"${TEST_EMAIL}\", \"password\": \"${TEST_PASSWORD}\"}" \
    2>&1)

TOKEN=$(echo "${LOGIN_RESPONSE}" | jq -r '.token // .accessToken // empty')

if [ -z "${TOKEN}" ]; then
    echo "[seed] WARNING: Could not extract auth token from login response"
    echo "[seed] Response: ${LOGIN_RESPONSE}"
    echo ""
    echo "[seed] Please create an API key manually:"
    echo "  1. Visit ${RELAY_URL} in your browser"
    echo "  2. Create an account"
    echo "  3. Generate an API key from the dashboard"
    echo "  4. Set RELAY_API_KEY=<your-key> in .env"
    exit 0
fi

# Create an API key
echo "[seed] Creating API key..."
APIKEY_RESPONSE=$(curl -sf -X POST "${RELAY_URL}/api-keys" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{"name": "local-e2e-testing"}' \
    2>&1)

API_KEY=$(echo "${APIKEY_RESPONSE}" | jq -r '.key // .apiKey // empty')

if [ -z "${API_KEY}" ]; then
    echo "[seed] WARNING: Could not extract API key from response"
    echo "[seed] Response: ${APIKEY_RESPONSE}"
    echo ""
    echo "[seed] Please create an API key manually via ${RELAY_URL}"
    exit 0
fi

echo ""
echo "========================================"
echo " API Key created successfully!"
echo "========================================"
echo ""
echo " API Key: ${API_KEY}"
echo ""
echo " Add this to your .env file:"
echo "   RELAY_API_KEY=${API_KEY}"
echo ""
echo " Then restart the stack:"
echo "   podman-compose down && podman-compose up -d"
echo "========================================"
