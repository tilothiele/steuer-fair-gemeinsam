-- Migration Script für Steuer-Fair-Gemeinsam
-- Führt die notwendigen Änderungen an der bestehenden Datenbank durch

-- 1. Füge calculation_mode Spalte hinzu (falls sie nicht existiert)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tax_data' 
        AND column_name = 'calculation_mode'
    ) THEN
        ALTER TABLE tax_data ADD COLUMN calculation_mode VARCHAR(20) DEFAULT 'manual';
        RAISE NOTICE 'Spalte calculation_mode zur tax_data Tabelle hinzugefügt';
    ELSE
        RAISE NOTICE 'Spalte calculation_mode existiert bereits';
    END IF;
END $$;

-- 2. Entferne alte Spalten (falls sie existieren)
DO $$
BEGIN
    -- Entferne Werbungskosten Spalten
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tax_data' 
        AND column_name = 'partner_a_werbungskosten'
    ) THEN
        ALTER TABLE tax_data DROP COLUMN partner_a_werbungskosten;
        RAISE NOTICE 'Spalte partner_a_werbungskosten entfernt';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tax_data' 
        AND column_name = 'partner_b_werbungskosten'
    ) THEN
        ALTER TABLE tax_data DROP COLUMN partner_b_werbungskosten;
        RAISE NOTICE 'Spalte partner_b_werbungskosten entfernt';
    END IF;
    
    -- Entferne Sonderausgaben Spalten
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tax_data' 
        AND column_name = 'partner_a_sonderausgaben'
    ) THEN
        ALTER TABLE tax_data DROP COLUMN partner_a_sonderausgaben;
        RAISE NOTICE 'Spalte partner_a_sonderausgaben entfernt';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tax_data' 
        AND column_name = 'partner_b_sonderausgaben'
    ) THEN
        ALTER TABLE tax_data DROP COLUMN partner_b_sonderausgaben;
        RAISE NOTICE 'Spalte partner_b_sonderausgaben entfernt';
    END IF;
    
    -- Entferne außergewöhnliche Belastungen Spalten
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tax_data' 
        AND column_name = 'partner_a_ausserg_belastungen'
    ) THEN
        ALTER TABLE tax_data DROP COLUMN partner_a_ausserg_belastungen;
        RAISE NOTICE 'Spalte partner_a_ausserg_belastungen entfernt';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tax_data' 
        AND column_name = 'partner_b_ausserg_belastungen'
    ) THEN
        ALTER TABLE tax_data DROP COLUMN partner_b_ausserg_belastungen;
        RAISE NOTICE 'Spalte partner_b_ausserg_belastungen entfernt';
    END IF;
    
    -- Entferne Kinderfreibetrag Spalten
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tax_data' 
        AND column_name = 'kinderfreibetrag'
    ) THEN
        ALTER TABLE tax_data DROP COLUMN kinderfreibetrag;
        RAISE NOTICE 'Spalte kinderfreibetrag entfernt';
    END IF;
END $$;

-- 3. Aktualisiere bestehende Datensätze
UPDATE tax_data 
SET calculation_mode = 'manual' 
WHERE calculation_mode IS NULL;

-- 4. Zeige aktuelle Tabellen-Struktur
\d tax_data;
