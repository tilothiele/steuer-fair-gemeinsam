#!/bin/bash

# Steuer-Fair-Gemeinsam - Setup Script
# Dieses Script installiert und konfiguriert das Projekt

set -e

echo "🚀 Steuer-Fair-Gemeinsam - Setup Script"
echo "======================================"

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
check_dependency "docker"
check_dependency "docker-compose"

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

# Shared Package zuerst installieren und bauen
echo -e "${BLUE}Installiere und baue Shared Package...${NC}"
cd packages/shared
npm install
npm run build
cd ../..

# Root Dependencies installieren
echo -e "${BLUE}Installiere Root Dependencies...${NC}"
npm install

# API Dependencies installieren
echo -e "${BLUE}Installiere API Dependencies...${NC}"
cd apps/api
npm install
cd ../..

# Web Dependencies installieren
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

# Docker Images bauen (optional)
echo -e "${BLUE}Baue Docker Images...${NC}"
if command -v docker-compose &> /dev/null; then
    docker-compose build
    echo -e "${GREEN}✅ Docker Images erstellt${NC}"
else
    echo -e "${YELLOW}⚠️  Docker Compose nicht verfügbar, überspringe Docker Build${NC}"
fi

echo -e "${GREEN}🎉 Setup abgeschlossen!${NC}"
echo ""
echo -e "${BLUE}Nächste Schritte:${NC}"
echo "1. Bearbeiten Sie .env mit Ihren Werten"
echo "2. Starten Sie die Anwendung:"
echo "   - Entwicklung: npm run dev"
echo "   - Docker: npm run docker:up"
echo ""
echo -e "${BLUE}Verfügbare Scripts:${NC}"
echo "  npm run dev          - Entwicklungsserver"
echo "  npm run dev:web      - Nur Frontend"
echo "  npm run dev:api      - Nur Backend"
echo "  npm run docker:up    - Docker Services starten"
echo "  npm run docker:down  - Docker Services stoppen"
echo ""
echo -e "${GREEN}Viel Erfolg mit Steuer-Fair-Gemeinsam!${NC}"
