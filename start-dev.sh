#!/bin/bash

echo "🚀 Steuer-Fair Entwicklungsserver starten"
echo "=========================================="

# Lade nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verwende Node.js 20
echo "🔄 Verwende Node.js 20..."
nvm use 20

# Prüfe Version
echo "✅ Node.js Version: $(node --version)"
echo "✅ npm Version: $(npm --version)"

# Starte API im Hintergrund
echo "🔧 Starte API Server..."
cd apps/api && npm run dev &
API_PID=$!

# Warte kurz
sleep 3

# Starte Web App im Hintergrund
echo "🌐 Starte Web App..."
cd ../web && npm run dev &
WEB_PID=$!

echo ""
echo "🎉 Anwendung gestartet!"
echo "📊 API: http://localhost:3001"
echo "🌐 Web: http://localhost:3000"
echo ""
echo "🔧 Zum Beenden: Ctrl+C"

# Warte auf Interrupt
trap "echo '🛑 Beende Anwendung...'; kill $API_PID $WEB_PID; exit" INT
wait
