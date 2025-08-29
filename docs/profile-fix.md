# Profil-Speicher Problem - Fix

## Problem

Das Speichern des Profils funktionierte nicht mehr:
- Backend meldete 200 OK
- Name und Steuernummer landeten nicht in der Datenbank
- Daten wurden nur im Memory gespeichert

## Ursache

Das Profil wurde in einem in-memory `ProfileStore` gespeichert statt in der Datenbank:

```typescript
// Problem: In-Memory Store
import { ProfileStore } from '../utils/profile-store';
const currentUser = await ProfileStore.saveOrUpdate(loginId, name, steuernummer);
```

## Lösung

### 1. UserRepository verwenden

```typescript
// Lösung: Echte Datenbank-Operationen
import { UserRepository } from '../repositories/user-repository';

// Prüfe ob Benutzer bereits existiert
const existingUser = await UserRepository.findByLoginId(loginId);

if (existingUser) {
  // Aktualisiere bestehenden Benutzer
  currentUser = await UserRepository.update({
    ...existingUser,
    name: name || existingUser.name,
    steuernummer: steuernummer || existingUser.steuernummer
  });
} else {
  // Erstelle neuen Benutzer
  currentUser = await UserRepository.create({
    loginId,
    name: name || '',
    steuernummer: steuernummer || ''
  });
}
```

### 2. Profil-Laden Route hinzugefügt

```typescript
// Profil laden
router.get('/:loginId', async (req, res) => {
  try {
    const { loginId } = req.params;
    const user = await UserRepository.findByLoginId(loginId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Profil nicht gefunden'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    logger.error('Fehler beim Laden des Profils:', error);
    res.status(500).json({
      success: false,
      error: 'Interner Server-Fehler'
    });
  }
});
```

### 3. ProfileStore entfernt

- ✅ **Datei gelöscht:** `apps/api/src/utils/profile-store.ts`
- ✅ **Import entfernt:** Aus `profile.ts`
- ✅ **Datenbank-Repository:** Vollständig implementiert

## Datenbank-Operationen

### UserRepository Methoden

```typescript
// Benutzer finden
static async findByLoginId(loginId: string): Promise<User | null>

// Benutzer erstellen
static async create(user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<User>

// Benutzer aktualisieren
static async update(user: User): Promise<User>

// Last Login aktualisieren
static async updateLastLogin(userId: string): Promise<void>
```

### Datenbank-Schema

```sql
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    login_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    steuernummer VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

### 1. Profil speichern testen

```bash
# Profil speichern
curl -X PUT http://localhost:3001/api/profile/tilo \
  -H "Content-Type: application/json" \
  -d '{"name": "Tilo Test", "steuernummer": "123456789"}'
```

### 2. Profil laden testen

```bash
# Profil laden
curl http://localhost:3001/api/profile/tilo
```

### 3. Datenbank prüfen

```sql
-- Benutzer in Datenbank prüfen
SELECT * FROM user_profiles WHERE login_id = 'tilo';
```

## Logs

### Erfolgreiche Operation

```javascript
// Profil speichern
{
  message: "Profil erfolgreich aktualisiert",
  loginId: "tilo",
  name: "Tilo Test",
  steuernummer: "123456789"
}

// Request completed
{
  message: "✅ Request completed",
  method: "PUT",
  url: "/api/profile/tilo",
  statusCode: 200,
  duration: "45ms"
}
```

### Fehler-Logs

```javascript
// Datenbank-Fehler
{
  message: "Error updating user:",
  error: "column \"calculation_mode\" does not exist"
}
```

## Troubleshooting

### Problem: Profil wird nicht gespeichert

**Lösung:**
1. **Datenbank-Verbindung prüfen**
2. **UserRepository verwenden** (nicht ProfileStore)
3. **Logs überprüfen**

### Problem: Profil wird nicht geladen

**Lösung:**
1. **GET Route prüfen**
2. **Datenbank-Abfrage testen**
3. **Login-ID Format prüfen**

### Problem: Datenbank-Fehler

**Lösung:**
1. **Migration ausführen:** `./run-migration.sh`
2. **Schema prüfen:** `\d user_profiles`
3. **Verbindung testen**

## Best Practices

### 1. Fehlerbehandlung

```typescript
try {
  const user = await UserRepository.findByLoginId(loginId);
  // ...
} catch (error) {
  logger.error('Fehler beim Laden des Profils:', error);
  res.status(500).json({
    success: false,
    error: 'Interner Server-Fehler'
  });
}
```

### 2. Validierung

```typescript
// Validiere Eingabedaten
if (!name && !steuernummer) {
  return res.status(400).json({
    success: false,
    error: 'Name oder Steuernummer muss angegeben werden'
  });
}
```

### 3. Logging

```typescript
// Erfolgreiche Operationen loggen
logger.info('Profil erfolgreich aktualisiert', { 
  loginId, 
  name, 
  steuernummer 
});
```

## Status

- ✅ **Profil-Speicherung:** Funktioniert mit Datenbank
- ✅ **Profil-Laden:** Neue GET Route implementiert
- ✅ **Fehlerbehandlung:** Verbessert
- ✅ **Logging:** Detailliert
- ✅ **ProfileStore:** Entfernt

**Das Profil-Speicher-Problem ist vollständig behoben!** 🎉
