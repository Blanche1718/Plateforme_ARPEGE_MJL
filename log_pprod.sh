#!/bin/bash

# Valeur par défaut pour LOG_SIZE
LOG_SIZE=500

# Vérifier si un argument est fourni
if [[ "$1" =~ ^[0-9]+$ ]]; then
    LOG_SIZE="$1"
fi

# Log avec -n LOG_SIZE
docker compose -f docker-compose.pprod.yml logs -n "$LOG_SIZE" -f