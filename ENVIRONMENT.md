# 🌍 Umgebungskonfiguration

Diese Dokumentation erklärt, wie die verschiedenen Umgebungen (Development, Test, Production) konfiguriert und verwaltet werden.

## 📁 Dateien

### `.env`
Hauptkonfigurationsdatei mit allen Umgebungsvariablen.

### `switch-env.sh`
Script zum einfachen Wechseln zwischen Umgebungen.

### `setup-database.sh`
Script zum Einrichten der PostgreSQL-Datenbank.

## 🔧 Umgebungen

### 🛠️ Development (Entwicklung)
- **NODE_ENV**: `development`
- **Datenbank**: Lokale PostgreSQL-Instanz
- **Verwendung**: Entwicklung und lokales Testen

### 🧪 Test
- **NODE_ENV**: `test`
- **Datenbank**: Separate Test-Datenbank
- **Verwendung**: Automatisierte Tests

### 🚀 Production (Produktion)
- **NODE_ENV**: `production`
- **Datenbank**: Produktions-Datenbank
- **Verwendung**: Live-System

## 📋 Umgebungsvariablen

### Datenbank-Konfiguration
```bash
# Development
DB_HOST_DEV=192.168.178.253
DB_PORT_DEV=5432
DB_NAME_DEV=steuer_fair
DB_USER_DEV=steuer_fair_user
DB_PASSWORD_DEV=steuer_fair_password

# Test
DB_HOST_TEST=localhost
DB_PORT_TEST=5432
DB_NAME_TEST=steuer_fair_test
DB_USER_TEST=steuer_fair_user
DB_PASSWORD_TEST=steuer_fair_password

# Production
DB_HOST_PROD=your-production-db-host
DB_PORT_PROD=5432
DB_NAME_PROD=steuer_fair_prod
DB_USER_PROD=steuer_fair_user
DB_PASSWORD_PROD=your-secure-password

# Admin-Verbindung (für Setup)
DB_ADMIN_HOST=192.168.178.253
DB_ADMIN_PORT=5432
DB_ADMIN_USER=postgres
DB_ADMIN_PASSWORD=
```

### Aktive Konfiguration
```bash
NODE_ENV=development
DB_HOST=192.168.178.253
DB_PORT=5432
DB_NAME=steuer_fair
DB_USER=steuer_fair_user
DB_PASSWORD=steuer_fair_password
```

### Verbindungsstrings
```bash
DATABASE_URL_DEV=postgresql://steuer_fair_user:steuer_fair_password@192.168.178.253:5432/steuer_fair
DATABASE_URL_TEST=postgresql://steuer_fair_user:steuer_fair_password@localhost:5432/steuer_fair_test
DATABASE_URL_PROD=postgresql://steuer_fair_user:your-secure-password@your-production-db-host:5432/steuer_fair_prod
```

## 🚀 Verwendung

### 1. Datenbank einrichten
```bash
# PostgreSQL-Setup ausführen (liest Konfiguration aus .env)
./setup-database.sh
```

### 2. Umgebung wechseln
```bash
# Zu Development wechseln
./switch-env.sh dev

# Zu Test wechseln
./switch-env.sh test

# Zu Production wechseln
./switch-env.sh prod

# Aktuelle Umgebung anzeigen
./switch-env.sh status
```

### 3. Anwendung starten
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 🔧 Admin-Konfiguration

Das `setup-database.sh` Script liest die Admin-Verbindungsdaten aus der `.env`-Datei:

```bash
# Admin-Verbindung für Datenbank-Setup
DB_ADMIN_HOST=192.168.178.253
DB_ADMIN_PORT=5432
DB_ADMIN_USER=postgres
DB_ADMIN_PASSWORD=
```

**Hinweise:**
- `DB_ADMIN_PASSWORD` leer lassen für lokale Verbindung ohne Passwort
- Für externe Datenbanken: Passwort eintragen
- Das Script erstellt automatisch die Ziel-Datenbank und den Benutzer

## 🔒 Sicherheit

### Production-Umgebung
- **Passwörter**: Verwende sichere, komplexe Passwörter
- **Host**: Verwende echte Produktions-Datenbank-Hosts
- **SSL**: Aktiviere SSL für Datenbankverbindungen
- **Firewall**: Konfiguriere Firewall-Regeln

### Umgebungsvariablen
- **Niemals** Passwörter oder sensible Daten committen
- Verwende `.env.example` als Template
- Füge `.env` zur `.gitignore` hinzu

## 🐛 Troubleshooting

### Verbindungsfehler
```bash
# Teste Datenbankverbindung
psql postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# Prüfe PostgreSQL-Status
sudo systemctl status postgresql

# Prüfe Firewall
sudo ufw status
```

### Umgebungsvariablen prüfen
```bash
# Zeige aktuelle Konfiguration
./switch-env.sh status

# Prüfe .env-Datei
cat .env | grep DB_
```

## 📝 Anpassungen

### Neue Umgebung hinzufügen
1. Füge neue Variablen zur `.env` hinzu:
   ```bash
   DB_HOST_STAGING=staging-db-host
   DB_PORT_STAGING=5432
   DB_NAME_STAGING=steuer_fair_staging
   DB_USER_STAGING=steuer_fair_user
   DB_PASSWORD_STAGING=staging-password
   ```

2. Erweitere `switch-env.sh` um die neue Umgebung

3. Aktualisiere diese Dokumentation

### Externe Datenbank
1. Aktualisiere die entsprechenden `DB_HOST_*` Variablen
2. Stelle sicher, dass die Firewall-Regeln korrekt sind
3. Teste die Verbindung mit `psql`

## 🔄 Workflow

### Entwicklung
1. `./switch-env.sh dev` - Wechsel zu Development
2. `./setup-database.sh` - Datenbank einrichten (falls nötig)
3. `npm run dev` - Anwendung starten
4. Entwickeln und testen

### Deployment
1. `./switch-env.sh prod` - Wechsel zu Production
2. Produktions-Datenbank konfigurieren
3. `npm run build` - Anwendung bauen
4. `npm start` - Anwendung starten

### Testing
1. `./switch-env.sh test` - Wechsel zu Test
2. Test-Datenbank einrichten
3. `npm test` - Tests ausführen
