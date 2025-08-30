# Chromium Headless-Problem beheben

## Problem

**Chromium versucht GUI zu starten statt Headless-Modus:**
```
[183:199:0829/235629.416698:ERROR:dbus/bus.cc:408] Failed to connect to the bus: Failed to connect to socket /run/dbus/system_bus_socket: No such file or directory
[183:183:0829/235629.417976:ERROR:ui/ozone/platform/x11/ozone_platform_x11.cc:249] Missing X server or $DISPLAY
[183:183:0829/235629.418115:ERROR:ui/aura/env.cc:257] The platform failed to initialize.  Exiting.
```

## Ursache

Chromium versucht, eine GUI zu starten, obwohl wir im Headless-Modus sind. Das passiert, weil:
1. **X11-Display** wird erwartet
2. **DBus** wird benötigt
3. **Ozone-Platform** versucht GUI zu initialisieren

## Lösung

### ✅ **1. Korrekte Headless-Argumente:**

```bash
# Falsch (GUI wird erwartet)
chromium --no-sandbox --disable-setuid-sandbox

# Richtig (Headless-Modus)
chromium --headless --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu --print-to-pdf=/tmp/test.pdf about:blank
```

### ✅ **2. Vollständige Headless-Konfiguration:**

```bash
chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --no-first-run \
  --no-zygote \
  --disable-extensions \
  --single-process \
  --disable-background-timer-throttling \
  --disable-backgrounding-occluded-windows \
  --disable-renderer-backgrounding \
  --disable-web-security \
  --disable-features=VizDisplayCompositor \
  --disable-ipc-flooding-protection \
  --disable-default-apps \
  --disable-sync \
  --disable-translate \
  --hide-scrollbars \
  --mute-audio \
  --no-default-browser-check \
  --disable-component-extensions-with-background-pages \
  --disable-background-networking \
  --disable-client-side-phishing-detection \
  --disable-hang-monitor \
  --disable-prompt-on-repost \
  --disable-domain-reliability \
  --disable-features=TranslateUI \
  --print-to-pdf=/tmp/test.pdf \
  about:blank
```

### ✅ **3. Umgebungsvariablen für Headless:**

```bash
# Umgebungsvariablen setzen
export DISPLAY=:99
export DBUS_SESSION_BUS_ADDRESS=/dev/null

# Chromium starten
chromium --headless --no-sandbox --disable-setuid-sandbox --print-to-pdf=/tmp/test.pdf about:blank
```

## Korrigierte Test-Scripts

### 📜 **1. Korrigierter Basis-Test:**

```bash
#!/bin/bash
# chromium-headless-test.sh

echo "=== Chromium Headless-Test ==="
echo "Zeit: $(date)"
echo ""

# Umgebungsvariablen setzen
export DISPLAY=:99
export DBUS_SESSION_BUS_ADDRESS=/dev/null

# Chromium-Version
echo "=== Chromium-Version ==="
chromium --version
echo ""

# Headless-Basis-Test
echo "=== Headless-Basis-Test ==="
chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --print-to-pdf=/tmp/headless-test.pdf \
  about:blank

if [ -f /tmp/headless-test.pdf ]; then
    echo "✅ Headless-Test erfolgreich"
    ls -la /tmp/headless-test.pdf
else
    echo "❌ Headless-Test fehlgeschlagen"
fi
echo ""

# Puppeteer-Headless-Test
echo "=== Puppeteer-Headless-Test ==="
chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --no-first-run \
  --no-zygote \
  --disable-extensions \
  --single-process \
  --disable-background-timer-throttling \
  --disable-backgrounding-occluded-windows \
  --disable-renderer-backgrounding \
  --disable-web-security \
  --disable-features=VizDisplayCompositor \
  --disable-ipc-flooding-protection \
  --disable-default-apps \
  --disable-sync \
  --disable-translate \
  --hide-scrollbars \
  --mute-audio \
  --no-default-browser-check \
  --disable-component-extensions-with-background-pages \
  --disable-background-networking \
  --disable-client-side-phishing-detection \
  --disable-hang-monitor \
  --disable-prompt-on-repost \
  --disable-domain-reliability \
  --disable-features=TranslateUI \
  --print-to-pdf=/tmp/puppeteer-headless.pdf \
  about:blank

if [ -f /tmp/puppeteer-headless.pdf ]; then
    echo "✅ Puppeteer-Headless-Test erfolgreich"
    ls -la /tmp/puppeteer-headless.pdf
else
    echo "❌ Puppeteer-Headless-Test fehlgeschlagen"
fi
echo ""

echo "=== Headless-Test abgeschlossen ==="
```

