FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy shared package first
COPY packages/shared ./packages/shared

# Install dependencies for shared package
WORKDIR /app/packages/shared
RUN npm ci

# Build shared package
RUN npm run build
WORKDIR /app

# Install dependencies for main app
COPY apps/web/package.json ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY apps/web/package.json ./
COPY apps/web/ ./
RUN ls -la packages/ && rm -rf node_modules/@steuer-fair && mkdir -p node_modules/@steuer-fair && cp -r packages/shared node_modules/@steuer-fair/shared

# Build the application
RUN npm run build

#RUN pwd && ls -la
#RUN find / -name "standalone"

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
