# Chrome-Umgebungsvariablen: Puppeteer-Konfiguration

## Übersicht

Die Puppeteer-Konfiguration kann jetzt über Umgebungsvariablen gesteuert werden. Dies ermöglicht eine flexible Anpassung der Chrome-Argumente ohne Code-Änderungen.

## Verfügbare Umgebungsvariablen

### 🔧 **CHROME_ARGS**
**Beschreibung:** Chrome-Argumente als komma-getrennte Liste
**Format:** `--arg1,--arg2,--arg3`
**Standard:** Vordefinierte Argumente für Container-Umgebung

**Beispiel:**
```bash
CHROME_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--disable-extensions,--single-process"
```

### 🔧 **CHROME_BIN**
**Beschreibung:** Pfad zur Chrome/Chromium-Executable
**Standard:** `/usr/bin/chromium`
**Beispiel:**
```bash
CHROME_BIN="/usr/bin/chromium-browser"
```

### 🔧 **CHROME_TIMEOUT**
**Beschreibung:** Timeout für Puppeteer-Launch in Millisekunden
**Standard:** `30000` (30 Sekunden)
**Beispiel:**
```bash
CHROME_TIMEOUT="60000"
```

### 🔧 **CHROME_PROTOCOL_TIMEOUT**
**Beschreibung:** Timeout für Chrome-Protokoll in Millisekunden
**Standard:** `30000` (30 Sekunden)
**Beispiel:**
```bash
CHROME_PROTOCOL_TIMEOUT="45000"
```

## Standard-Chrome-Argumente

### 📋 **Basis-Argumente (immer aktiv):**
```bash
--no-sandbox
--disable-setuid-sandbox
--disable-dev-shm-usage
--disable-gpu
--no-first-run
--no-zygote
--disable-extensions
--disable-background-timer-throttling
--disable-backgrounding-occluded-windows
--disable-renderer-backgrounding
--disable-web-security
--disable-features=VizDisplayCompositor
--disable-ipc-flooding-protection
--disable-default-apps
--disable-sync
--disable-translate
--hide-scrollbars
--mute-audio
--no-default-browser-check
--disable-component-extensions-with-background-pages
--disable-background-networking
--disable-client-side-phishing-detection
--disable-hang-monitor
--disable-prompt-on-repost
--disable-domain-reliability
--disable-features=TranslateUI
--single-process
```

### 📋 **Debug-Logging-Argumente (Standard):**
```bash
--enable-logging
--v=1
--vmodule=*/chrome/*=1
--log-level=0
--enable-logging=stderr
--log-file=/tmp/chrome-debug.log
--disable-logging-redirect
--enable-logging-redirect
--log-to-stderr
--enable-logging-redirect=1
--enable-logging-redirect=2
--enable-logging-redirect=3
--enable-logging-redirect=4
--enable-logging-redirect=5
--enable-logging-redirect=6
--enable-logging-redirect=7
--enable-logging-redirect=8
--enable-logging-redirect=9
--enable-logging-redirect=10
```

## Konfigurationsbeispiele

### 🎯 **1. Minimale Konfiguration (ohne Debug-Logs):**
```bash
CHROME_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--disable-extensions,--single-process"
```

### 🎯 **2. Erweiterte Debug-Konfiguration:**
```bash
CHROME_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--disable-extensions,--single-process,--enable-logging,--v=1,--log-file=/tmp/chrome-debug.log,--log-to-stderr"
```

### 🎯 **3. Performance-optimierte Konfiguration:**
```bash
CHROME_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--disable-extensions,--single-process,--disable-background-timer-throttling,--disable-backgrounding-occluded-windows,--disable-renderer-backgrounding,--disable-web-security,--disable-features=VizDisplayCompositor,--disable-ipc-flooding-protection,--disable-default-apps,--disable-sync,--disable-translate,--hide-scrollbars,--mute-audio,--no-default-browser-check,--disable-component-extensions-with-background-pages,--disable-background-networking,--disable-client-side-phishing-detection,--disable-hang-monitor,--disable-prompt-on-repost,--disable-domain-reliability,--disable-features=TranslateUI"
```

### 🎯 **4. Remote-Debugging-Konfiguration:**
```bash
CHROME_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--disable-extensions,--single-process,--remote-debugging-port=9222,--remote-debugging-address=0.0.0.0"
```

### 🎯 **5. Memory-optimierte Konfiguration:**
```bash
CHROME_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--disable-extensions,--single-process,--memory-pressure-off,--disable-background-timer-throttling,--disable-backgrounding-occluded-windows,--disable-renderer-backgrounding"
```

## Docker-Integration

### 🐳 **1. Docker Compose (.env):**
```bash
# Chrome-Konfiguration
CHROME_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--disable-extensions,--single-process,--enable-logging,--v=1,--log-file=/tmp/chrome-debug.log
CHROME_BIN=/usr/bin/chromium
CHROME_TIMEOUT=30000
CHROME_PROTOCOL_TIMEOUT=30000
```

### 🐳 **2. Docker Compose (docker-compose.yml):**
```yaml
services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      - CHROME_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--disable-extensions,--single-process
      - CHROME_BIN=/usr/bin/chromium
      - CHROME_TIMEOUT=30000
      - CHROME_PROTOCOL_TIMEOUT=30000
```

