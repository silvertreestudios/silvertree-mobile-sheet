# Extends the prebuilt relay image to compile sqlite3 native bindings.
# The published image ships without them, so DB_TYPE=sqlite crashes at runtime.
FROM threehats/foundryvtt-rest-api-relay:latest

USER root

# Build tools are already present in the base image; just need a modern
# node-gyp (the bundled one is too old for Node 20).
RUN npm install -g node-gyp@latest \
    && cd /app/node_modules/.pnpm/sqlite3@5.1.7/node_modules/sqlite3 \
    && node-gyp rebuild \
    && npm uninstall -g node-gyp

# Drop back to non-root for runtime — ensure writable dirs exist first
RUN mkdir -p /app/uploads /app/data && chown -R node:node /app/uploads /app/data

USER node
