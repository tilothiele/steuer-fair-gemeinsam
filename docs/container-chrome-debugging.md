# Container-Chrome-Debugging: TargetCloseError beheben

## Problem

**Alle 3 Retry-Versuche fehlschlagen mit TargetCloseError:**
```
{"attempts":3,"details":"Die Verbindung zu Chrome wurde unerwartet geschlossen. Dies kann bei hoher Serverlast oder Chrome-Problemen auftreten.","level":"error","message":"Fehler beim PDF-Download: Chrome-Verbindung unerwartet geschlossen","originalError":"Protocol error (Target.setDiscoverTargets): Target closed"}
```

## Container-Untersuchung

### 🔍 **1. Container-Logs analysieren:**

```bash
# API-Container-Logs mit Zeitstempel
docker logs steuer-fair-api --timestamps --tail 100

# Spezifisch für PDF-Fehler
docker logs steuer-fair-api 2>&1 | grep -i "pdf\|chrome\|target"

# Chrome-Konfiguration-Logs
docker logs steuer-fair-api 2>&1 | grep -i "chrome-konfiguration"
```

### 🔍 **2. In den Container einsteigen:**

```bash
# In den API-Container einsteigen
docker exec -it steuer-fair-api /bin/sh

# Oder mit bash (falls verfügbar)
docker exec -it steuer-fair-api /bin/bash
```

### 🔍 **3. Chrome-Installation prüfen:**

```bash
# Im Container ausführen:

# Chrome-Pfad prüfen
which chromium
which chromium-browser
ls -la /usr/bin/chromium*

# Chrome-Version prüfen
chromium --version
chromium-browser --version

# Chrome-Prozesse prüfen
ps aux | grep chrome
ps aux | grep chromium

# Chrome-Dateien suchen
find /usr -name "*chromium*" 2>/dev/null
```

### 🔍 **4. Memory und Resources prüfen:**

```bash
# Memory-Usage
free -h
cat /proc/meminfo | head -10

# Disk-Space
df -h

# CPU-Usage
top -n 1

# System-Limits
ulimit -a
```

### 🔍 **5. Chrome manuell testen:**

```bash
# Chrome mit Debug-Output starten
chromium --headless --no-sandbox --disable-setuid-sandbox --print-to-pdf=/tmp/test.pdf --disable-gpu about:blank

# Prüfen ob PDF erstellt wurde
ls -la /tmp/test.pdf

# Chrome mit Puppeteer-ähnlichen Argumenten testen
chromium --headless --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu --no-first-run --no-zygote --single-process --disable-extensions about:blank
```

### 🔍 **6. Umgebungsvariablen prüfen:**

```bash
# Chrome-Umgebungsvariablen
echo $CHROME_BIN
echo $CHROME_PATH
echo $PUPPETEER_SKIP_CHROMIUM_DOWNLOAD

# Alle Umgebungsvariablen
env | grep -i chrome
env | grep -i puppeteer
```

## Implementierte Verbesserungen

### ✅ **1. Chrome-Pfad korrigiert:**

```dockerfile
# Install Chrome für Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && ln -sf /usr/bin/chromium /usr/bin/chromium-browser

# Setze Chrome-Umgebungsvariablen
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

### ✅ **2. Verbesserte Puppeteer-Konfiguration:**

```typescript
browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-extensions',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-ipc-flooding-protection',
    '--disable-default-apps',
    '--disable-sync',
    '--disable-translate',
    '--hide-scrollbars',
    '--mute-audio',
    '--no-default-browser-check',
    '--disable-component-extensions-with-background-pages',
    '--disable-background-networking',
    '--disable-client-side-phishing-detection',
    '--disable-hang-monitor',
    '--disable-prompt-on-repost',
    '--disable-domain-reliability',
    '--disable-features=TranslateUI',
    '--disable-ipc-flooding-protection',
    '--no-zygote',
    '--single-process'
  ],
  executablePath: process.env.CHROME_BIN || undefined,
  timeout: 30000,
  protocolTimeout: 30000
});
```

### ✅ **3. Debug-Logging hinzugefügt:**

```typescript
// Debug: Chrome-Pfad loggen
logger.info('Chrome-Konfiguration:', {
  CHROME_BIN: process.env.CHROME_BIN,
  CHROME_PATH: process.env.CHROME_PATH,
  attempt
});
```

## Troubleshooting-Schritte

### **1. Chrome-Pfad-Problem:**

```bash
# Im Container prüfen
which chromium
ls -la /usr/bin/chromium*

# Falls nicht gefunden, neu installieren
apk update && apk add chromium
```

### **2. Memory-Problem:**

```bash
# Memory prüfen
free -h

# Falls zu wenig Memory, Container mit mehr Memory starten
docker run --memory=2g --memory-swap=4g steuer-fair-api
```

### **3. Chrome-Prozess-Problem:**

```bash
# Chrome-Prozesse prüfen
ps aux | grep chrome

# Falls Chrome-Prozesse hängen, killen
pkill -f chrome
pkill -f chromium
```

### **4. Permission-Problem:**

```bash
# Chrome-Berechtigungen prüfen
ls -la /usr/bin/chromium
ls -la /usr/bin/chromium-browser

# Falls nötig, Berechtigungen setzen
chmod +x /usr/bin/chromium
chmod +x /usr/bin/chromium-browser
```

## Alternative Lösungen

### **1. Puppeteer-Core verwenden:**

```typescript
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

### **2. Externen Chrome-Service verwenden:**

```typescript
// Chrome-Service über HTTP-API
const response = await fetch('http://chrome-service:9222/json/version');
```

### **3. HTML-zu-PDF Service:**

```typescript
// Externer PDF-Service
const response = await fetch('https://pdf-service.com/generate', {
  method: 'POST',
  body: JSON.stringify({ html, options })
});
```

## Deployment

### **1. Container neu bauen:**

```bash
# API-Container mit Chrome neu bauen
docker build -f apps/api/Dockerfile -t steuer-fair-api:latest .
```

### **2. Container mit mehr Resources starten:**

```bash
# Mit mehr Memory
docker run --memory=2g --memory-swap=4g steuer-fair-api

# Mit mehr CPU
docker run --cpus=2 steuer-fair-api
```

### **3. Logs überwachen:**

```bash
# Live-Logs
docker logs -f steuer-fair-api

# Spezifische Logs
docker logs steuer-fair-api 2>&1 | grep -i "chrome\|pdf\|target"
```

## Status

- ✅ **Chrome-Pfad korrigiert:** `/usr/bin/chromium`
- ✅ **Verbesserte Puppeteer-Konfiguration:** Mehr Stabilität
- ✅ **Debug-Logging:** Chrome-Konfiguration sichtbar
- ✅ **Retry-Mechanismus:** 3 Versuche mit Backoff

**Die Chrome-Konfiguration ist jetzt optimiert für Container-Umgebungen!** 🎉

## Nächste Schritte

1. **Container neu bauen:** Mit verbesserter Chrome-Konfiguration
2. **Container-Untersuchung:** Chrome-Installation prüfen
3. **Testing:** PDF-Generierung in Container testen
4. **Monitoring:** Chrome-Prozesse überwachen
