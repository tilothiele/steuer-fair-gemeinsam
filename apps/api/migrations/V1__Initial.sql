-- V1__Initial.sql
-- Erste Migration für Steuer-Fair-Anwendung

-- Benutzer-Tabelle
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    steuernummer VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Steuerdaten-Tabelle
CREATE TABLE IF NOT EXISTS tax_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    
    -- Partner A Daten
    partner_a_einkommen DECIMAL(12,2),
    partner_a_steuern DECIMAL(12,2),
    partner_a_soli DECIMAL(12,2),
    partner_a_kirchensteuer DECIMAL(12,2),
    partner_a_haette_zahlen_muessen DECIMAL(12,2),
    partner_a_hat_gezahlt DECIMAL(12,2),
    partner_a_differenz DECIMAL(12,2),
    
    -- Partner B Daten
    partner_b_einkommen DECIMAL(12,2),
    partner_b_steuern DECIMAL(12,2),
    partner_b_soli DECIMAL(12,2),
    partner_b_kirchensteuer DECIMAL(12,2),
    partner_b_haette_zahlen_muessen DECIMAL(12,2),
    partner_b_hat_gezahlt DECIMAL(12,2),
    partner_b_differenz DECIMAL(12,2),
    
    -- Gemeinsame Daten
    gemeinsames_einkommen DECIMAL(12,2),
    gemeinsame_steuern DECIMAL(12,2),
    gemeinsamer_soli DECIMAL(12,2),
    gemeinsame_kirchensteuer DECIMAL(12,2),
    gemeinsame_haette_zahlen_muessen DECIMAL(12,2),
    gemeinsame_hat_gezahlt DECIMAL(12,2),
    gemeinsame_differenz DECIMAL(12,2),
    
    -- Berechnungsmodus
    calculation_mode VARCHAR(50) DEFAULT 'calculated',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, year)
);

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_tax_data_user_year ON tax_data(user_id, year);
CREATE INDEX IF NOT EXISTS idx_users_login_id ON users(login_id);

-- Trigger für updated_at Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für users Tabelle
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger für tax_data Tabelle
CREATE TRIGGER update_tax_data_updated_at 
    BEFORE UPDATE ON tax_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

