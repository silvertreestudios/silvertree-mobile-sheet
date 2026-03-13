FROM felddy/foundryvtt:release

# Install dependencies for our config scripts
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    jq \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Copy custom scripts
COPY scripts/ /opt/foundryvtt-setup/

RUN chmod +x /opt/foundryvtt-setup/entrypoint.sh

# Environment variables with defaults
ENV FOUNDRY_WORLD="" \
    RELAY_URL="ws://relay:3010/" \
    RELAY_API_KEY="" \
    FOUNDRY_REST_API_MODULE_VERSION="latest"

ENTRYPOINT ["/opt/foundryvtt-setup/entrypoint.sh"]
