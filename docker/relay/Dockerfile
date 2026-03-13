FROM node:20-slim

# Install dependencies required by the relay server (bcrypt, sqlite3, puppeteer/chromium)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    sqlite3 \
    chromium \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer config — use system Chromium instead of downloading
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy the cloned relay source
COPY src/ .

# Install dependencies using npm (pnpm may not be available)
RUN npm install --legacy-peer-deps

# Build TypeScript
RUN npm run build

# Runtime environment defaults for local development
ENV PORT=3010 \
    DB_TYPE=sqlite \
    NODE_ENV=development \
    FREE_API_REQUESTS_LIMIT=999999999 \
    DAILY_REQUEST_LIMIT=999999999

EXPOSE 3010

CMD ["node", "dist/index.js"]
