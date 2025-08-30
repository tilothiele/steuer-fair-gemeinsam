-- PostgreSQL Setup für Steuer-Fair-Gemeinsam
-- Diese Datei richtet die komplette Datenbankumgebung ein
-- Platzhalter werden automatisch durch setup-database.sh ersetzt

-- =====================================================
-- 1. DATENBANK ERSTELLEN
-- =====================================================

-- Erstelle die Datenbank (nur wenn sie nicht existiert)
SELECT 'CREATE DATABASE {{DB_NAME}}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '{{DB_NAME}}')\gexec

-- =====================================================
-- 2. BENUTZER ERSTELLEN
-- =====================================================

-- Erstelle den Anwendungsbenutzer
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '{{DB_USER}}') THEN
        CREATE USER {{DB_USER}} WITH PASSWORD '{{DB_PASSWORD}}';
    END IF;
END
$$;

-- =====================================================
-- 3. BERECHTIGUNGEN SETZEN
-- =====================================================

-- Gewähre alle Rechte auf die Datenbank
GRANT ALL PRIVILEGES ON DATABASE {{DB_NAME}} TO {{DB_USER}};

-- Verbinde zur {{DB_NAME}} Datenbank
\c {{DB_NAME}};

-- Gewähre Schema-Rechte
GRANT ALL ON SCHEMA public TO {{DB_USER}};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {{DB_USER}};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {{DB_USER}};

-- Setze Standard-Berechtigungen für zukünftige Objekte
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO {{DB_USER}};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO {{DB_USER}};

-- =====================================================
-- 4. TABELLEN ERSTELLEN
-- =====================================================

-- wird durch node-flyway ersetzt

-- =====================================================
-- 7. TESTDATEN EINFÜGEN
-- =====================================================

-- entfällt

-- =====================================================
-- 8. BERECHTIGUNGEN FÜR NEUE OBJEKTE
-- =====================================================

-- Gewähre Rechte auf alle erstellten Objekte
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {{DB_USER}};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {{DB_USER}};
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO {{DB_USER}};

-- =====================================================
-- 9. VERIFIKATION
-- =====================================================

-- Zeige erstellte Tabellen
\dt

-- Zeige erstellte Benutzer
\du {{DB_USER}}

-- Zeige Testdaten
SELECT 'Benutzer in user_profiles:' as info;
SELECT id, login_id, name, steuernummer FROM user_profiles;

-- Erfolgsmeldung
SELECT 'PostgreSQL Setup für Steuer-Fair-Gemeinsam erfolgreich abgeschlossen!' as status;
