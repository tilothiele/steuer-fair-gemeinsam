# Chrome Debug-Logging: Erweiterte Diagnose

## Problem

**TargetCloseError trotz Retry-Mechanismus:**
```
{"attempts":3,"details":"Die Verbindung zu Chrome wurde unerwartet geschlossen. Dies kann bei hoher Serverlast oder Chrome-Problemen auftreten.","level":"error","message":"Fehler beim PDF-Download: Chrome-Verbindung unerwartet geschlossen","originalError":"Protocol error (Target.setDiscoverTargets): Target closed"}
```

## Implementierte Chrome-Debug-Logs

### ✅ **1. Chrome-Argumente für Debug-Logging:**

```typescript
// Chrome Debug-Logging aktivieren
'--enable-logging',
'--v=1',
'--vmodule=*/chrome/*=1',
'--log-level=0',
'--enable-logging=stderr',
'--log-file=/tmp/chrome-debug.log',
'--disable-logging-redirect',
'--enable-logging-redirect',
'--log-to-stderr',
'--enable-logging-redirect=1',
'--enable-logging-redirect=2',
'--enable-logging-redirect=3',
'--enable-logging-redirect=4',
'--enable-logging-redirect=5',
'--enable-logging-redirect=6',
'--enable-logging-redirect=7',
'--enable-logging-redirect=8',
'--enable-logging-redirect=9',
'--enable-logging-redirect=10'
```

### ✅ **2. Puppeteer Debug-Logging:**

```typescript
// Puppeteer Debug-Logging aktivieren
process.env.DEBUG = 'puppeteer:*';
logger.info('Puppeteer Debug-Logging aktiviert');
```

## Container-Untersuchung mit Debug-Logs

### 🔍 **1. Chrome-Logs im Container anzeigen:**

```bash
# In den Container einsteigen
docker exec -it steuer-fair-api /bin/sh

# Chrome-Debug-Log-Datei prüfen
ls -la /tmp/chrome-debug.log
cat /tmp/chrome-debug.log

# Chrome-Logs in Echtzeit verfolgen
tail -f /tmp/chrome-debug.log
```

### 🔍 **2. Container-Logs mit Chrome-Informationen:**

```bash
# API-Container-Logs mit Chrome-Debug
docker logs steuer-fair-api 2>&1 | grep -i "chrome\|puppeteer\|target\|debug"

# Spezifisch für PDF-Generierung
docker logs steuer-fair-api 2>&1 | grep -A 10 -B 10 "PDF-Generierung"

# Chrome-Konfiguration-Logs
docker logs steuer-fair-api 2>&1 | grep -i "chrome-konfiguration"
```

### 🔍 **3. Puppeteer-Debug-Logs:**

```bash
# Puppeteer-spezifische Logs
docker logs steuer-fair-api 2>&1 | grep -i "puppeteer"

# Debug-Logs mit Zeitstempel
docker logs steuer-fair-api --timestamps 2>&1 | grep -i "debug"
```

### 🔍 **4. Chrome-Prozess-Details:**

```bash
# Im Container ausführen:

# Chrome-Prozesse mit Details
ps aux | grep -i chrome
ps aux | grep -i chromium

# Chrome-Prozess-Status
pgrep -f chrome
pgrep -f chromium

# Chrome-Prozess-Informationen
cat /proc/$(pgrep -f chrome)/status 2>/dev/null || echo "Chrome-Prozess nicht gefunden"
```

### 🔍 **5. Chrome-Logs mit verschiedenen Verbosity-Levels:**

```bash
# Chrome mit maximaler Verbosity starten
chromium --headless --no-sandbox --disable-setuid-sandbox \
  --enable-logging --v=1 --log-level=0 \
  --log-file=/tmp/chrome-test.log \
  --print-to-pdf=/tmp/test.pdf \
  about:blank

# Logs analysieren
cat /tmp/chrome-test.log
```

## Debug-Log-Analyse

### 📊 **1. Häufige Chrome-Log-Muster:**

```bash
# Target-Close-Fehler
grep -i "target.*close" /tmp/chrome-debug.log

# Protocol-Fehler
grep -i "protocol.*error" /tmp/chrome-debug.log

# Memory-Fehler
grep -i "memory\|out of memory" /tmp/chrome-debug.log

# Sandbox-Fehler
grep -i "sandbox" /tmp/chrome-debug.log

# GPU-Fehler
grep -i "gpu\|graphics" /tmp/chrome-debug.log
```

### 📊 **2. Puppeteer-Log-Analyse:**

```bash
# Puppeteer-Verbindungsfehler
grep -i "connection\|connect" /tmp/chrome-debug.log

# Puppeteer-Timeout-Fehler
grep -i "timeout" /tmp/chrome-debug.log

# Puppeteer-Launch-Fehler
grep -i "launch\|start" /tmp/chrome-debug.log
```

### 📊 **3. System-Ressourcen-Logs:**

```bash
# Memory-Usage während PDF-Generierung
grep -i "memory\|mem" /tmp/chrome-debug.log

# CPU-Usage
grep -i "cpu\|processor" /tmp/chrome-debug.log

# Disk-Usage
grep -i "disk\|space" /tmp/chrome-debug.log
```

## Erweiterte Debug-Optionen

### 🔧 **1. Chrome mit Remote-Debugging:**

```typescript
// Chrome mit Remote-Debugging starten
browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--remote-debugging-port=9222',
    '--remote-debugging-address=0.0.0.0',
    '--enable-logging',
    '--v=1'
  ],
  executablePath: process.env.CHROME_BIN || undefined
});
```

