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
