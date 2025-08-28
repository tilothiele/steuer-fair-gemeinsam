# Node.js Problem beheben

## Problem
```
SyntaxError: Unexpected token '{'
```
Dieser Fehler tritt auf, weil Node.js 15.3.0 verwendet wird, aber Next.js und tsx Node.js 18+ benötigen.

## Lösung

### Option 1: Automatisches Setup (Empfohlen)

```bash
# Führen Sie das Setup-Script aus
./setup-node.sh
```

### Option 2: Manuelles Setup

```bash
# 1. nvm laden
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Node.js 20 verwenden
nvm use 20

# 3. npm prefix löschen
npm config delete prefix

# 4. Version prüfen
node --version  # Sollte v20.x.x zeigen
```

### Option 3: Einfacher Start

```bash
# Verwenden Sie das Start-Script
./start-dev.sh
```

## Verifizierung

Nach dem Setup sollten Sie sehen:
```bash
✅ Node.js Version: v20.18.0
✅ npm Version: v10.8.2
```

## Anwendung starten

```bash
# Terminal 1: API
cd apps/api && npm run dev

# Terminal 2: Web App
cd apps/web && npm run dev
```

## Troubleshooting

### Falls nvm nicht funktioniert:
```bash
# nvm neu laden
source ~/.bashrc
# oder
source ~/.zshrc
```

### Falls Node.js 20 nicht installiert ist:
```bash
nvm install 20
nvm use 20
nvm alias default 20
```

### Falls npm prefix Problem besteht:
```bash
npm config delete prefix
npm config set prefix ~/.npm-global
```

## Nächste Schritte

1. ✅ Node.js 20 aktivieren
2. 🔧 Keycloak konfigurieren (siehe `docs/keycloak-quick-setup.md`)
3. 🚀 Anwendung starten
4. 🌐 Testen unter http://localhost:3000
