#\!/bin/sh
set -e

echo "Applying database schema..."
bun run db:push

if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  bun run db:seed
fi

echo "Starting server..."
exec bun server.js
