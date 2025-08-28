#!/bin/bash

# Script zum Wechseln der Umgebung (Development, Test, Production)

set -e

# Funktion zum Anzeigen der aktuellen Umgebung
show_current_env() {
    echo "🔄 Aktuelle Umgebung:"
    if [ -f .env ]; then
        NODE_ENV=$(grep "^NODE_ENV=" .env | cut -d'=' -f2)
        DB_HOST=$(grep "^DB_HOST=" .env | cut -d'=' -f2)
        DB_NAME=$(grep "^DB_NAME=" .env | cut -d'=' -f2)
        echo "   NODE_ENV: $NODE_ENV"
        echo "   DB_HOST: $DB_HOST"
        echo "   DB_NAME: $DB_NAME"
    else
        echo "   Keine .env-Datei gefunden!"
    fi
    echo ""
}

# Funktion zum Lesen von Werten aus .env
get_env_value() {
    local key=$1
    local value=$(grep "^${key}=" .env | cut -d'=' -f2)
    echo "$value"
}

# Funktion zum Wechseln zur Development-Umgebung
switch_to_dev() {
    echo "🔄 Wechsle zu Development-Umgebung..."
    
    # Lade Werte aus .env
    DB_HOST_DEV=$(get_env_value "DB_HOST_DEV")
    DB_PORT_DEV=$(get_env_value "DB_PORT_DEV")
    DB_NAME_DEV=$(get_env_value "DB_NAME_DEV")
    DB_USER_DEV=$(get_env_value "DB_USER_DEV")
    DB_PASSWORD_DEV=$(get_env_value "DB_PASSWORD_DEV")
    DATABASE_URL_DEV=$(get_env_value "DATABASE_URL_DEV")
    
    # Aktualisiere NODE_ENV
    sed -i 's/^NODE_ENV=.*/NODE_ENV=development/' .env
    
    # Aktualisiere Datenbankverbindung mit tatsächlichen Werten
    sed -i "s|^DB_HOST=.*|DB_HOST=$DB_HOST_DEV|" .env
    sed -i "s|^DB_PORT=.*|DB_PORT=$DB_PORT_DEV|" .env
    sed -i "s|^DB_NAME=.*|DB_NAME=$DB_NAME_DEV|" .env
    sed -i "s|^DB_USER=.*|DB_USER=$DB_USER_DEV|" .env
    sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD_DEV|" .env
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL_DEV|" .env
    
    echo "✅ Development-Umgebung aktiviert!"
    show_current_env
}

# Funktion zum Wechseln zur Test-Umgebung
switch_to_test() {
    echo "🔄 Wechsle zu Test-Umgebung..."
    
    # Lade Werte aus .env
    DB_HOST_TEST=$(get_env_value "DB_HOST_TEST")
    DB_PORT_TEST=$(get_env_value "DB_PORT_TEST")
    DB_NAME_TEST=$(get_env_value "DB_NAME_TEST")
    DB_USER_TEST=$(get_env_value "DB_USER_TEST")
    DB_PASSWORD_TEST=$(get_env_value "DB_PASSWORD_TEST")
    DATABASE_URL_TEST=$(get_env_value "DATABASE_URL_TEST")
    
    # Aktualisiere NODE_ENV
    sed -i 's/^NODE_ENV=.*/NODE_ENV=test/' .env
    
    # Aktualisiere Datenbankverbindung mit tatsächlichen Werten
    sed -i "s|^DB_HOST=.*|DB_HOST=$DB_HOST_TEST|" .env
    sed -i "s|^DB_PORT=.*|DB_PORT=$DB_PORT_TEST|" .env
    sed -i "s|^DB_NAME=.*|DB_NAME=$DB_NAME_TEST|" .env
    sed -i "s|^DB_USER=.*|DB_USER=$DB_USER_TEST|" .env
    sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD_TEST|" .env
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL_TEST|" .env
    
    echo "✅ Test-Umgebung aktiviert!"
    show_current_env
}

# Funktion zum Wechseln zur Production-Umgebung
switch_to_prod() {
    echo "🔄 Wechsle zu Production-Umgebung..."
    
    # Lade Werte aus .env
    DB_HOST_PROD=$(get_env_value "DB_HOST_PROD")
    DB_PORT_PROD=$(get_env_value "DB_PORT_PROD")
    DB_NAME_PROD=$(get_env_value "DB_NAME_PROD")
    DB_USER_PROD=$(get_env_value "DB_USER_PROD")
    DB_PASSWORD_PROD=$(get_env_value "DB_PASSWORD_PROD")
    DATABASE_URL_PROD=$(get_env_value "DATABASE_URL_PROD")
    
    # Aktualisiere NODE_ENV
    sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' .env
    
    # Aktualisiere Datenbankverbindung mit tatsächlichen Werten
    sed -i "s|^DB_HOST=.*|DB_HOST=$DB_HOST_PROD|" .env
    sed -i "s|^DB_PORT=.*|DB_PORT=$DB_PORT_PROD|" .env
    sed -i "s|^DB_NAME=.*|DB_NAME=$DB_NAME_PROD|" .env
    sed -i "s|^DB_USER=.*|DB_USER=$DB_USER_PROD|" .env
    sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD_PROD|" .env
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL_PROD|" .env
    
    echo "✅ Production-Umgebung aktiviert!"
    show_current_env
}

# Hauptlogik
echo "🚀 Steuer-Fair-Gemeinsam - Umgebung wechseln"
echo "=============================================="

# Zeige aktuelle Umgebung
show_current_env

# Prüfe Argumente
case "${1:-}" in
    "dev"|"development")
        switch_to_dev
        ;;
    "test"|"testing")
        switch_to_test
        ;;
    "prod"|"production")
        switch_to_prod
        ;;
    "status"|"current")
        show_current_env
        ;;
    *)
        echo "❌ Ungültige Option!"
        echo ""
        echo "📋 Verwendung:"
        echo "  ./switch-env.sh dev|development    - Wechsel zu Development"
        echo "  ./switch-env.sh test|testing       - Wechsel zu Test"
        echo "  ./switch-env.sh prod|production    - Wechsel zu Production"
        echo "  ./switch-env.sh status|current     - Zeige aktuelle Umgebung"
        echo ""
        echo "💡 Beispiel:"
        echo "  ./switch-env.sh dev"
        echo "  ./switch-env.sh status"
        exit 1
        ;;
esac

echo ""
echo "📋 Nächste Schritte:"
echo "1. Starte die Anwendung neu: npm run dev"
echo "2. Teste die Verbindung zur neuen Datenbank"
echo "3. Überprüfe die Logs auf Verbindungsfehler"
