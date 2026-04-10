#!/bin/bash
# Initialize database tables if they don't exist
echo "Running database migration..."
npx drizzle-kit push 2>&1 || echo "Migration warning (may be fine if tables exist)"
echo "Starting server..."
NODE_ENV=production node dist/index.cjs
