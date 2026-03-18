#\!/bin/sh
set -e

echo "Applying database schema..."
bun run db:push

echo "Starting server..."
exec bun server.js
