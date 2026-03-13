# setup-local.ps1 — Bootstrap the local Podman E2E environment (Windows)
#
# Usage:
#   .\scripts\setup-local.ps1

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "========================================"
Write-Host " Silver Tree Mobile — Local E2E Setup"
Write-Host "========================================"
Write-Host ""

# ---------------------------------------------------------------------------
# 1. Check prerequisites
# ---------------------------------------------------------------------------
Write-Host "[setup] Checking prerequisites..."

$Missing = 0

function Test-Prerequisite {
    param([string]$Command)
    $found = Get-Command $Command -ErrorAction SilentlyContinue
    if ($found) {
        Write-Host "  ✓ $Command found: $($found.Source)"
        return $true
    } else {
        Write-Host "  ✗ $Command not found. Please install $Command."
        return $false
    }
}

if (-not (Test-Prerequisite "podman")) { $Missing++ }
$hasCompose = (Test-Prerequisite "podman-compose") -or (Test-Prerequisite "docker-compose")
if (-not $hasCompose) { $Missing++ }

if ($Missing -gt 0) {
    Write-Host ""
    Write-Host "[setup] ERROR: Missing prerequisites. Please install them and try again."
    exit 1
}

Write-Host ""

# ---------------------------------------------------------------------------
# 2. Create .env from template
# ---------------------------------------------------------------------------
Write-Host "[setup] Setting up environment file..."

$EnvFile = Join-Path $ProjectRoot ".env"
$EnvExample = Join-Path $ProjectRoot ".env.example"

if (Test-Path $EnvFile) {
    Write-Host "  .env already exists, skipping"
} else {
    Copy-Item $EnvExample $EnvFile
    Write-Host "  Created .env from .env.example"
    Write-Host "  ⚠  Please edit .env and fill in your FoundryVTT credentials!"
}

Write-Host ""

# ---------------------------------------------------------------------------
# 3. Create worlds directory
# ---------------------------------------------------------------------------
Write-Host "[setup] Setting up worlds directory..."

$WorldsDir = Join-Path $ProjectRoot "docker\worlds"
if (-not (Test-Path $WorldsDir)) {
    New-Item -ItemType Directory -Force -Path $WorldsDir | Out-Null
}
Write-Host "  docker\worlds\ directory ready"
Write-Host "  Place your world snapshot folder here."

Write-Host ""

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
Write-Host "========================================"
Write-Host " Setup complete!"
Write-Host "========================================"
Write-Host ""
Write-Host " Next steps:"
Write-Host "   1. Edit .env with your FoundryVTT credentials and license key"
Write-Host "   2. Place your world snapshot in docker\worlds\<world-name>\"
Write-Host "   3. Set FOUNDRY_WORLD=<world-name> in .env"
Write-Host "   4. Run: podman-compose up --build"
Write-Host "   5. Visit http://localhost:3010 to create a relay API key"
Write-Host "   6. Set RELAY_API_KEY=<key> in .env and restart"
Write-Host ""
Write-Host " Or run the seed script after starting:"
Write-Host "   bash docker/relay/seed-api-key.sh"
Write-Host ""
