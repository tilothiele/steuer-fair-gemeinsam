#!/bin/bash

echo "🚀 Steuer-Fair Keycloak Setup"
echo "=============================="

# Prüfe ob Docker installiert ist
if ! command -v docker &> /dev/null; then
    echo "❌ Docker ist nicht installiert. Bitte installieren Sie Docker zuerst."
    exit 1
fi

# Prüfe ob Docker Compose installiert ist
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose ist nicht installiert. Bitte installieren Sie Docker Compose zuerst."
    exit 1
fi

echo "✅ Docker und Docker Compose sind verfügbar"

# Starte Keycloak
echo "🔧 Starte Keycloak Server..."
docker-compose -f docker-compose.keycloak.yml up -d

echo "⏳ Warte auf Keycloak Startup..."
sleep 30

echo "✅ Keycloak ist gestartet!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Öffnen Sie http://localhost:8080"
echo "2. Melden Sie sich mit admin/admin an"
echo "3. Erstellen Sie einen neuen Realm: 'steuer-fair'"
echo "4. Erstellen Sie zwei Clients:"
echo "   - steuer-fair-web (public)"
echo "   - steuer-fair-api (confidential)"
echo "5. Erstellen Sie Testbenutzer"
echo ""
echo "📖 Detaillierte Anleitung: docs/keycloak-setup.md"
echo ""
echo "🔧 Um Keycloak zu stoppen:"
echo "   docker-compose -f docker-compose.keycloak.yml down"
