#!/bin/bash
docker compose down -v
docker compose  up --build -d
# docker system prune -a -f