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

-- Benutzerprofile Tabelle
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGSERIAL PRIMARY KEY,
    login_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    steuernummer VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Steuerdaten Tabelle
CREATE TABLE IF NOT EXISTS tax_data (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    tax_year INTEGER NOT NULL,

        -- Partner A Daten
    partner_a_name VARCHAR(255),
    partner_a_steuer_id VARCHAR(255),
    partner_a_sek DECIMAL(12,2),
    partner_a_tax_class BIGINT,
    partner_a_allowances DECIMAL(12,2),
    partner_a_special_expenses DECIMAL(12,2),
    partner_a_extraordinary_expenses DECIMAL(12,2),
    partner_a_child_allowance DECIMAL(12,2),
    partner_a_fee DECIMAL(12,2),
    partner_a_fse DECIMAL(12,2),
    partner_a_gl DECIMAL(12,2),
    partner_a_gve DECIMAL(12,2),
    partner_a_gs DECIMAL(12,2),
    
    -- Partner B Daten
    partner_b_name VARCHAR(255),
    partner_b_steuer_id VARCHAR(255),
    partner_b_sek DECIMAL(12,2),
    partner_b_tax_class BIGINT,
    partner_b_allowances DECIMAL(12,2),
    partner_b_special_expenses DECIMAL(12,2),
    partner_b_extraordinary_expenses DECIMAL(12,2),
    partner_b_child_allowance DECIMAL(12,2),
    partner_b_fee DECIMAL(12,2),
    partner_b_fse DECIMAL(12,2),
    partner_b_gl DECIMAL(12,2),
    partner_b_gve DECIMAL(12,2),
    partner_b_gs DECIMAL(12,2),

    -- Gemeinsame Daten
    joint_gsek DECIMAL(12,2),
    joint_gfe DECIMAL(12,2),
    joint_gfs DECIMAL(12,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, tax_year)
);

-- =====================================================
-- 5. INDEXE ERSTELLEN
-- =====================================================

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_tax_data_user_year ON tax_data(user_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_user_profiles_login_id ON user_profiles(login_id);

-- =====================================================
-- 6. TRIGGER ERSTELLEN
-- =====================================================

-- Trigger-Funktion für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger für tax_data
DROP TRIGGER IF EXISTS update_tax_data_updated_at ON tax_data;
CREATE TRIGGER update_tax_data_updated_at
    BEFORE UPDATE ON tax_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. TESTDATEN EINFÜGEN
-- =====================================================

-- Füge Dummy-Benutzer ein (nur wenn sie nicht existieren)
INSERT INTO user_profiles (login_id, name, steuernummer) VALUES
    ('maxmustermann', 'Max Mustermann', '12345678901'),
    ('maria.schmidt', 'Maria Schmidt', '98765432109'),
    ('test', 'Test Benutzer', '11111111111')
ON CONFLICT (login_id) DO NOTHING;

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
