-- PostgreSQL Schema für Steuer-Fair-Gemeinsam

-- Benutzerprofile Tabelle
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    login_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    steuernummer VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Steuerdaten Tabelle
CREATE TABLE IF NOT EXISTS tax_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    tax_year INTEGER NOT NULL,

    -- Partner A Daten
    partner_a_name VARCHAR(255),
    partner_a_steuer_id VARCHAR(255),
    partner_a_sek DECIMAL(12,2),
    partner_a_tax_class INTEGER,
    partner_a_fee DECIMAL(12,2),
    partner_a_fse DECIMAL(12,2),
    partner_a_gl DECIMAL(12,2),
    partner_a_gve DECIMAL(12,2),
    partner_a_gs DECIMAL(12,2),

    -- Partner B Daten
    partner_b_name VARCHAR(255),
    partner_b_steuer_id VARCHAR(255),
    partner_b_sek DECIMAL(12,2),
    partner_b_tax_class INTEGER,
    partner_b_fee DECIMAL(12,2),
    partner_b_fse DECIMAL(12,2),
    partner_b_gl DECIMAL(12,2),
    partner_b_gve DECIMAL(12,2),
    partner_b_gs DECIMAL(12,2),

    -- Gemeinsame Daten
    joint_gsek DECIMAL(12,2),
    joint_gfe DECIMAL(12,2),
    joint_gfs DECIMAL(12,2),
    calculation_mode VARCHAR(20) DEFAULT 'manual', -- 'manual' oder 'calculated'

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, tax_year)
);

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_tax_data_user_year ON tax_data(user_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_user_profiles_login_id ON user_profiles(login_id);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_data_updated_at
    BEFORE UPDATE ON tax_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
