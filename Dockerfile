# VantageOS Production Dockerfile
# Optimized for Railway deployment

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
# Skip postinstall (prisma generate) - schema not available yet
RUN npm ci --ignore-scripts

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# DATABASE_URL from Railway env (available at build time)
ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma client (schema is now available)
RUN npx prisma generate

# Sync database schema (skip if placeholder URL)
RUN if echo "$DATABASE_URL" | grep -qv "placeholder"; then \
    echo "📦 Syncing database schema..." && \
    npx prisma db push --accept-data-loss 2>&1 || true; \
    else \
    echo "⏭️  Skipping db push (placeholder DATABASE_URL)"; \
    fi

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy startup script
COPY --from=builder /app/start.sh ./start.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "start.sh"]
