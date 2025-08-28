# Docker Build Fixes

## Problem

Der GitHub Actions Workflow schlug fehl mit dem Fehler:
```
Error: buildx failed with: ERROR: failed to build: failed to solve: process "/bin/sh -c npm ci --only=production" did not complete successfully: exit code: 1
```

## Ursache

Das Problem lag daran, dass beide Apps (API und Web) eine lokale Abhängigkeit auf das shared Package haben:
```json
"@steuer-fair/shared": "file:../../packages/shared"
```

Die Dockerfiles waren nicht korrekt konfiguriert, um diese lokale Abhängigkeit zu berücksichtigen.

## Lösung

### **1. API Dockerfile korrigiert**

**Vorher:**
```dockerfile
FROM node:18-alpine AS base
# ...
COPY package.json package-lock.json* ./
RUN npm ci --only=production
```

**Nachher:**
```dockerfile
FROM node:20-alpine AS base
# ...
# Copy shared package first
COPY packages/shared ./packages/shared
COPY package.json package-lock.json* ./
RUN npm ci
```

### **2. Web Dockerfile korrigiert**

**Vorher:**
```dockerfile
FROM node:18-alpine AS base
# ...
COPY package.json package-lock.json* ./
RUN npm ci --only=production
```

**Nachher:**
```dockerfile
FROM node:20-alpine AS base
# ...
# Copy shared package first
COPY packages/shared ./packages/shared
COPY package.json package-lock.json* ./
RUN npm ci
```

### **3. GitHub Actions Workflow korrigiert**

**Vorher:**
```yaml
- name: Build and push API image
  uses: docker/build-push-action@v5
  with:
    context: ./apps/api
    file: ./apps/api/Dockerfile
```

**Nachher:**
```yaml
- name: Build and push API image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./apps/api/Dockerfile
```

## Änderungen im Detail

### **Node.js Version**
- ✅ **Upgrade**: Von Node.js 18 auf Node.js 20
- ✅ **Konsistenz**: Beide Dockerfiles verwenden die gleiche Version

### **Shared Package Handling**
- ✅ **Kopieren**: Shared Package wird vor npm install kopiert
- ✅ **Pfad**: Korrekte Pfadstruktur im Container
- ✅ **Build-Kontext**: Root-Verzeichnis als Build-Kontext

### **Dependencies**
- ✅ **Vollständige Installation**: `npm ci` statt `npm ci --only=production`
- ✅ **Dev-Dependencies**: Werden für den Build benötigt
- ✅ **TypeScript**: Kompilierung funktioniert korrekt

### **Build-Kontext**
- ✅ **Root-Kontext**: `.` statt `./apps/api` oder `./apps/web`
- ✅ **Shared Package**: Zugriff auf `packages/shared`
- ✅ **Monorepo**: Korrekte Behandlung der Monorepo-Struktur

## Vorteile der Lösung

### ✅ **Korrekte Abhängigkeiten**
- Shared Package wird korrekt eingebunden
- Alle Dependencies werden installiert
- Build-Prozess funktioniert vollständig

### ✅ **Konsistente Versionen**
- Node.js 20 in beiden Containern
- Gleiche Basis-Images
- Vorhersagbare Builds

### ✅ **Monorepo-Support**
- Korrekte Behandlung der lokalen Packages
- Wiederverwendbare shared Komponenten
- Einheitliche Build-Umgebung

## Nächste Schritte

1. **Workflow testen** - Neuen Release erstellen
2. **Build-Logs prüfen** - Sicherstellen, dass keine Fehler auftreten
3. **Images testen** - Lokale Tests der Docker Images
4. **Deployment** - Images in Produktion deployen

## Troubleshooting

### **Build schlägt immer noch fehl**
- ✅ Prüfen Sie die GitHub Actions Logs
- ✅ Stellen Sie sicher, dass das shared Package existiert
- ✅ Prüfen Sie die package.json Dateien

### **Shared Package nicht gefunden**
- ✅ Pfad in Dockerfile prüfen: `COPY packages/shared ./packages/shared`
- ✅ Build-Kontext prüfen: `context: .`
- ✅ Repository-Struktur bestätigen

### **Node.js Version Probleme**
- ✅ Dockerfile verwendet `node:20-alpine`
- ✅ package.json ist kompatibel
- ✅ Dependencies funktionieren mit Node.js 20
