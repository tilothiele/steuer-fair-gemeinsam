#!/bin/bash
# chromium-dbus-free-test.sh

echo "=== Chromium DBus-freier Headless-Test ==="
echo "Zeit: $(date)"
echo ""

# Umgebungsvariablen für DBus-Deaktivierung setzen
export DISPLAY=:99
export DBUS_SESSION_BUS_ADDRESS=/dev/null
export DBUS_SYSTEM_BUS_ADDRESS=/dev/null
export DBUS_SESSION_BUS_PID=0
export DBUS_SYSTEM_BUS_PID=0

# Chromium-Version
echo "=== Chromium-Version ==="
chromium --version
echo ""

# DBus-freier Headless-Test
echo "=== DBus-freier Headless-Test ==="
chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --disable-dbus \
  --disable-features=AudioServiceOutOfProcess \
  --disable-features=MediaRouter \
  --disable-features=WebUIDarkMode \
  --disable-features=WebUIDarkModeV2 \
  --disable-features=WebUIDarkModeV3 \
  --disable-features=WebUIDarkModeV4 \
  --disable-features=WebUIDarkModeV5 \
  --disable-features=WebUIDarkModeV6 \
  --disable-features=WebUIDarkModeV7 \
  --disable-features=WebUIDarkModeV8 \
  --disable-features=WebUIDarkModeV9 \
  --disable-features=WebUIDarkModeV10 \
  --print-to-pdf=/tmp/dbus-free-test.pdf \
  about:blank

if [ -f /tmp/dbus-free-test.pdf ]; then
    echo "✅ DBus-freier Test erfolgreich"
    ls -la /tmp/dbus-free-test.pdf
else
    echo "❌ DBus-freier Test fehlgeschlagen"
fi
echo ""

# Minimale DBus-freie Konfiguration
echo "=== Minimale DBus-freie Konfiguration ==="
chromium --headless \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --disable-dbus \
  --print-to-pdf=/tmp/minimal-dbus-free.pdf \
  about:blank

if [ -f /tmp/minimal-dbus-free.pdf ]; then
    echo "✅ Minimale DBus-freie Konfiguration erfolgreich"
    ls -la /tmp/minimal-dbus-free.pdf
else
    echo "❌ Minimale DBus-freie Konfiguration fehlgeschlagen"
fi
echo ""

echo "=== DBus-freier Test abgeschlossen ==="
