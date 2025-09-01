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
COPY apps/api/package.json ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY apps/api/package.json ./
COPY apps/api/ ./
RUN rm -rf node_modules/@steuer-fair && mkdir -p node_modules/@steuer-fair && cp -r packages/shared node_modules/@steuer-fair/shared

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install Chrome für Puppeteer
# Install Java 17 for Flyway
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont


# Setze Chrome-Umgebungsvariablen
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Erstelle logs Verzeichnis und setze Berechtigungen
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

ENV PORT=3001

CMD ["node", "dist/index.js"]
