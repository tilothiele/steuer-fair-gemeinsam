# Token-Debug Anleitung

## Problem
401-Fehler beim Profil speichern: "Request failed with status code 401"

## Debugging-Schritte

### 1. Token-Verfügbarkeit prüfen
Öffnen Sie die Browser-Konsole und schauen Sie nach:
```javascript
// Token verfügbar?
console.log('Token:', getToken());

// Token-Inhalt anzeigen
const token = getToken();
if (token) {
  const parts = token.split('.');
  const payload = JSON.parse(atob(parts[1]));
  console.log('Token Payload:', payload);
}
```

### 2. API-Request prüfen
In der Browser-Konsole sollten Sie sehen:
```
Token verfügbar: true
Authorization Header gesetzt
API Request: PUT /api/profile/ihr-username
```

### 3. Debug-Route testen
```bash
# Token-Test (mit curl)
curl -H "Authorization: Bearer IHR_TOKEN" \
     http://localhost:3001/api/profile/debug/token
```

### 4. Keycloak-Konfiguration prüfen
- Realm: `TTSOFT`
- Client: `steuer-fair-web` (public)
- Valid Redirect URIs: `http://localhost:3000/*`
- Web Origins: `http://localhost:3000`

## Temporäre Lösung

Die Profile-Route ist temporär ohne Authentifizierung verfügbar:
- ✅ Profil speichern funktioniert
- ⚠️ Keine Sicherheitsprüfung
- 🔧 TODO: Token-Validierung reparieren

## Nächste Schritte

1. **Token-Debug durchführen**
2. **Keycloak-Konfiguration überprüfen**
3. **Token-Validierung reparieren**
4. **Authentifizierung reaktivieren**

## Mögliche Ursachen

1. **Token abgelaufen** - Neulogin erforderlich
2. **Falsche Client-Konfiguration** - Keycloak-Einstellungen prüfen
3. **CORS-Probleme** - Web Origins prüfen
4. **Token-Format** - JWT-Token-Struktur prüfen
