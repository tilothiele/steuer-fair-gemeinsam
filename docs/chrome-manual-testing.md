# Chromium im Container manuell testen

## Übersicht

Manuelle Tests von Chromium im Container helfen dabei, Probleme zu identifizieren und die Konfiguration zu validieren.

## Container-Zugriff

### 🔍 **1. In den Container einsteigen:**

```bash
# In den API-Container einsteigen
docker exec -it steuer-fair-api /bin/sh

# Oder mit bash (falls verfügbar)
docker exec -it steuer-fair-api /bin/bash
```

### 🔍 **2. Container-Status prüfen:**

```bash
# Container-Name prüfen
docker ps | grep api

# Container-Logs prüfen
docker logs steuer-fair-api --tail 20
```

## Chromium-Installation prüfen

### 📋 **1. Chromium-Pfad und Version:**

```bash
# Im Container ausführen:

# Chromium-Pfad prüfen
which chromium
which chromium-browser

# Chromium-Version prüfen
chromium --version
chromium-browser --version

# Chromium-Dateien suchen
find /usr -name "*chromium*" 2>/dev/null
ls -la /usr/bin/chromium*
```

### 📋 **2. Chromium-Berechtigungen:**

```bash
# Berechtigungen prüfen
ls -la /usr/bin/chromium
ls -la /usr/bin/chromium-browser

# Falls nötig, Berechtigungen setzen
chmod +x /usr/bin/chromium
chmod +x /usr/bin/chromium-browser
```

### 📋 **3. Chromium-Abhängigkeiten:**

```bash
# Abhängigkeiten prüfen
ldd /usr/bin/chromium

# Fehlende Bibliotheken finden
ldd /usr/bin/chromium | grep "not found"
```

## Basis-Chromium-Tests

### 🧪 **1. Chromium-Start testen:**

```bash
# Einfacher Start-Test
chromium --version

# Headless-Start testen
chromium --headless --no-sandbox --disable-setuid-sandbox --print-to-pdf=/tmp/test.pdf about:blank

# Prüfen ob PDF erstellt wurde
ls -la /tmp/test.pdf
```

### 🧪 **2. Chromium mit Puppeteer-Argumenten testen:**

```bash
# Chromium mit Standard-Puppeteer-Argumenten
chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --no-first-run \
  --no-zygote \
  --disable-extensions \
  --single-process \
  --print-to-pdf=/tmp/puppeteer-test.pdf \
  about:blank

# PDF prüfen
ls -la /tmp/puppeteer-test.pdf
```

### 🧪 **3. Chromium mit Debug-Logging testen:**

```bash
# Chromium mit Debug-Logging
chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --enable-logging \
  --v=1 \
  --log-file=/tmp/chrome-test.log \
  --print-to-pdf=/tmp/debug-test.pdf \
  about:blank

# Logs prüfen
cat /tmp/chrome-test.log
ls -la /tmp/debug-test.pdf
```

## Erweiterte Chromium-Tests

### 🔧 **1. Chromium mit verschiedenen Argumenten testen:**

```bash
# Test 1: Minimale Argumente
chromium --headless --no-sandbox --disable-setuid-sandbox --print-to-pdf=/tmp/minimal.pdf about:blank

# Test 2: Mit GPU deaktiviert
chromium --headless --no-sandbox --disable-setuid-sandbox --disable-gpu --print-to-pdf=/tmp/no-gpu.pdf about:blank

# Test 3: Mit Single-Process
chromium --headless --no-sandbox --disable-setuid-sandbox --single-process --print-to-pdf=/tmp/single-process.pdf about:blank

# Test 4: Mit Memory-Optimierung
chromium --headless --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --print-to-pdf=/tmp/memory-opt.pdf about:blank
```

### 🔧 **2. Chromium-Performance-Tests:**

```bash
# Memory-Usage während Chromium-Start
time chromium --headless --no-sandbox --disable-setuid-sandbox --print-to-pdf=/tmp/performance.pdf about:blank

# Chromium-Prozesse prüfen
ps aux | grep chromium

# Memory-Usage prüfen
free -h
```

### 🔧 **3. Chromium mit HTML-Inhalt testen:**

```bash
# HTML-Datei erstellen
cat > /tmp/test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Test PDF</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .test { background: #f0f0f0; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Chromium PDF Test</h1>
    <div class="test">
        <p>Dies ist ein Test für die PDF-Generierung mit Chromium.</p>
        <p>Zeitstempel: $(date)</p>
    </div>
</body>
</html>
EOF

# PDF mit HTML-Inhalt generieren
chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --print-to-pdf=/tmp/html-test.pdf \
  file:///tmp/test.html

# PDF prüfen
ls -la /tmp/html-test.pdf
```

