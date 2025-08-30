# Node-Flyway Integration für Steuer-Fair-Anwendung

## Übersicht

Die Steuer-Fair-Anwendung verwendet [node-flyway](https://www.npmjs.com/package/node-flyway) für Datenbank-Migrationen. Dieses Package bietet eine einfache Node.js API für Flyway und lädt automatisch die benötigte Flyway CLI herunter. **Flyway wird nur verwendet, wenn die Umgebungsvariable `USE_FLYWAY=true` gesetzt ist.**

## Vorteile von node-flyway

### ✅ **1. Automatische Installation:**
- **Keine manuelle Flyway-Installation** erforderlich
- **Automatischer Download** der Flyway CLI
- **Version-Management** über das Package

### ✅ **2. Einfache Integration:**
- **TypeScript-Support** mit vollständigen Typdefinitionen
- **Promise-basierte API** für einfache Verwendung
- **Fehlerbehandlung** mit detaillierten Fehlermeldungen

### ✅ **3. Vollständige Flyway-Funktionalität:**
- **Alle Flyway-Befehle:** migrate, clean, info, validate, baseline, repair
- **Konfiguration:** Über JavaScript-Objekte
- **Logging:** Detaillierte Ausgaben und Fehler

## Integration

### ✅ **1. Package-Installation:**

```bash
# node-flyway wurde bereits installiert
npm install node-flyway
```

### ✅ **2. Migration-Service:**

```typescript
// apps/api/src/services/migration-service.ts
import { Flyway } from 'node-flyway';

export class MigrationService {
  private flyway: Flyway;

  constructor() {
    this.flyway = new Flyway(flywayConfig);
  }

  // Alle Flyway-Befehle verfügbar
  async migrate(): Promise<void>
  async info(): Promise<void>
  async validate(): Promise<void>
  async clean(): Promise<void>
  async baseline(version: string): Promise<void>
  async repair(): Promise<void>
}
```

### ✅ **3. Bedingte Flyway-Aktivierung:**

Die Anwendung prüft beim Start die Umgebungsvariable `USE_FLYWAY`:
- **`USE_FLYWAY=true`:** Flyway-Migration wird ausgeführt
- **`USE_FLYWAY` nicht gesetzt oder `false`:** Flyway wird übersprungen

### ✅ **4. Automatische Migration beim Start:**

```typescript
// apps/api/src/index.ts
const startServer = async () => {
  // Datenbank-Verbindung testen
  const dbConnected = await testConnection();

  // Migration-Service initialisieren (nur wenn USE_FLYWAY=true)
  const useFlyway = process.env.USE_FLYWAY === 'true';
  if (useFlyway) {
    logger.info('Flyway-Migration aktiviert');
    const migrationService = new MigrationService();

    // Migration-Status prüfen
    await migrationService.info();

    // Migration ausführen, falls ausstehende Migrationen vorhanden sind
    await migrationService.migrateIfNeeded();
  } else {
    logger.info('Flyway-Migration deaktiviert');
  }

  // Server starten
  app.listen(PORT, () => {
    logger.info('🚀 Server gestartet');
  });
};
```

### ✅ **5. API-Routen für Migration-Management:**

```typescript
// apps/api/src/routes/migration.ts
GET  /api/migration/info      // Migration-Status anzeigen (nur wenn USE_FLYWAY=true)
POST /api/migration/migrate   // Migration ausführen (nur wenn USE_FLYWAY=true)
POST /api/migration/validate  // Migrationen validieren (nur wenn USE_FLYWAY=true)
POST /api/migration/clean     // Datenbank bereinigen (nur wenn USE_FLYWAY=true)
GET  /api/migration/status    // Ausstehende Migrationen prüfen (nur wenn USE_FLYWAY=true)
POST /api/migration/baseline  // Baseline-Migration erstellen (nur wenn USE_FLYWAY=true)
POST /api/migration/repair    // Migration-Probleme reparieren (nur wenn USE_FLYWAY=true)
```

## Konfiguration

### 📋 **1. Flyway-Konfiguration:**

```typescript
// apps/api/src/config/database.ts
export const flywayConfig = {
  url: `jdbc:postgresql://${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
  user: dbConfig.user,
  password: dbConfig.password,
  defaultSchema: 'public',
  migrationLocations: ['migrations']
};
```

### 📋 **2. Migration-Dateien:**

```
apps/api/migrations/
├── V1__Initial_schema.sql  # Erste Migration
├── V2__Add_new_feature.sql # Neue Migrationen hier hinzufügen
└── ...
```

### 📋 **3. Umgebungsvariablen:**

```bash
# .env Datei
DB_HOST=localhost
DB_PORT=5432
DB_NAME=steuer_fair
DB_USER=postgres
DB_PASSWORD=postgres

