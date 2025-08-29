#!/bin/bash

# Datenbank-Migration für Steuer-Fair-Gemeinsam
# Führt die notwendigen Schema-Änderungen durch

set -e

echo "🚀 Starte Datenbank-Migration..."

# Lade Environment-Variablen
if [ -f .env ]; then
    echo "📋 Lade Environment-Variablen aus .env..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  .env Datei nicht gefunden. Verwende Standard-Werte."
fi

# Datenbank-Verbindungsdaten
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"steuer_fair"}
DB_USER=${DB_USER:-"steuer_fair_user"}

echo "🔗 Verbinde mit Datenbank: $DB_HOST:$DB_PORT/$DB_NAME"

# Prüfe ob psql verfügbar ist
if ! command -v psql &> /dev/null; then
    echo "❌ psql ist nicht installiert. Bitte installieren Sie PostgreSQL Client."
    exit 1
fi

# Führe Migration aus
echo "📝 Führe Migration aus..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f infrastructure/database/migration.sql

echo "✅ Migration erfolgreich abgeschlossen!"

# Zeige Tabellen-Struktur
echo "📊 Aktuelle Tabellen-Struktur:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\d tax_data"

echo "🎉 Migration abgeschlossen!"
