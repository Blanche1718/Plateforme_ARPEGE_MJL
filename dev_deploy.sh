#!/bin/bash
docker compose -f docker-compose.dev.yml down 
rm .env
cp .env.dev .env
docker compose -f docker-compose.dev.yml up --build -d
# docker system prune -a -f