#!/bin/bash
docker compose down 
docker compose  up --remove-orphans -d
# docker system prune -a -f