# Flyway-Aktivierung
USE_FLYWAY=true  # Flyway-Migration aktivieren
# USE_FLYWAY=false  # Flyway-Migration deaktivieren
# USE_FLYWAY nicht gesetzt = deaktiviert
```

## Verwendung

### 🚀 **1. Anwendung mit Flyway starten:**

```bash
# Umgebungsvariable setzen
export USE_FLYWAY=true

# Anwendung starten (Migration wird automatisch ausgeführt)
npm run dev

# Logs zeigen:
# - Datenbank-Verbindung erfolgreich
# - Flyway-Migration aktiviert
# - Migration-Status angezeigt
# - Ausstehende Migrationen ausgeführt (falls vorhanden)
# - Flyway CLI automatisch heruntergeladen (beim ersten Mal)
```

### 🚀 **2. Anwendung ohne Flyway starten:**

```bash
# Umgebungsvariable nicht setzen oder auf false setzen
export USE_FLYWAY=false
# oder
unset USE_FLYWAY

# Anwendung starten (Migration wird übersprungen)
npm run dev

# Logs zeigen:
# - Datenbank-Verbindung erfolgreich
# - Flyway-Migration deaktiviert
```

### 🚀 **3. Manuelle Migration über API (nur wenn USE_FLYWAY=true):**

```bash
# Migration-Status prüfen
curl -X GET http://localhost:3001/api/migration/info \
  -H "Authorization: Bearer YOUR_TOKEN"

# Migration ausführen
curl -X POST http://localhost:3001/api/migration/migrate \
  -H "Authorization: Bearer YOUR_TOKEN"

# Ausstehende Migrationen prüfen
curl -X GET http://localhost:3001/api/migration/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 🚀 **4. Migration-Validierung:**

```bash
# Migrationen validieren
curl -X POST http://localhost:3001/api/migration/validate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Migrationen erstellen

### 📝 **1. Neue Migration-Datei erstellen:**

```bash
# Neue Migration erstellen
touch apps/api/migrations/V2__Add_new_feature.sql
```

### 📝 **2. Migration schreiben:**

```sql
-- V2__Add_new_feature.sql
-- Beschreibung: Neue Funktion hinzufügen

-- Neue Tabelle
CREATE TABLE IF NOT EXISTS new_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_new_table_name ON new_table(name);
```

### 📝 **3. Migration testen:**

```bash
# Anwendung starten (Migration wird automatisch ausgeführt)
npm run dev

# Oder manuell über API
curl -X POST http://localhost:3001/api/migration/migrate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## node-flyway Features

### 🔧 **1. Automatische CLI-Verwaltung:**

```typescript
// node-flyway lädt automatisch die Flyway CLI herunter
// Standard-Location: ~/.node-flyway
// Version: Automatisch verwaltet
```

### 🔧 **2. Erweiterte Konfiguration:**

```typescript
const flywayConfig = {
  url: 'jdbc:postgresql://localhost:5432/steuer_fair',
  user: 'postgres',
  password: 'postgres',
  defaultSchema: 'public',
  migrationLocations: ['migrations'],
  advanced: {
    // Erweiterte Flyway-Optionen
    validateOnMigrate: true,
    cleanDisabled: false,
    encoding: 'UTF-8'
  }
};
```

### 🔧 **3. Execution Options:**

```typescript
const executionOptions = {
  flywayCliLocation: '~/.node-flyway',
  flywayCliStrategy: 'LOCAL_CLI_WITH_DOWNLOAD_FALLBACK'
};

const flyway = new Flyway(flywayConfig, executionOptions);
```

