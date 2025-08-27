#!/bin/bash

# Steuer-Fair-Gemeinsam - Vereinfachtes Setup Script
# Ohne npm Workspaces für bessere Kompatibilität

set -e

echo "🚀 Steuer-Fair-Gemeinsam - Vereinfachtes Setup"
echo "============================================="

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funktion zum Prüfen von Abhängigkeiten
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 ist nicht installiert${NC}"
        echo -e "${YELLOW}Bitte installieren Sie $1 und versuchen Sie es erneut${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ $1 gefunden${NC}"
    fi
}

# Abhängigkeiten prüfen
echo -e "${BLUE}Prüfe Abhängigkeiten...${NC}"
check_dependency "node"
check_dependency "npm"

# Node.js Version prüfen
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js Version 18 oder höher erforderlich${NC}"
    echo -e "${YELLOW}Aktuelle Version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js Version $(node -v) ist kompatibel${NC}"

# Verzeichnisse erstellen
echo -e "${BLUE}Erstelle Verzeichnisse...${NC}"
mkdir -p apps/api/logs
mkdir -p infrastructure/postgres
mkdir -p infrastructure/nginx

# Root Dependencies installieren
echo -e "${BLUE}Installiere Root Dependencies...${NC}"
npm install

# Shared Package installieren und bauen
echo -e "${BLUE}Installiere und baue Shared Package...${NC}"
cd packages/shared
npm install
npm run build
cd ../..

# API installieren
echo -e "${BLUE}Installiere API Dependencies...${NC}"
cd apps/api
npm install
cd ../..

# Web installieren
echo -e "${BLUE}Installiere Web Dependencies...${NC}"
cd apps/web
npm install
cd ../..

# Umgebungsvariablen konfigurieren
if [ ! -f .env ]; then
    echo -e "${BLUE}Erstelle .env Datei...${NC}"
    cp env.example .env
    echo -e "${GREEN}✅ .env Datei erstellt${NC}"
    echo -e "${YELLOW}Bitte bearbeiten Sie .env mit Ihren Werten${NC}"
else
    echo -e "${GREEN}✅ .env Datei existiert bereits${NC}"
fi

echo -e "${GREEN}🎉 Setup abgeschlossen!${NC}"
echo ""
echo -e "${BLUE}Nächste Schritte:${NC}"
echo "1. Bearbeiten Sie .env mit Ihren Werten"
echo "2. Starten Sie die Anwendung:"
echo "   - Entwicklung: npm run dev"
echo "   - Nur Frontend: npm run dev:web"
echo "   - Nur Backend: npm run dev:api"
echo ""
echo -e "${BLUE}Verfügbare Scripts:${NC}"
echo "  npm run dev          - Entwicklungsserver (Frontend + Backend)"
echo "  npm run dev:web      - Nur Frontend (Port 3000)"
echo "  npm run dev:api      - Nur Backend (Port 3001)"
echo "  npm run build        - Alle Packages bauen"
echo ""
echo -e "${GREEN}Viel Erfolg mit Steuer-Fair-Gemeinsam!${NC}"
