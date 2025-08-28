#!/bin/bash

echo "🔧 Node.js Setup für Steuer-Fair"
echo "================================"

# Prüfe ob nvm installiert ist
if ! command -v nvm &> /dev/null; then
    echo "❌ nvm ist nicht installiert. Bitte installieren Sie nvm zuerst."
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    exit 1
fi

# Lade nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Prüfe ob Node.js 20 installiert ist
if ! nvm list | grep -q "v20"; then
    echo "📦 Installiere Node.js 20..."
    nvm install 20
fi

# Verwende Node.js 20
echo "🔄 Wechsle zu Node.js 20..."
nvm use 20

# Setze Node.js 20 als Standard
echo "🔧 Setze Node.js 20 als Standard..."
nvm alias default 20

# Lösche npm prefix Konfiguration
echo "🧹 Lösche npm prefix Konfiguration..."
npm config delete prefix

# Prüfe Version
echo "✅ Node.js Version:"
node --version
npm --version

echo ""
echo "🎉 Node.js Setup abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Starten Sie ein neues Terminal"
echo "2. Führen Sie 'nvm use 20' aus"
echo "3. Starten Sie die Anwendung:"
echo "   cd apps/api && npm run dev"
echo "   cd apps/web && npm run dev"
