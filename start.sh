#!/bin/sh
# VantageOS Startup Script
# Schema sync runs during docker build (builder stage)

echo "🚀 Starting Next.js server..."
exec node server.js
