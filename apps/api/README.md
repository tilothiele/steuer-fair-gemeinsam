# Steuer-Fair API

## Knex.js Migrationen

Diese API verwendet [Knex.js](https://knexjs.org/) für Datenbank-Migrationen.

### Umgebungsvariablen

#### KNEX_MIGRATIONS_DIR
- **Standard:** `./migrations`
- **Beschreibung:** Verzeichnis für Knex.js Migrations-Dateien
- **Beispiel:** `KNEX_MIGRATIONS_DIR=./db/migrations`

#### KNEX_SEEDS_DIR
- **Standard:** `./seeds`
- **Beschreibung:** Verzeichnis für Knex.js Seed-Dateien
- **Beispiel:** `KNEX_SEEDS_DIR=./db/seeds`

### Verfügbare Befehle

#### Migrationen
```bash
# Alle ausstehenden Migrationen ausführen
npm run migrate

# Migrations-Status anzeigen
npm run migrate:status

# Neue Migration erstellen
npm run migrate:make migration_name

# Letzte Migration rückgängig machen
npm run migrate:rollback

# Alle Migrationen rückgängig machen
npm run migrate:rollback --all
```

#### Seeds
```bash
# Alle Seeds ausführen
npm run seed

# Neuen Seed erstellen
npm run seed:make seed_name

# Letzten Seed rückgängig machen
npm run seed:rollback
```

### Verzeichnisstruktur

```
apps/api/
├── migrations/          # Datenbank-Struktur
│   └── 2024_01_01_000000_initial.ts
├── seeds/              # Beispieldaten
│   └── 01_example_users.ts
└── src/
```

### Migration-Dateien

Migration-Dateien werden im Verzeichnis `./migrations` (oder dem in `KNEX_MIGRATIONS_DIR` definierten Verzeichnis) gespeichert.

**Beispiel-Struktur:**
```
migrations/
├── 2024_01_01_000000_initial.ts
└── 2024_01_02_000000_add_new_table.ts
```

### Seed-Dateien

Seed-Dateien werden im Verzeichnis `./seeds` (oder dem in `KNEX_SEEDS_DIR` definierten Verzeichnis) gespeichert.

**Beispiel-Struktur:**
```
seeds/
├── 01_example_users.ts
├── 02_tax_data.ts
└── 03_reference_data.ts
```

### Automatische Migration

Beim Start der Anwendung werden automatisch alle ausstehenden Migrationen ausgeführt. Falls keine Migrationen ausstehen, wird der Status überprüft.

### Datenbank-Verbindung

Die Datenbank-Verbindung wird über folgende Umgebungsvariablen konfiguriert:

- `DB_HOST` - Datenbank-Host (Standard: localhost)
- `DB_PORT` - Datenbank-Port (Standard: 5432)
- `DB_NAME` - Datenbank-Name (Standard: steuer_fair)
- `DB_USER` - Datenbank-Benutzer (Standard: postgres)
- `DB_PASSWORD` - Datenbank-Passwort (Standard: postgres)
