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

$HasContainer = $false
if (Test-Prerequisite "docker") { $HasContainer = $true }
elseif (Test-Prerequisite "podman") { $HasContainer = $true }
else { $Missing++ }

$ComposeCmd = $null
if (Get-Command "docker" -ErrorAction SilentlyContinue) {
    # Verify Docker Compose v2 plugin is available
    $composeCheck = & docker compose version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $ComposeCmd = "docker compose"
    } elseif (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
        $ComposeCmd = "docker-compose"
    } else {
        Write-Host "  ✗ Docker found but Compose plugin missing. Install Docker Desktop or docker-compose."
        $Missing++
    }
} elseif (Get-Command "podman-compose" -ErrorAction SilentlyContinue) {
    $ComposeCmd = "podman-compose"
} elseif (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
    $ComposeCmd = "docker-compose"
} else {
    Write-Host "  ✗ No compose tool found. Install Docker Desktop, podman-compose, or docker-compose."
    $Missing++
}

if ($Missing -gt 0) {
    Write-Host ""
    Write-Host "[setup] ERROR: Missing prerequisites. Please install them and try again."
    exit 1
}

Write-Host ""

# ---------------------------------------------------------------------------
# 2. Create .env — prefer shared worktree-level .env, then fall back to template
# ---------------------------------------------------------------------------
Write-Host "[setup] Setting up environment file..."

$EnvFile = Join-Path $ProjectRoot ".env"
$EnvExample = Join-Path $ProjectRoot ".env.example"
# Shared .env lives one level above each worktree checkout
$SharedEnv = Join-Path (Split-Path -Parent $ProjectRoot) ".env"

if (Test-Path $EnvFile) {
    Write-Host "  .env already exists, skipping"
} elseif (Test-Path $SharedEnv) {
    Copy-Item $SharedEnv $EnvFile
    Write-Host "  Copied shared .env from $SharedEnv"
} else {
    Copy-Item $EnvExample $EnvFile
    Write-Host "  Created .env from .env.example"
    Write-Host "  ⚠  Please edit .env and fill in your FoundryVTT credentials!"
    Write-Host ""
    Write-Host "  TIP: Save a filled-in .env to the parent worktree directory:"
    Write-Host "    $SharedEnv"
    Write-Host "  It will be automatically copied into future worktrees."
}

Write-Host ""

# ---------------------------------------------------------------------------
# 3. Verify Docker volumes
# ---------------------------------------------------------------------------
Write-Host "[setup] Docker named volumes will be created automatically on first run."
Write-Host "  - silvertree-foundryvtt-data (FoundryVTT data)"
Write-Host "  - silvertree-relay-data (Relay database)"

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
Write-Host "   2. Run: $ComposeCmd up --build"
Write-Host "   3. Set up your world via the FoundryVTT UI at http://localhost:30000"
Write-Host "   4. Visit http://localhost:3010 to create a relay API key"
Write-Host "   5. Set RELAY_API_KEY=<key> in .env and restart"
Write-Host ""
Write-Host " Or run the seed script after starting:"
Write-Host "   bash docker/relay/seed-api-key.sh"
Write-Host ""
