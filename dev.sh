#!/usr/bin/env bash
set -euo pipefail

CMD=${1:-}

case "$CMD" in
  up)
    docker compose up -d --build
    ;;
  down)
    docker compose down
    ;;
  logs)
    docker compose logs -f --tail=200
    ;;
  seed)
    python manage.py seed_rain_flood_map
    python manage.py seed_incident
    ;;
  reset)
    docker compose down -v --remove-orphans
    docker compose up -d --build
    ;;
  *)
    echo "Uso: ./dev.sh {up|down|logs|seed|reset}"
    exit 1
    ;;
esac
