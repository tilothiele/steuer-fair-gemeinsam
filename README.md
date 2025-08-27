# Steuer Fair Gemeinsam

Eine Web-Anwendung zur fairen Aufteilung von Steuererstattungen bei gemeinsamer Veranlagung von Ehegatten.

## 🎯 Projektziel

Diese Anwendung hilft verheirateten Paaren dabei, die faire Aufteilung von Steuererstattungen zu berechnen, die bei gemeinsamer Veranlagung entstehen. Sie vergleicht die Steuerlast bei getrennter und gemeinsamer Veranlagung und schlägt eine faire Aufteilung der Steuerersparnis vor.

## 🚀 Features

- **Steuerberechnung**: Automatische Berechnung der Einkommensteuer für beide Partner
- **Vergleich**: Gegenüberstellung von getrennter vs. gemeinsamer Veranlagung
- **Faire Aufteilung**: Berechnung der gerechten Verteilung der Steuerersparnis
- **Export**: Download der Berechnungsergebnisse
- **Responsive Design**: Optimiert für Desktop und Mobile

## 🛠️ Technologie-Stack

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Typsicherheit
- **Tailwind CSS** - Styling
- **React Hook Form** - Formularverwaltung
- **Zod** - Validierung

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **TypeScript** - Typsicherheit
- **Zod** - Request Validierung
- **Winston** - Logging

### Shared
- **TypeScript** - Gemeinsame Typen
- **Zod** - Schema Validierung

### Infrastruktur
- **Docker** - Containerisierung
- **PostgreSQL** - Datenbank
- **Redis** - Caching
- **Nginx** - Reverse Proxy

## 📦 Installation

### Voraussetzungen
- Node.js 18+
- npm 9+
- Docker & Docker Compose

### Setup

1. **Repository klonen**
```bash
git clone <repository-url>
cd steuer-fair-gemeinsam
```

2. **Dependencies installieren**
```bash
npm install
```

3. **Umgebungsvariablen konfigurieren**
```bash
cp .env.example .env
# Bearbeiten Sie .env mit Ihren Werten
```

4. **Entwicklungsserver starten**
```bash
# Alle Services starten
npm run dev

# Oder einzeln:
npm run dev:web    # Frontend (Port 3000)
npm run dev:api    # Backend (Port 3001)
```

5. **Mit Docker starten**
```bash
# Alle Services mit Docker
npm run docker:up

# Oder manuell:
docker-compose up -d
```

## 🏗️ Projektstruktur

```
steuer-fair-gemeinsam/
├── apps/
│   ├── web/                 # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/         # App Router
│   │   │   ├── components/  # React Komponenten
│   │   │   ├── services/    # API Services
│   │   │   └── utils/       # Hilfsfunktionen
│   │   └── public/          # Statische Dateien
│   └── api/                 # Express.js Backend
│       ├── src/
│       │   ├── routes/      # API Routen
│       │   ├── middleware/  # Express Middleware
│       │   ├── services/    # Business Logic
│       │   └── utils/       # Hilfsfunktionen
│       └── logs/            # Log-Dateien
├── packages/
│   └── shared/              # Gemeinsame Typen und Utils
│       └── src/
│           ├── types/       # TypeScript Interfaces
│           └── utils/       # Gemeinsame Funktionen
├── infrastructure/          # Infrastruktur-Konfiguration
│   ├── postgres/           # Datenbank-Setup
│   └── nginx/              # Nginx-Konfiguration
├── docs/                   # Dokumentation
└── docker-compose.yml      # Docker Setup
```

## 🔧 Entwicklung

### Scripts

```bash
# Entwicklung
npm run dev              # Alle Services
npm run dev:web          # Nur Frontend
npm run dev:api          # Nur Backend

# Build
npm run build            # Alle Services
npm run build:web        # Nur Frontend
npm run build:api        # Nur Backend

# Testing
npm run test             # Alle Tests
npm run test:web         # Frontend Tests
npm run test:api         # Backend Tests

# Linting
npm run lint             # Alle Services
npm run lint:fix         # Mit Auto-Fix

# Docker
npm run docker:build     # Images bauen
npm run docker:up        # Services starten
npm run docker:down      # Services stoppen
```

### API Endpoints

- `POST /api/tax/calculate` - Steuerberechnung
- `GET /api/tax/health` - Health Check
- `GET /api/tax/tax-brackets` - Steuertarife

## 📊 Steuerberechnung

Die Anwendung verwendet die aktuellen deutschen Steuertarife (2024):

- **Grundtarif**: 14% ab 0€
- **Linearer Tarif**: 23,9% ab 10.908€
- **Spitzensteuersatz**: 42% ab 62.809€
- **Reichensteuer**: 45% ab 277.825€

Zusätzlich werden berechnet:
- **Solidaritätszuschlag**: 5,5%
- **Kirchensteuer**: 9% (vereinfacht)

## 🔒 Sicherheit

- **Input Validierung** mit Zod
- **Rate Limiting** für API-Endpoints
- **CORS** Konfiguration
- **Helmet** Security Headers
- **HTTPS** in Produktion

## 📝 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## ⚠️ Haftungsausschluss

Diese Anwendung dient nur zur Orientierung. Für die finale Steuererklärung konsultieren Sie bitte einen Steuerberater oder das Finanzamt.

## 🤝 Beitragen

1. Fork das Repository
2. Erstellen Sie einen Feature Branch
3. Committen Sie Ihre Änderungen
4. Pushen Sie zum Branch
5. Erstellen Sie einen Pull Request

## 📞 Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im Repository.