## Troubleshooting-Tests

### 🛠️ **1. Sandbox-Probleme testen:**

```bash
# Sandbox deaktiviert testen
chromium --headless --no-sandbox --disable-setuid-sandbox --print-to-pdf=/tmp/no-sandbox.pdf about:blank

# Mit Sandbox testen (sollte fehlschlagen)
chromium --headless --print-to-pdf=/tmp/with-sandbox.pdf about:blank
```

### 🛠️ **2. Memory-Probleme testen:**

```bash
# Memory vor Test prüfen
free -h

# Chromium mit Memory-Limits testen
chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --memory-pressure-off \
  --print-to-pdf=/tmp/memory-test.pdf \
  about:blank

# Memory nach Test prüfen
free -h
```

### 🛠️ **3. GPU-Probleme testen:**

```bash
# GPU deaktiviert testen
chromium --headless --no-sandbox --disable-setuid-sandbox --disable-gpu --print-to-pdf=/tmp/no-gpu.pdf about:blank

# GPU aktiviert testen (kann fehlschlagen)
chromium --headless --no-sandbox --disable-setuid-sandbox --print-to-pdf=/tmp/with-gpu.pdf about:blank
```

### 🛠️ **4. Single-Process-Probleme testen:**

```bash
# Single-Process testen
chromium --headless --no-sandbox --disable-setuid-sandbox --single-process --print-to-pdf=/tmp/single.pdf about:blank

# Multi-Process testen (kann fehlschlagen)
chromium --headless --no-sandbox --disable-setuid-sandbox --print-to-pdf=/tmp/multi.pdf about:blank
```

## Umgebungsvariablen-Tests

### 🔧 **1. Chrome-Umgebungsvariablen prüfen:**

```bash
# Umgebungsvariablen anzeigen
echo $CHROME_BIN
echo $CHROME_PATH
echo $CHROME_ARGS
echo $PUPPETEER_SKIP_CHROMIUM_DOWNLOAD

# Alle Chrome-Umgebungsvariablen
env | grep -i chrome
```

### 🔧 **2. Chromium mit Umgebungsvariablen testen:**

```bash
# Chromium mit CHROME_BIN testen
$CHROME_BIN --version

# Chromium mit benutzerdefinierten Argumenten testen
if [ ! -z "$CHROME_ARGS" ]; then
    $CHROME_BIN --headless $CHROME_ARGS --print-to-pdf=/tmp/env-test.pdf about:blank
    ls -la /tmp/env-test.pdf
else
    echo "CHROME_ARGS nicht gesetzt"
fi
```

## Debug-Logging-Tests

### 📊 **1. Chromium mit verschiedenen Log-Levels:**

```bash
# Log-Level 0 (minimal)
chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --enable-logging \
  --v=0 \
  --log-file=/tmp/chrome-log-0.log \
  --print-to-pdf=/tmp/log-0.pdf \
  about:blank

# Log-Level 1 (normal)
chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --enable-logging \
  --v=1 \
  --log-file=/tmp/chrome-log-1.log \
  --print-to-pdf=/tmp/log-1.pdf \
  about:blank

# Log-Level 2 (detailliert)
chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --enable-logging \
  --v=2 \
  --log-file=/tmp/chrome-log-2.log \
  --print-to-pdf=/tmp/log-2.pdf \
  about:blank
```

### 📊 **2. Log-Dateien analysieren:**

```bash
# Log-Dateien vergleichen
echo "=== Log-Level 0 ==="
cat /tmp/chrome-log-0.log

echo "=== Log-Level 1 ==="
cat /tmp/chrome-log-1.log

echo "=== Log-Level 2 ==="
cat /tmp/chrome-log-2.log
```

## Performance-Tests

### ⚡ **1. Chromium-Start-Zeit messen:**

```bash
# Start-Zeit messen
time chromium --headless --no-sandbox --disable-setuid-sandbox --print-to-pdf=/tmp/timing.pdf about:blank

# Mehrfache Tests
for i in {1..5}; do
    echo "Test $i:"
    time chromium --headless --no-sandbox --disable-setuid-sandbox --print-to-pdf=/tmp/timing-$i.pdf about:blank
done
```

### ⚡ **2. Memory-Usage überwachen:**

```bash
# Memory vor Test
echo "Memory vor Test:"
free -h

# Chromium starten und Memory überwachen
chromium --headless --no-sandbox --disable-setuid-sandbox --print-to-pdf=/tmp/memory-monitor.pdf about:blank &
CHROME_PID=$!

# Memory während Test
echo "Memory während Test:"
free -h

# Auf Chromium warten
wait $CHROME_PID

# Memory nach Test
echo "Memory nach Test:"
free -h
```

