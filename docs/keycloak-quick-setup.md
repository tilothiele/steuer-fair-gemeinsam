# Keycloak Quick Setup - Iframe Problem beheben

## Problem
Der Fehler "Timeout when waiting for 3rd party check iframe message" tritt auf, wenn Keycloak versucht, eine iframe-basierte SSO-Prüfung durchzuführen, aber die Konfiguration nicht korrekt ist.

## Lösung

### 1. Keycloak Server (bereits verfügbar)

Der Keycloak Server ist bereits unter der folgenden URL verfügbar:
- URL: https://auth.swingdog.home64.de

### 2. Keycloak Admin Console öffnen
- URL: https://auth.swingdog.home64.de
- Login: (Ihre Admin-Credentials)

### 3. Realm erstellen
1. Klicken Sie auf "Create Realm"
2. Realm Name: `TTSOFT`
3. Klicken Sie auf "Create"

### 4. Client erstellen
1. Gehen Sie zu "Clients" → "Create client"
2. Client ID: `steuer-fair-web`
3. Client Protocol: `openid-connect`
4. Klicken Sie auf "Next"
5. Root URL: `http://localhost:3000`
6. Valid redirect URIs: `http://localhost:3000/*`
7. Web Origins: `http://localhost:3000`
8. Klicken Sie auf "Save"

### 5. Benutzer erstellen
1. Gehen Sie zu "Users" → "Add user"
2. Username: `testuser`
3. Email: `test@example.com`
4. Email Verified: `ON`
5. Klicken Sie auf "Save"
6. Gehen Sie zu "Credentials" Tab
7. Password: `password123`
8. Password Confirmation: `password123`
9. Temporary: `OFF`
10. Klicken Sie auf "Set Password"

### 6. Anwendung starten

```bash
# Terminal 1: API
cd apps/api && npm run dev

# Terminal 2: Web App
cd apps/web && npm run dev
```

### 7. Testen
- Öffnen Sie http://localhost:3000
- Sie sollten zur Keycloak-Login-Seite weitergeleitet werden
- Melden Sie sich mit testuser / password123 an

## Konfiguration

Die Umgebungsvariablen sind bereits in den `.env.local` und `.env` Dateien konfiguriert:

### Frontend (.env.local)
```
NEXT_PUBLIC_KEYCLOAK_URL=https://auth.swingdog.home64.de
NEXT_PUBLIC_KEYCLOAK_REALM=TTSOFT
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=steuer-fair-web
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)
```
KEYCLOAK_URL=https://auth.swingdog.home64.de
KEYCLOAK_REALM=TTSOFT
KEYCLOAK_CLIENT_ID=steuer-fair-web
SESSION_SECRET=dev-session-secret-2024
```

## Troubleshooting

### Iframe-Fehler beheben
- Stellen Sie sicher, dass die Web Origins korrekt gesetzt sind
- Verwenden Sie `login-required` statt `check-sso` für die Entwicklung
- Deaktivieren Sie `checkLoginIframe` in der Keycloak-Konfiguration

### CORS-Fehler
- Überprüfen Sie die Web Origins in Keycloak
- Stellen Sie sicher, dass die URLs exakt übereinstimmen

### Token-Fehler
- Überprüfen Sie die Client-Konfiguration
- Stellen Sie sicher, dass die Realm-Namen übereinstimmen
