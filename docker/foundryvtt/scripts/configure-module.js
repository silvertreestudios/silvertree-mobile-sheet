#!/usr/bin/env node

/**
 * configure-module.js
 *
 * Pre-configures the foundryvtt-rest-api module in a FoundryVTT world so that
 * when FoundryVTT starts, the module is already enabled and configured to
 * connect to the local relay server.
 *
 * This script modifies two files in the world directory:
 *   1. world.json — enables the module in the world's module list
 *   2. settings.db — injects module settings (NeDB line-delimited JSON)
 *
 * Usage:
 *   node configure-module.js \
 *     --world-dir=/data/Data/worlds/my-world \
 *     --relay-url=ws://relay:3010/ \
 *     --api-key=test-api-key \
 *     --module-id=foundry-rest-api
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Parse arguments
// ---------------------------------------------------------------------------
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    args[key] = rest.join("=");
  });
  return args;
}

const args = parseArgs();
const worldDir = args["world-dir"];
const relayUrl = args["relay-url"] || "ws://relay:3010/";
const apiKey = args["api-key"] || "";
const moduleId = args["module-id"] || "foundry-rest-api";

if (!worldDir) {
  console.error("[configure-module] ERROR: --world-dir is required");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 1. Enable the module in world.json
// ---------------------------------------------------------------------------
function enableModuleInWorld() {
  const worldJsonPath = path.join(worldDir, "world.json");

  if (!fs.existsSync(worldJsonPath)) {
    console.log(`[configure-module] WARNING: ${worldJsonPath} not found, skipping`);
    return;
  }

  const worldData = JSON.parse(fs.readFileSync(worldJsonPath, "utf-8"));

  // Foundry v10+ uses "relationships.modules" — ensure it exists and add our module.
  // (Legacy pre-v10 top-level "modules" array is not supported; we target v13+.)
  if (worldData.relationships && Array.isArray(worldData.relationships.modules)) {
    const modules = worldData.relationships.modules;
    const existing = modules.find(
      (m) => m.id === moduleId || (m._id === moduleId)
    );
    if (!existing) {
      modules.push({ id: moduleId, type: "module" });
      console.log(`[configure-module] Added ${moduleId} to relationships.modules`);
    } else {
      console.log(`[configure-module] Module ${moduleId} already in relationships.modules`);
    }
  } else {
    // relationships key missing or modules not an array — create it
    if (!worldData.relationships) {
      worldData.relationships = {};
    }
    if (!Array.isArray(worldData.relationships.modules)) {
      worldData.relationships.modules = [];
    }
    worldData.relationships.modules.push({ id: moduleId, type: "module" });
    console.log(`[configure-module] Created relationships.modules with ${moduleId}`);
  }

  fs.writeFileSync(worldJsonPath, JSON.stringify(worldData, null, 2), "utf-8");
  console.log(`[configure-module] Updated ${worldJsonPath}`);
}

// ---------------------------------------------------------------------------
// 2. Inject module settings into settings.db
// ---------------------------------------------------------------------------
function configureModuleSettings() {
  const settingsDbPath = path.join(worldDir, "data", "settings.db");

  // Ensure the data directory exists
  const dataDir = path.join(worldDir, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Settings to inject (NeDB line-delimited JSON format)
  const settings = [
    {
      key: `${moduleId}.apiKey`,
      value: JSON.stringify(apiKey),
      _id: `${moduleId}-apiKey`,
    },
    {
      key: `${moduleId}.relayUrl`,
      value: JSON.stringify(relayUrl),
      _id: `${moduleId}-relayUrl`,
    },
    {
      key: `${moduleId}.logLevel`,
      value: JSON.stringify("info"),
      _id: `${moduleId}-logLevel`,
    },
    {
      key: `${moduleId}.pingInterval`,
      value: JSON.stringify(30),
      _id: `${moduleId}-pingInterval`,
    },
  ];

  // Read existing settings.db (if it exists)
  let existingLines = [];
  if (fs.existsSync(settingsDbPath)) {
    existingLines = fs
      .readFileSync(settingsDbPath, "utf-8")
      .split("\n")
      .filter((line) => line.trim().length > 0);
  }

  // Build a set of existing setting keys for deduplication
  const existingKeys = new Set();
  existingLines.forEach((line) => {
    try {
      const parsed = JSON.parse(line);
      if (parsed.key) existingKeys.add(parsed.key);
    } catch (e) {
      // Skip unparseable lines
    }
  });

  // Append new settings (skip if already present)
  let added = 0;
  settings.forEach((setting) => {
    if (existingKeys.has(setting.key)) {
      // Update existing setting in place
      existingLines = existingLines.map((line) => {
        try {
          const parsed = JSON.parse(line);
          if (parsed.key === setting.key) {
            console.log(`[configure-module] Updated setting: ${setting.key}`);
            return JSON.stringify(setting);
          }
        } catch (e) {
          // keep as-is
        }
        return line;
      });
    } else {
      existingLines.push(JSON.stringify(setting));
      console.log(`[configure-module] Added setting: ${setting.key}`);
      added++;
    }
  });

  fs.writeFileSync(settingsDbPath, existingLines.join("\n") + "\n", "utf-8");
  console.log(
    `[configure-module] Settings DB updated (${added} added, ${settings.length - added} updated)`
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
try {
  enableModuleInWorld();
  configureModuleSettings();
  console.log("[configure-module] Module configuration complete");
} catch (err) {
  console.error("[configure-module] ERROR:", err.message);
  process.exit(1);
}