## Automatisierte Test-Scripts

### 📜 **1. Vollständiger Chromium-Test:**

```bash
#!/bin/bash
# chromium-test.sh

echo "=== Chromium-Test-Suite ==="
echo "Zeit: $(date)"
echo ""

# Chromium-Version
echo "=== Chromium-Version ==="
chromium --version
echo ""

# Basis-Test
echo "=== Basis-Test ==="
chromium --headless --no-sandbox --disable-setuid-sandbox --print-to-pdf=/tmp/basis-test.pdf about:blank
if [ -f /tmp/basis-test.pdf ]; then
    echo "✅ Basis-Test erfolgreich"
    ls -la /tmp/basis-test.pdf
else
    echo "❌ Basis-Test fehlgeschlagen"
fi
echo ""

# Puppeteer-Test
echo "=== Puppeteer-Test ==="
chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --no-first-run \
  --no-zygote \
  --disable-extensions \
  --single-process \
  --print-to-pdf=/tmp/puppeteer-test.pdf \
  about:blank
if [ -f /tmp/puppeteer-test.pdf ]; then
    echo "✅ Puppeteer-Test erfolgreich"
    ls -la /tmp/puppeteer-test.pdf
else
    echo "❌ Puppeteer-Test fehlgeschlagen"
fi
echo ""

# Memory-Usage
echo "=== Memory-Usage ==="
free -h
echo ""

# Chromium-Prozesse
echo "=== Chromium-Prozesse ==="
ps aux | grep chromium || echo "Keine Chromium-Prozesse gefunden"
echo ""

echo "=== Test abgeschlossen ==="
```

### 📜 **2. Chromium-Argumente-Test:**

```bash
#!/bin/bash
# chromium-args-test.sh

ARGS_LIST=(
    "--no-sandbox"
    "--disable-setuid-sandbox"
    "--disable-dev-shm-usage"
    "--disable-gpu"
    "--no-first-run"
    "--no-zygote"
    "--disable-extensions"
    "--single-process"
)

echo "=== Chromium-Argumente-Test ==="
echo "Zeit: $(date)"
echo ""

for arg in "${ARGS_LIST[@]}"; do
    echo "Teste Argument: $arg"
    chromium --headless $arg --print-to-pdf=/tmp/arg-test.pdf about:blank 2>/dev/null
    if [ -f /tmp/arg-test.pdf ]; then
        echo "✅ $arg funktioniert"
        rm /tmp/arg-test.pdf
    else
        echo "❌ $arg fehlgeschlagen"
    fi
    echo ""
done

echo "=== Argumente-Test abgeschlossen ==="
```

## Fehlerbehebung

### 🚨 **1. Häufige Fehler:**

```bash
# Fehler: "chromium: not found"
# Lösung: Chromium installieren
apk update && apk add chromium

# Fehler: "Permission denied"
# Lösung: Berechtigungen setzen
chmod +x /usr/bin/chromium

# Fehler: "Failed to move to new namespace"
# Lösung: Sandbox deaktivieren
chromium --no-sandbox --disable-setuid-sandbox

# Fehler: "Out of memory"
# Lösung: Memory-Optimierung
chromium --disable-dev-shm-usage --memory-pressure-off
```

### 🚨 **2. Debug-Informationen sammeln:**

```bash
# System-Informationen
uname -a
cat /etc/os-release

# Chromium-Informationen
chromium --version
which chromium

# Memory-Informationen
free -h
cat /proc/meminfo | head -10

# Disk-Informationen
df -h
```

## Status

- ✅ **Container-Zugriff:** Einfacher Zugriff auf Container
- ✅ **Chromium-Installation:** Vollständige Prüfung
- ✅ **Basis-Tests:** Einfache Funktionalität
- ✅ **Erweiterte Tests:** Verschiedene Konfigurationen
- ✅ **Troubleshooting:** Spezifische Problem-Tests
- ✅ **Umgebungsvariablen:** Konfiguration prüfen
- ✅ **Debug-Logging:** Verschiedene Log-Level
- ✅ **Performance-Tests:** Timing und Memory
- ✅ **Automatisierte Scripts:** Vollständige Test-Suite

**Chromium kann jetzt vollständig im Container getestet werden!** 🎉

## Nächste Schritte

1. **Container-Zugriff:** In den Container einsteigen
2. **Basis-Tests:** Chromium-Installation prüfen
3. **Erweiterte Tests:** Verschiedene Konfigurationen testen
4. **Troubleshooting:** Spezifische Probleme identifizieren
5. **Performance:** Timing und Memory optimieren
