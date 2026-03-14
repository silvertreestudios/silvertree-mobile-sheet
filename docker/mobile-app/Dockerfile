# Dev mode: Expo web dev server with hot reload
FROM node:20

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# The source code is bind-mounted at runtime for hot reload.
# This COPY is a fallback if not using bind mounts.
COPY . .

# Expo web dev server port
EXPOSE 8081

# Start Expo web dev server
CMD ["npx", "expo", "start", "--web", "--port", "8081", "--host", "lan"]