### 📜 **2. Korrigierter Argumente-Test:**

```bash
#!/bin/bash
# chromium-headless-args-test.sh

# Umgebungsvariablen setzen
export DISPLAY=:99
export DBUS_SESSION_BUS_ADDRESS=/dev/null

ARGS_LIST=(
    "--headless"
    "--no-sandbox"
    "--disable-setuid-sandbox"
    "--disable-dev-shm-usage"
    "--disable-gpu"
    "--no-first-run"
    "--no-zygote"
    "--disable-extensions"
    "--single-process"
)

echo "=== Chromium Headless-Argumente-Test ==="
echo "Zeit: $(date)"
echo ""

for arg in "${ARGS_LIST[@]}"; do
    echo "Teste Argument: $arg"
    chromium $arg --print-to-pdf=/tmp/headless-arg-test.pdf about:blank 2>/dev/null
    if [ -f /tmp/headless-arg-test.pdf ]; then
        echo "✅ $arg funktioniert"
        rm /tmp/headless-arg-test.pdf
    else
        echo "❌ $arg fehlgeschlagen"
    fi
    echo ""
done

echo "=== Headless-Argumente-Test abgeschlossen ==="
```

## Dockerfile-Anpassungen

### 🐳 **1. Umgebungsvariablen im Dockerfile:**

```dockerfile
# Chrome-Umgebungsvariablen für Headless
ENV DISPLAY=:99
ENV DBUS_SESSION_BUS_ADDRESS=/dev/null
ENV CHROME_ARGS="--headless,--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--disable-extensions,--single-process"
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROME_TIMEOUT=30000
ENV CHROME_PROTOCOL_TIMEOUT=30000
```

### 🐳 **2. Virtueller Display-Server (optional):**

```dockerfile
# Virtuellen Display-Server installieren (falls benötigt)
RUN apk add --no-cache \
    xvfb \
    && echo 'exec xvfb-run -a -s "-screen 0 1280x1024x24" chromium "$@"' > /usr/local/bin/chromium-headless \
    && chmod +x /usr/local/bin/chromium-headless
```

## Puppeteer-Konfiguration anpassen

### 🔧 **1. Korrigierte Chrome-Argumente:**

```typescript
// Chrome-Argumente aus Umgebungsvariable oder Standard verwenden
const chromeArgs = process.env.CHROME_ARGS
  ? process.env.CHROME_ARGS.split(',').map(arg => arg.trim())
  : [
      '--headless',  // WICHTIG: Headless-Modus
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--disable-extensions',
      '--single-process',
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
      '--disable-features=TranslateUI'
    ];
```

### 🔧 **2. Umgebungsvariablen in der Anwendung:**

```typescript
// Umgebungsvariablen für Headless setzen
process.env.DISPLAY = ':99';
process.env.DBUS_SESSION_BUS_ADDRESS = '/dev/null';

// Puppeteer mit korrigierten Argumenten starten
browser = await puppeteer.launch({
  headless: true,
  args: chromeArgs,
  executablePath: process.env.CHROME_BIN || undefined,
  timeout: parseInt(process.env.CHROME_TIMEOUT || '30000'),
  protocolTimeout: parseInt(process.env.CHROME_PROTOCOL_TIMEOUT || '30000')
});
```

