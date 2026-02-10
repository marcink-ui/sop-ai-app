#!/bin/sh
# VantageOS Startup Script
# Schema migrations should be run via CI/CD, not at container startup
# To sync schema manually: DATABASE_URL="..." npx prisma db push

echo "🚀 Starting Next.js server..."
exec node server.js
