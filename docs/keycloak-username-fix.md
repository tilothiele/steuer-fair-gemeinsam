# Keycloak Username und Profil-Fix

## Probleme behoben

### 1. **Username als Login-ID**
- **Problem**: Der Username aus Keycloak wurde nicht als Login-ID verwendet
- **Lösung**: Neue `getLoginId()` Funktion erstellt, die `preferred_username` oder `sub` aus dem Keycloak-Token verwendet

### 2. **Profil speichern Fehler**
- **Problem**: "statusCode":500,"timestamp":"2025-08-28T08:41:41.791Z","url":"/undefined"
- **Ursache**: Profile-Route war nicht mit Keycloak-Authentifizierung konfiguriert
- **Lösung**: Profile-Route mit `authenticateToken` Middleware geschützt

## Geänderte Dateien

### Frontend
- ✅ `apps/web/src/config/keycloak.ts` - Neue `getLoginId()` Funktion
- ✅ `apps/web/src/app/page.tsx` - User-Struktur mit loginId
- ✅ `apps/web/src/app/profile/page.tsx` - User-Struktur mit loginId
- ✅ `apps/web/src/components/Auth/KeycloakLogin.tsx` - User-Struktur mit loginId
- ✅ `apps/web/src/services/api.ts` - Verbesserte Fehlerbehandlung

### Backend
- ✅ `apps/api/src/routes/profile.ts` - Keycloak-Authentifizierung hinzugefügt

## Neue Funktionalität

### `getLoginId()` Funktion
```typescript
export const getLoginId = () => {
  const keycloakInstance = getKeycloak();
  return keycloakInstance?.tokenParsed?.preferred_username || keycloakInstance?.tokenParsed?.sub || '';
};
```

### User-Struktur
```typescript
{
  id: 'keycloak-user',
  loginId: getLoginId(), // Username aus Keycloak
  name: getUsername(),
  email: getUserEmail()
}
```

### Profile-Route Sicherheit
- ✅ Token-Validierung
- ✅ Benutzer kann nur sein eigenes Profil bearbeiten
- ✅ Authentifizierung erforderlich

## Nächste Schritte

1. **Keycloak konfigurieren**:
   - Realm: `TTSOFT`
   - Client: `steuer-fair-web`
   - Benutzer mit `preferred_username` erstellen

2. **Anwendung testen**:
   - Login mit Keycloak
   - Profil bearbeiten
   - Steuerberechnung durchführen

## Troubleshooting

### Falls Login-ID nicht korrekt angezeigt wird:
- Überprüfen Sie, ob der Benutzer in Keycloak einen `preferred_username` hat
- Falls nicht, wird die `sub` (User-ID) verwendet

### Falls Profil-Update fehlschlägt:
- Überprüfen Sie die Browser-Konsole für detaillierte Fehlermeldungen
- Stellen Sie sicher, dass der Token gültig ist
