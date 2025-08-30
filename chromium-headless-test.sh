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