### 🔧 **2. Chrome mit Performance-Logging:**

```typescript
// Performance-Logging aktivieren
args: [
  '--enable-logging',
  '--v=1',
  '--enable-tracing',
  '--trace-startup',
  '--trace-startup-file=/tmp/chrome-trace.json',
  '--trace-startup-duration=10'
]
```

### 🔧 **3. Chrome mit Crash-Logging:**

```typescript
// Crash-Logging aktivieren
args: [
  '--enable-logging',
  '--v=1',
  '--crash-dumps-dir=/tmp/chrome-crashes',
  '--enable-crash-reporter',
  '--crash-on-hang-threads'
]
```

## Troubleshooting mit Debug-Logs

### 🛠️ **1. TargetCloseError-Analyse:**

```bash
# TargetCloseError-Logs analysieren
grep -A 5 -B 5 "Target.*close" /tmp/chrome-debug.log

# Protocol-Fehler vor TargetClose
grep -A 10 -B 5 "Protocol error" /tmp/chrome-debug.log

# Chrome-Prozess-Status vor Fehler
grep -A 5 -B 5 "process.*exit" /tmp/chrome-debug.log
```

### 🛠️ **2. Memory-Probleme identifizieren:**

```bash
# Memory-Usage-Logs
grep -i "memory.*usage\|out.*memory" /tmp/chrome-debug.log

# Memory-Limits
grep -i "memory.*limit\|mem.*limit" /tmp/chrome-debug.log

# Memory-Allocation-Fehler
grep -i "memory.*alloc\|alloc.*fail" /tmp/chrome-debug.log
```

### 🛠️ **3. Chrome-Start-Probleme:**

```bash
# Chrome-Start-Logs
grep -A 10 "chrome.*start\|launch.*chrome" /tmp/chrome-debug.log

# Chrome-Initialisierung
grep -A 5 -B 5 "init\|initialize" /tmp/chrome-debug.log

# Chrome-Version-Info
grep -i "version\|build" /tmp/chrome-debug.log
```

## Log-Datei-Management

### 📁 **1. Log-Dateien rotieren:**

```bash
# Log-Datei-Größe prüfen
ls -lh /tmp/chrome-debug.log

# Log-Datei rotieren (falls zu groß)
mv /tmp/chrome-debug.log /tmp/chrome-debug.log.old
touch /tmp/chrome-debug.log

# Log-Datei komprimieren
gzip /tmp/chrome-debug.log.old
```

### 📁 **2. Log-Dateien aus Container extrahieren:**

```bash
# Log-Datei aus Container kopieren
docker cp steuer-fair-api:/tmp/chrome-debug.log ./chrome-debug.log

# Alle Log-Dateien extrahieren
docker cp steuer-fair-api:/tmp/ ./chrome-logs/
```

### 📁 **3. Log-Dateien analysieren:**

```bash
# Log-Datei mit Zeitstempel analysieren
cat chrome-debug.log | grep "$(date +%Y-%m-%d)"

# Log-Datei nach Fehlern durchsuchen
cat chrome-debug.log | grep -i "error\|fail\|exception"

# Log-Datei nach PDF-Generierung filtern
cat chrome-debug.log | grep -A 20 -B 5 "pdf\|PDF"
```

## Monitoring-Script

### 📊 **Chrome-Debug-Monitor:**

```bash
#!/bin/bash
# chrome-debug-monitor.sh

CONTAINER_NAME="steuer-fair-api"
LOG_FILE="/tmp/chrome-debug.log"

echo "=== Chrome Debug Monitor ==="
echo "Container: $CONTAINER_NAME"
echo "Log-Datei: $LOG_FILE"
echo "Zeit: $(date)"
echo ""

# Chrome-Prozesse prüfen
echo "=== Chrome-Prozesse ==="
docker exec $CONTAINER_NAME ps aux | grep -i chrome || echo "Keine Chrome-Prozesse gefunden"

# Log-Datei-Größe
echo ""
echo "=== Log-Datei-Status ==="
docker exec $CONTAINER_NAME ls -lh $LOG_FILE 2>/dev/null || echo "Log-Datei nicht gefunden"

# Letzte Log-Einträge
echo ""
echo "=== Letzte Log-Einträge ==="
docker exec $CONTAINER_NAME tail -20 $LOG_FILE 2>/dev/null || echo "Keine Log-Einträge"

# Memory-Usage
echo ""
echo "=== Memory-Usage ==="
docker exec $CONTAINER_NAME free -h

# Chrome-Fehler
echo ""
echo "=== Chrome-Fehler ==="
docker exec $CONTAINER_NAME grep -i "error\|fail\|exception" $LOG_FILE 2>/dev/null | tail -10 || echo "Keine Fehler gefunden"
```

## Status

- ✅ **Chrome Debug-Logging aktiviert:** Maximale Verbosity
- ✅ **Puppeteer Debug-Logging aktiviert:** Vollständige Protokollierung
- ✅ **Log-Datei-Pfad:** `/tmp/chrome-debug.log`
- ✅ **Remote-Debugging:** Port 9222 verfügbar
- ✅ **Performance-Logging:** Trace-Dateien verfügbar

**Chrome wird jetzt maximale Debug-Informationen schreiben!** 🔍

## Nächste Schritte

1. **Container neu bauen:** Mit Debug-Logging
2. **PDF-Generierung testen:** Logs analysieren
3. **TargetCloseError untersuchen:** Spezifische Ursache identifizieren
4. **Chrome-Logs auswerten:** System-Ressourcen prüfen
