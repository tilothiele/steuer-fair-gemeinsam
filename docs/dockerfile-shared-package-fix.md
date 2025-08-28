# Dockerfile Shared Package Fix

## Problem

Der Docker Build schlug fehl mit dem Fehler:
```
src/types/tax-models.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
```

## Ursache

Das Problem war, dass die `package.json` des shared Packages nicht korrekt kopiert wurde, bevor `npm ci` ausgeführt wurde. Der Build-Prozess versuchte, das shared Package zu bauen, ohne dass die Dependencies installiert waren.

## Lösung

### **Vorher (falsch):**
```dockerfile
# Copy shared package first
COPY packages/shared ./packages/shared

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build
WORKDIR /app
```

### **Nachher (korrekt):**
```dockerfile
# Copy shared package first
COPY packages/shared ./packages/shared

# Install dependencies for shared package
WORKDIR /app/packages/shared
RUN npm ci

# Build shared package
RUN npm run build
WORKDIR /app

# Install dependencies for main app
COPY package.json package-lock.json* ./
RUN npm ci
```

## Build-Prozess

### **1. Shared Package Setup**
```dockerfile
# Copy shared package first
COPY packages/shared ./packages/shared

# Install dependencies for shared package
WORKDIR /app/packages/shared
RUN npm ci
```

### **2. Shared Package Build**
```dockerfile
# Build shared package
RUN npm run build
WORKDIR /app
```

### **3. Main App Setup**
```dockerfile
# Install dependencies for main app
COPY package.json package-lock.json* ./
RUN npm ci
```

### **4. Main App Build**
```dockerfile
# Build the application
RUN npm run build
```

## Vorteile der Lösung

### ✅ **Korrekte Dependency-Installation**
- Shared Package Dependencies werden installiert
- Zod-Module ist verfügbar
- TypeScript-Deklarationen werden generiert

### ✅ **Korrekte Build-Reihenfolge**
1. **Shared Package kopieren**
2. **Shared Package Dependencies installieren**
3. **Shared Package bauen**
4. **Main App Dependencies installieren**
5. **Main App bauen**

### ✅ **Monorepo-Support**
- Shared Package wird korrekt behandelt
- Dependencies werden in der richtigen Reihenfolge installiert
- Build-Kontext ist korrekt gesetzt

## Anwendung

### **API Dockerfile**
```dockerfile
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
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nodejs

EXPOSE 3001

ENV PORT=3001

CMD ["node", "dist/index.js"]
```

### **Web Dockerfile**
```dockerfile
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
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .

# Build the application
RUN npm run build

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
```

## Nächste Schritte

1. **GitHub Actions testen** - Neuen Release erstellen
2. **Build-Logs prüfen** - Sicherstellen, dass keine Fehler auftreten
3. **Docker Images testen** - Lokale Tests der Images

## Troubleshooting

### **Zod-Module nicht gefunden**
- ✅ Prüfen Sie, ob das shared Package kopiert wurde
- ✅ Stellen Sie sicher, dass `npm ci` im shared Verzeichnis ausgeführt wird
- ✅ Prüfen Sie die Build-Reihenfolge

### **Build-Reihenfolge**
- ✅ Shared Package wird vor der Main App gebaut
- ✅ Dependencies werden in der richtigen Reihenfolge installiert
- ✅ Build-Kontext ist korrekt gesetzt
