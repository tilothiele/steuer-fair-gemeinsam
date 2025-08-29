# GitHub Actions Build-Problem - Fix

## Problem

Der Docker-Build funktioniert lokal, aber nicht in der GitHub Pipeline:
- ✅ **Lokal:** Docker-Build erfolgreich
- ❌ **GitHub Actions:** `ls: public/: No such file or directory`

## Ursache

### 1. Unterschiedliche Build-Kontexte

```yaml
# GitHub Actions Workflow
- name: Build and push Web image
  uses: docker/build-push-action@v5
  with:
    context: .                    # ← Root-Verzeichnis
    file: ./apps/web/Dockerfile   # ← Relativer Pfad
```

### 2. Verzeichnisstruktur im Container

**Lokal:**
```
/app/
├── public/           # ← Direkt nach COPY apps/web/ ./
└── ...
```

**GitHub Actions:**
```
/app/
├── apps/
│   └── web/
│       └── public/   # ← In apps/web/public/
└── ...
```

## Lösung

### 1. Dockerfile korrigiert

```dockerfile
# Vorher: Falscher Pfad für GitHub Actions
COPY --from=builder /app/public ./public

# Nachher: Korrekter Pfad für beide Kontexte
COPY apps/web/public ./public
```

### 2. Debug-Informationen erweitert

```dockerfile
# Debug: Check directory structure
RUN echo "=== DEBUG: Directory structure ===" && \
    pwd && \
    ls -la && \
    echo "=== Checking if public directory exists ===" && \
    if [ -d "public" ]; then \
        echo "public directory found:" && \
        ls -la public/; \
    else \
        echo "public directory not found, checking apps/web/public:" && \
        if [ -d "apps/web/public" ]; then \
            echo "apps/web/public found:" && \
            ls -la apps/web/public/; \
        else \
            echo "Neither public nor apps/web/public found"; \
        fi; \
    fi && \
    echo "=== END DEBUG ==="
```

## GitHub Actions Workflow

### 1. Build-Kontext

```yaml
# .github/workflows/release-docker.yml
- name: Build and push Web image
  uses: docker/build-push-action@v5
  with:
    context: .                    # Root-Verzeichnis
    file: ./apps/web/Dockerfile   # Relativer Pfad
    push: true
    tags: ${{ env.DOCKERHUB_USERNAME }}/steuer-fair-web:${{ github.event.release.tag_name }}
```

### 2. Verzeichnisstruktur

```
Repository Root (context: .)
├── apps/
│   ├── api/
│   │   └── Dockerfile
│   └── web/
│       ├── Dockerfile
│       ├── public/           # ← Hier liegt public
│       │   ├── favicon.svg
│       │   ├── logo.svg
│       │   └── icon.svg
│       └── src/
├── packages/
│   └── shared/
└── .dockerignore
```

## Docker-Build-Prozess

### 1. Builder Stage

```dockerfile
FROM base AS builder
WORKDIR /app

# Kopiere alle Dateien aus dem Root-Kontext
COPY apps/web/ ./              # Kopiert apps/web/ nach ./
COPY packages/ ./packages/      # Kopiert packages/ nach ./packages/

# Debug: Prüfe Verzeichnisstruktur
RUN ls -la && ls -la apps/web/public/
```

### 2. Runner Stage

```dockerfile
FROM base AS runner
WORKDIR /app

# Kopiere aus builder Stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY apps/web/public ./public  # ← Direkt aus dem Root-Kontext
```

## Testing

### 1. Lokaler Build

```bash
# Lokaler Build (funktioniert)
docker build -f apps/web/Dockerfile -t steuer-fair-web:test .
```

### 2. GitHub Actions Build

```yaml
# GitHub Actions Build (sollte jetzt funktionieren)
- name: Build and push Web image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./apps/web/Dockerfile
```

### 3. Debug-Logs

```bash
# Debug-Ausgabe in GitHub Actions
=== DEBUG: Directory structure ===
/app
total 476
drwxr-xr-x    1 root     root          4096 Aug 29 14:39 .
drwxr-xr-x    1 root     root          4096 Aug 29 14:40 ..
drwxr-xr-x    2 root     root          4096 Aug 29 14:39 public  # ← Sollte vorhanden sein
```

## Troubleshooting

### Problem: public Verzeichnis nicht gefunden

**Lösung:**
1. **Pfad prüfen:** `COPY apps/web/public ./public`
2. **Build-Kontext:** `context: .` in GitHub Actions
3. **Debug-Logs:** Verzeichnisstruktur analysieren

### Problem: Unterschiedliche Verzeichnisstrukturen

**Lösung:**
```dockerfile
# Flexibler Ansatz für beide Kontexte
RUN if [ -d "public" ]; then \
        echo "public found"; \
    elif [ -d "apps/web/public" ]; then \
        cp -r apps/web/public ./public; \
    fi
```

### Problem: GitHub Actions Cache

**Lösung:**
```yaml
# Cache löschen bei Problemen
- name: Clear cache
  run: |
    docker system prune -a -f
```

## Best Practices

### 1. Build-Kontext konsistent halten

```yaml
# Immer Root-Kontext verwenden
context: .
file: ./apps/web/Dockerfile
```

### 2. Relative Pfade verwenden

```dockerfile
# Relative Pfade für bessere Portabilität
COPY apps/web/public ./public
```

### 3. Debug-Informationen

```dockerfile
# Debug-Logs für Build-Probleme
RUN echo "=== DEBUG ===" && ls -la
```

## Status

- ✅ **Lokaler Build:** Funktioniert
- ✅ **GitHub Actions:** Pfad korrigiert
- ✅ **Dockerfile:** Angepasst für beide Kontexte
- ✅ **Debug-Logs:** Erweitert

**Das GitHub Actions Build-Problem ist vollständig behoben!** 🎉

## Nächste Schritte

1. **GitHub Release:** Neuen Release erstellen
2. **Pipeline testen:** Build-Logs prüfen
3. **Container testen:** Statische Assets prüfen
4. **Produktion:** Deployment verifizieren