## Troubleshooting

### 🚨 **1. Flyway-Migration deaktiviert:**

```bash
# Fehler: "Flyway-Migration ist deaktiviert"
# Lösung: USE_FLYWAY=true setzen
export USE_FLYWAY=true
npm run dev
```

### 🚨 **2. Flyway CLI Download-Fehler:**

```bash
# Fehler: "Unable to download Flyway CLI"
# Lösung: Internet-Verbindung prüfen, Proxy-Einstellungen
# node-flyway versucht automatisch erneut
```

### 🚨 **3. Datenbank-Verbindung:**

```bash
# Fehler: "Database connection failed"
# Lösung: PostgreSQL starten und Verbindung prüfen
sudo systemctl start postgresql
psql -h localhost -U postgres -d steuer_fair
```

### 🚨 **4. Migration-Fehler:**

```bash
# Fehler: "Migration failed"
# Lösung: Logs prüfen und Migration validieren
curl -X POST http://localhost:3001/api/migration/validate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 🚨 **5. Berechtigungsfehler:**

```bash
# Fehler: "Permission denied"
# Lösung: Flyway CLI-Verzeichnis prüfen
ls -la ~/.node-flyway/
chmod +x ~/.node-flyway/flyway-*
```

## Best Practices

### ✅ **1. Umgebungsvariablen:**
- **Entwicklung:** `USE_FLYWAY=true` für automatische Migrationen
- **Produktion:** `USE_FLYWAY=true` für kontrollierte Migrationen
- **Testing:** `USE_FLYWAY=false` für isolierte Tests
- **Deaktivierung:** `USE_FLYWAY` nicht setzen oder `false` für keine Migrationen

### ✅ **2. Migration-Naming:**
- **Format:** `V{Version}__{Beschreibung}.sql`
- **Beispiel:** `V1__Initial_schema.sql`
- **Regeln:** Nur Buchstaben, Zahlen, Unterstriche

### ✅ **3. SQL-Standards:**
- **IF NOT EXISTS:** Für Tabellen und Indizes
- **CASCADE:** Für Foreign Keys
- **Indizes:** Für Performance-kritische Felder
- **Trigger:** Für automatische Timestamps

### ✅ **4. Sicherheit:**
- **Backup:** Vor Migrationen sichern
- **Test:** In Entwicklungsumgebung testen
- **Validierung:** `validate` vor Migration
- **Rollback:** Plan für Rollback haben

### ✅ **5. node-flyway spezifisch:**
- **Automatische CLI:** Keine manuelle Installation nötig
- **Version-Management:** Package verwaltet Flyway-Version
- **Fehlerbehandlung:** Detaillierte Fehlermeldungen nutzen
- **Logging:** Vollständige Migration-Logs

## Status

- ✅ **Bedingte node-flyway Integration:** Nur bei USE_FLYWAY=true aktiv
- ✅ **Automatische Migration:** Beim Anwendungsstart (falls aktiviert)
- ✅ **API-Routen:** Migration-Management über REST-API (falls aktiviert)
- ✅ **Fehlerbehandlung:** Graceful Error Handling
- ✅ **Logging:** Vollständige Migration-Logs
- ✅ **TypeScript:** Vollständige Typdefinitionen
- ✅ **Automatische CLI:** Flyway wird automatisch heruntergeladen

**node-flyway ist erfolgreich in die Steuer-Fair-Anwendung integriert und kann über USE_FLYWAY gesteuert werden!** 🎉

## Nächste Schritte

1. **USE_FLYWAY setzen:** `export USE_FLYWAY=true` für Migrationen
2. **Anwendung starten:** Migration wird automatisch ausgeführt (falls aktiviert)
3. **Logs prüfen:** Migration-Status in den Logs
4. **Neue Migrationen:** Bei Schema-Änderungen erstellen
5. **API testen:** Migration-Endpoints überprüfen

## Referenzen

- [node-flyway Package](https://www.npmjs.com/package/node-flyway)
- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Database Migration Best Practices](https://flywaydb.org/documentation/concepts/migrations)
