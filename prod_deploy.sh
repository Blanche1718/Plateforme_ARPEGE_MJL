#!/bin/bash

# Parse flags
BUILD_FLAG=""
PRUNE_FLAG=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -b) BUILD_FLAG="--build" ;;
        --prune) PRUNE_FLAG="true" ;;
        *) echo "Invalid option: $1"; exit 1 ;;
    esac
    shift
done

# Stop and remove containers
docker compose -f docker-compose.prod.yml down
# Remove .env file
rm .env
# Copy .env.prod to .env
cp .env.prod .env
# Start containers with or without --build
docker compose -f docker-compose.prod.yml up $BUILD_FLAG -d

# Prune unused Docker objects if --prune flag is set
if [ "$PRUNE_FLAG" ]; then
    docker system prune -a -f
fi
