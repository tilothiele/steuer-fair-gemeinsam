#!/bin/bash

# PostgreSQL Setup für Steuer-Fair-Gemeinsam
# Dieses Script führt die komplette Datenbankeinrichtung durch

set -e  # Beende bei Fehlern

echo "🚀 PostgreSQL Setup für Steuer-Fair-Gemeinsam"
echo "=============================================="

# Lade Umgebungsvariablen aus .env-Datei
if [ -f .env ]; then
    echo "📁 Lade Konfiguration aus .env-Datei..."
    export $(grep -v '^#' .env | xargs)
else
    echo "❌ .env-Datei nicht gefunden!"
    echo "Bitte erstelle eine .env-Datei mit den Datenbankeinstellungen."
    exit 1
fi

# Setze Standardwerte für Admin-Verbindung (falls nicht in .env definiert)
DB_ADMIN_HOST=${DB_ADMIN_HOST:-"localhost"}
DB_ADMIN_PORT=${DB_ADMIN_PORT:-"5432"}
DB_ADMIN_USER=${DB_ADMIN_USER:-"postgres"}
DB_ADMIN_PASSWORD=${DB_ADMIN_PASSWORD:-""}

# Verwende die aktuelle Umgebung für die Ziel-Datenbank
DB_TARGET_HOST=${DB_HOST:-"localhost"}
DB_TARGET_PORT=${DB_PORT:-"5432"}
DB_TARGET_NAME=${DB_NAME:-"steuer_fair"}
DB_TARGET_USER=${DB_USER:-"steuer_fair_user"}
DB_TARGET_PASSWORD=${DB_PASSWORD:-"steuer_fair_password"}

echo "🔧 Konfiguration:"
echo "   Admin-Host: $DB_ADMIN_HOST"
echo "   Admin-Port: $DB_ADMIN_PORT"
echo "   Admin-User: $DB_ADMIN_USER"
echo "   Ziel-Host: $DB_TARGET_HOST"
echo "   Ziel-Port: $DB_TARGET_PORT"
echo "   Ziel-Datenbank: $DB_TARGET_NAME"
echo "   Ziel-User: $DB_TARGET_USER"
echo ""

# Prüfe ob PostgreSQL installiert ist
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL ist nicht installiert!"
    echo "Bitte installiere PostgreSQL:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "  CentOS/RHEL: sudo yum install postgresql postgresql-server"
    echo "  macOS: brew install postgresql"
    exit 1
fi

# Prüfe ob PostgreSQL läuft
if ! pg_isready -h "$DB_ADMIN_HOST" -p "$DB_ADMIN_PORT" -q; then
    echo "❌ PostgreSQL läuft nicht auf $DB_ADMIN_HOST:$DB_ADMIN_PORT!"
    echo "Bitte starte PostgreSQL:"
    echo "  Ubuntu/Debian: sudo systemctl start postgresql"
    echo "  CentOS/RHEL: sudo systemctl start postgresql"
    echo "  macOS: brew services start postgresql"
    exit 1
fi

echo "✅ PostgreSQL ist installiert und läuft"

# Prüfe Admin-Verbindung
echo "🔐 Teste Admin-Verbindung..."
if [ -n "$DB_ADMIN_PASSWORD" ]; then
    # Mit Passwort
    PGPASSWORD="$DB_ADMIN_PASSWORD" psql -h "$DB_ADMIN_HOST" -p "$DB_ADMIN_PORT" -U "$DB_ADMIN_USER" -d postgres -c "SELECT 1;" > /dev/null 2>&1
    PSQL_ADMIN="psql -h $DB_ADMIN_HOST -p $DB_ADMIN_PORT -U $DB_ADMIN_USER"
else
    # Ohne Passwort (lokale Verbindung)
    if [ "$(whoami)" = "postgres" ]; then
        PSQL_ADMIN="psql -h $DB_ADMIN_HOST -p $DB_ADMIN_PORT -U $DB_ADMIN_USER"
    elif psql -h "$DB_ADMIN_HOST" -p "$DB_ADMIN_PORT" -U "$DB_ADMIN_USER" -c "SELECT 1;" > /dev/null 2>&1; then
        PSQL_ADMIN="psql -h $DB_ADMIN_HOST -p $DB_ADMIN_PORT -U $DB_ADMIN_USER"
    elif sudo -u postgres psql -h "$DB_ADMIN_HOST" -p "$DB_ADMIN_PORT" -c "SELECT 1;" > /dev/null 2>&1; then
        PSQL_ADMIN="sudo -u postgres psql -h $DB_ADMIN_HOST -p $DB_ADMIN_PORT"
    else
        echo "❌ Keine Berechtigung für PostgreSQL!"
        echo "Bitte führe das Script als postgres-Benutzer aus oder mit sudo-Rechten:"
        echo "  sudo -u postgres ./setup-database.sh"
        echo "  oder"
        echo "  sudo ./setup-database.sh"
        exit 1
    fi
fi

echo "✅ Admin-Verbindung erfolgreich"

# Erstelle temporäre SQL-Datei mit den korrekten Werten
TEMP_SQL_FILE=$(mktemp)
echo "📝 Erstelle temporäre SQL-Datei: $TEMP_SQL_FILE"

# Kopiere setup-database.sql und ersetze Platzhalter
if [ -f setup-database.sql ]; then
    cp setup-database.sql "$TEMP_SQL_FILE"
else
    echo "❌ setup-database.sql nicht gefunden!"
    exit 1
fi

# Ersetze Platzhalter in der SQL-Datei
sed -i "s/{{DB_NAME}}/$DB_TARGET_NAME/g" "$TEMP_SQL_FILE"
sed -i "s/{{DB_USER}}/$DB_TARGET_USER/g" "$TEMP_SQL_FILE"
sed -i "s/{{DB_PASSWORD}}/$DB_TARGET_PASSWORD/g" "$TEMP_SQL_FILE"

# Führe Setup aus
echo "📊 Führe Datenbank-Setup aus..."
if [ -n "$DB_ADMIN_PASSWORD" ]; then
    PGPASSWORD="$DB_ADMIN_PASSWORD" $PSQL_ADMIN -d postgres -f "$TEMP_SQL_FILE"
else
    $PSQL_ADMIN -d postgres -f "$TEMP_SQL_FILE"
fi

# Räume temporäre Datei auf
rm "$TEMP_SQL_FILE"

echo ""
echo "✅ Datenbank-Setup erfolgreich abgeschlossen!"
echo ""
echo "📋 Konfiguration:"
echo "   Host: $DB_TARGET_HOST"
echo "   Port: $DB_TARGET_PORT"
echo "   Datenbank: $DB_TARGET_NAME"
echo "   Benutzer: $DB_TARGET_USER"
echo "   Passwort: $DB_TARGET_PASSWORD"
echo ""
echo "🔗 Verbindungsstring:"
echo "postgresql://$DB_TARGET_USER:$DB_TARGET_PASSWORD@$DB_TARGET_HOST:$DB_TARGET_PORT/$DB_TARGET_NAME"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Teste die Verbindung:"
echo "   psql postgresql://$DB_TARGET_USER:$DB_TARGET_PASSWORD@$DB_TARGET_HOST:$DB_TARGET_PORT/$DB_TARGET_NAME"
echo ""
echo "2. Starte die Anwendung:"
echo "   npm run dev"
echo ""
echo "3. Wechsle die Umgebung (falls nötig):"
echo "   ./switch-env.sh dev"
echo "   ./switch-env.sh test"
echo "   ./switch-env.sh prod"