### 🐳 **3. Dockerfile (ENV):**
```dockerfile
# Chrome-Umgebungsvariablen
ENV CHROME_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--disable-extensions,--single-process"
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROME_TIMEOUT=30000
ENV CHROME_PROTOCOL_TIMEOUT=30000
```

## Troubleshooting-Konfigurationen

### 🔧 **1. TargetCloseError beheben:**
```bash
CHROME_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--disable-extensions,--single-process,--disable-background-timer-throttling,--disable-backgrounding-occluded-windows,--disable-renderer-backgrounding,--disable-web-security,--disable-features=VizDisplayCompositor,--disable-ipc-flooding-protection,--disable-default-apps,--disable-sync,--disable-translate,--hide-scrollbars,--mute-audio,--no-default-browser-check,--disable-component-extensions-with-background-pages,--disable-background-networking,--disable-client-side-phishing-detection,--disable-hang-monitor,--disable-prompt-on-repost,--disable-domain-reliability,--disable-features=TranslateUI,--disable-ipc-flooding-protection"
CHROME_TIMEOUT=60000
CHROME_PROTOCOL_TIMEOUT=60000
```

### 🔧 **2. Memory-Probleme beheben:**
```bash
CHROME_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--disable-extensions,--single-process,--memory-pressure-off,--disable-background-timer-throttling,--disable-backgrounding-occluded-windows,--disable-renderer-backgrounding,--disable-web-security,--disable-features=VizDisplayCompositor,--disable-ipc-flooding-protection,--disable-default-apps,--disable-sync,--disable-translate,--hide-scrollbars,--mute-audio,--no-default-browser-check,--disable-component-extensions-with-background-pages,--disable-background-networking,--disable-client-side-phishing-detection,--disable-hang-monitor,--disable-prompt-on-repost,--disable-domain-reliability,--disable-features=TranslateUI"
```

### 🔧 **3. Sandbox-Probleme beheben:**
```bash
CHROME_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--disable-extensions,--single-process,--disable-background-timer-throttling,--disable-backgrounding-occluded-windows,--disable-renderer-backgrounding,--disable-web-security,--disable-features=VizDisplayCompositor,--disable-ipc-flooding-protection,--disable-default-apps,--disable-sync,--disable-translate,--hide-scrollbars,--mute-audio,--no-default-browser-check,--disable-component-extensions-with-background-pages,--disable-background-networking,--disable-client-side-phishing-detection,--disable-hang-monitor,--disable-prompt-on-repost,--disable-domain-reliability,--disable-features=TranslateUI,--disable-setuid-sandbox,--disable-dev-shm-usage"
```

## Logging und Monitoring

### 📊 **1. Chrome-Argumente in Logs:**
```typescript
// Debug: Chrome-Argumente loggen
logger.info('Chrome-Argumente:', {
  CHROME_ARGS: process.env.CHROME_ARGS,
  argsCount: chromeArgs.length,
  args: chromeArgs
});
```

### 📊 **2. Umgebungsvariablen prüfen:**
```bash
# Im Container ausführen
echo $CHROME_ARGS
echo $CHROME_BIN
echo $CHROME_TIMEOUT
echo $CHROME_PROTOCOL_TIMEOUT

# Alle Chrome-Umgebungsvariablen
env | grep -i chrome
```

### 📊 **3. Chrome-Argumente validieren:**
```bash
# Chrome mit benutzerdefinierten Argumenten testen
chromium --headless --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu --print-to-pdf=/tmp/test.pdf about:blank
```

## Best Practices

### ✅ **1. Argumente testen:**
- Testen Sie neue Argumente immer in einer sicheren Umgebung
- Verwenden Sie das Monitoring-Script zur Überwachung
- Prüfen Sie die Chrome-Logs auf Fehler

### ✅ **2. Performance optimieren:**
- Entfernen Sie unnötige Argumente
- Verwenden Sie `--single-process` für Container
- Setzen Sie angemessene Timeouts

### ✅ **3. Debugging:**
- Aktivieren Sie Debug-Logs nur bei Bedarf
- Rotieren Sie Log-Dateien regelmäßig
- Überwachen Sie Memory-Usage

### ✅ **4. Sicherheit:**
- Verwenden Sie `--no-sandbox` nur in Container
- Deaktivieren Sie unnötige Features
- Setzen Sie angemessene Berechtigungen

## Status

- ✅ **CHROME_ARGS:** Konfigurierbar über Umgebungsvariable
- ✅ **CHROME_BIN:** Chrome-Pfad konfigurierbar
- ✅ **CHROME_TIMEOUT:** Launch-Timeout konfigurierbar
- ✅ **CHROME_PROTOCOL_TIMEOUT:** Protokoll-Timeout konfigurierbar
- ✅ **Debug-Logging:** Chrome-Argumente werden geloggt
- ✅ **Fallback:** Standard-Argumente bei fehlender Konfiguration

**Die Puppeteer-Konfiguration ist jetzt vollständig über Umgebungsvariablen steuerbar!** 🎉