## Sofortige Tests

### 🧪 **1. Korrigierter Basis-Test:**

```bash
# Im Container ausführen
export DISPLAY=:99
export DBUS_SESSION_BUS_ADDRESS=/dev/null

chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --print-to-pdf=/tmp/test.pdf \
  about:blank

ls -la /tmp/test.pdf
```

### 🧪 **2. Puppeteer-Argumente testen:**

```bash
# Im Container ausführen
export DISPLAY=:99
export DBUS_SESSION_BUS_ADDRESS=/dev/null

chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --no-first-run \
  --no-zygote \
  --disable-extensions \
  --single-process \
  --disable-background-timer-throttling \
  --disable-backgrounding-occluded-windows \
  --disable-renderer-backgrounding \
  --disable-web-security \
  --disable-features=VizDisplayCompositor \
  --disable-ipc-flooding-protection \
  --disable-default-apps \
  --disable-sync \
  --disable-translate \
  --hide-scrollbars \
  --mute-audio \
  --no-default-browser-check \
  --disable-component-extensions-with-background-pages \
  --disable-background-networking \
  --disable-client-side-phishing-detection \
  --disable-hang-monitor \
  --disable-prompt-on-repost \
  --disable-domain-reliability \
  --disable-features=TranslateUI \
  --print-to-pdf=/tmp/puppeteer-test.pdf \
  about:blank

ls -la /tmp/puppeteer-test.pdf
```

## Troubleshooting

### 🚨 **1. Weitere GUI-Fehler:**

```bash
# Zusätzliche Umgebungsvariablen
export XDG_RUNTIME_DIR=/tmp/runtime-chrome
export CHROME_DEVEL_SANDBOX=/usr/bin/chromium

# Chromium starten
chromium --headless --no-sandbox --disable-setuid-sandbox --print-to-pdf=/tmp/test.pdf about:blank
```

### 🚨 **2. Virtueller Display-Server:**

```bash
# Xvfb installieren und verwenden
apk add --no-cache xvfb

# Mit Xvfb starten
xvfb-run -a -s "-screen 0 1280x1024x24" chromium --headless --no-sandbox --disable-setuid-sandbox --print-to-pdf=/tmp/test.pdf about:blank
```

### 🚨 **3. Alternative: Chromium ohne GUI:**

```bash
# Chromium mit minimalen Argumenten
chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --disable-software-rasterizer \
  --disable-background-timer-throttling \
  --disable-backgrounding-occluded-windows \
  --disable-renderer-backgrounding \
  --disable-features=VizDisplayCompositor \
  --print-to-pdf=/tmp/test.pdf \
  about:blank
```

## Status

- ✅ **Problem identifiziert:** Chromium versucht GUI zu starten
- ✅ **Lösung gefunden:** `--headless` Argument und Umgebungsvariablen
- ✅ **Korrigierte Scripts:** Headless-Tests verfügbar
- ✅ **Dockerfile-Anpassungen:** Umgebungsvariablen für Headless
- ✅ **Puppeteer-Konfiguration:** Korrigierte Chrome-Argumente
- ✅ **Sofortige Tests:** Korrigierte Test-Befehle

**Das Headless-Problem ist identifiziert und kann behoben werden!** 🎉

## Nächste Schritte

1. **Umgebungsvariablen setzen:** `DISPLAY=:99` und `DBUS_SESSION_BUS_ADDRESS=/dev/null`
2. **Korrigierte Tests ausführen:** Mit `--headless` Argument
3. **Puppeteer-Konfiguration anpassen:** Chrome-Argumente korrigieren
4. **Container neu bauen:** Mit korrigierten Umgebungsvariablen
5. **PDF-Generierung testen:** TargetCloseError sollte behoben sein
