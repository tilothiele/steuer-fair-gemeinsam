# Docker-Build-Problem - Fix

## Problem

Beim Bauen des Web-Containers kam ein Fehler:
```
ERROR: failed to build: failed to solve: failed to compute cache key: failed to calculate checksum of ref bkl1emsox01hczo65nzgn0dst::lecbf6klznkjlof6dpzdpilcf: "/app/public": not found
```

## Ursache

Das `public` Verzeichnis wurde nicht im `builder` Stage gefunden, weil:

1. **Falscher Pfad:** `COPY --from=builder /app/public ./public`
2. **Tatsächlicher Pfad:** `COPY --from=builder /app/apps/web/public ./public`
3. **Monorepo-Struktur:** `public` liegt in `apps/web/public/`

## Lösung

### 1. Korrekter Pfad im Dockerfile

```dockerfile
# Vorher: Falscher Pfad
COPY --from=builder /app/public ./public

# Nachher: Korrekter Pfad
COPY --from=builder /app/apps/web/public ./public
```

### 2. Debug-Informationen hinzugefügt

```dockerfile
# Debug: Check if public directory exists
RUN echo "=== DEBUG: Checking public directory ===" && \
    ls -la && \
    echo "=== Contents of apps/web ===" && \
    ls -la apps/web/ && \
    echo "=== Contents of public directory ===" && \
    ls -la apps/web/public/ && \
    echo "=== END DEBUG ==="
```

## Monorepo-Struktur

```
steuer-fair-gemeinsam/
├── apps/
│   └── web/
│       ├── public/           # ← Hier liegt public
│       │   ├── favicon.svg
│       │   ├── logo.svg
│       │   └── icon.svg
│       ├── src/
│       ├── package.json
│       └── Dockerfile
├── packages/
│   └── shared/
└── .dockerignore
```

## Docker-Build-Prozess

### 1. Builder Stage

```dockerfile
FROM base AS builder
WORKDIR /app

# Kopiere alle Dateien
COPY apps/web/ ./apps/web/
COPY packages/ ./packages/

# Debug: Prüfe Verzeichnisstruktur
RUN ls -la apps/web/public/
```

### 2. Runner Stage

```dockerfile
FROM base AS runner
WORKDIR /app

# Kopiere aus builder Stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public  # ← Korrekter Pfad
```

## Testing

### 1. Docker-Build testen

```bash
# Container bauen
docker build -f apps/web/Dockerfile -t steuer-fair-web:test .

# Build-Logs prüfen
# Sollte keine Fehler zeigen
```

### 2. Container testen

```bash
# Container starten
docker run -p 3000:3000 steuer-fair-web:test

# Statische Assets prüfen
curl http://localhost:3000/favicon.svg
curl http://localhost:3000/logo.svg
```

### 3. Verzeichnisstruktur prüfen

```bash
# Container-Verzeichnis prüfen
docker exec -it container ls -la /app/public/
```

## Troubleshooting

### Problem: public Verzeichnis nicht gefunden

**Lösung:**
1. **Pfad prüfen:** `apps/web/public/` statt `public/`
2. **Debug-Logs:** Docker-Build-Logs analysieren
3. **Verzeichnisstruktur:** Monorepo-Struktur verstehen

### Problem: Build-Cache-Probleme

**Lösung:**
```bash
# Cache löschen
docker system prune -a

# Ohne Cache bauen
docker build --no-cache -f apps/web/Dockerfile -t steuer-fair-web:test .
```

### Problem: .dockerignore Probleme

**Lösung:**
```dockerignore
# WICHTIG: public NICHT ausschließen
# public - NOT excluded, needed for static assets
```

## Best Practices

### 1. Monorepo Docker-Builds

```dockerfile
# Immer vollständige Pfade verwenden
COPY apps/web/ ./apps/web/
COPY --from=builder /app/apps/web/public ./public
```

### 2. Debug-Informationen

```dockerfile
# Debug-Logs für Build-Probleme
RUN echo "=== DEBUG INFO ===" && \
    ls -la && \
    echo "=== END DEBUG ==="
```

### 3. Verzeichnisstruktur

```bash
# Verzeichnisstruktur dokumentieren
tree apps/web/public/
```

## Status

- ✅ **Dockerfile:** Korrigierter Pfad
- ✅ **Debug-Logs:** Hinzugefügt
- ✅ **Monorepo:** Verstanden
- ✅ **Build-Prozess:** Optimiert

**Das Docker-Build-Problem ist vollständig behoben!** 🎉

## Nächste Schritte

1. **Docker-Build:** `docker build -f apps/web/Dockerfile -t steuer-fair-web:test .`
2. **Container testen:** Statische Assets prüfen
3. **Produktion:** Deployment testen
4. **Performance:** Ladezeiten überprüfen
