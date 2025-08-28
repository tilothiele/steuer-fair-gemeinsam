# Keycloak Integration Setup

Diese Anleitung beschreibt die Einrichtung der Keycloak-Integration für die Steuer-Fair-Gemeinsam Anwendung.

## Voraussetzungen

- Keycloak Server (Version 21+ empfohlen)
- Node.js 20+
- PostgreSQL Datenbank

## Keycloak Server Setup

### 1. Keycloak Installation

```bash
# Docker Installation (empfohlen)
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:21.1.2 start-dev
```

### 2. Realm erstellen

1. Öffnen Sie die Keycloak Admin Console: http://localhost:8080
2. Melden Sie sich mit admin/admin an
3. Erstellen Sie einen neuen Realm: "steuer-fair"

### 3. Clients erstellen

#### Web Client (steuer-fair-web)
- Client ID: `steuer-fair-web`
- Client Protocol: `openid-connect`
- Access Type: `public`
- Valid Redirect URIs: `http://localhost:3000/*`
- Web Origins: `http://localhost:3000`

#### API Client (steuer-fair-api)
- Client ID: `steuer-fair-api`
- Client Protocol: `openid-connect`
- Access Type: `confidential`
- Service Accounts Enabled: `ON`
- Valid Redirect URIs: `http://localhost:3001/*`

### 4. Benutzer erstellen

1. Gehen Sie zu "Users" → "Add user"
2. Erstellen Sie Testbenutzer mit E-Mail und Passwort
3. Setzen Sie "Email Verified" auf "ON"

### 5. Rollen definieren

Erstellen Sie folgende Rollen im Realm:
- `user` - Standardbenutzerrolle
- `admin` - Administratorrolle

## Anwendungskonfiguration

### 1. Umgebungsvariablen

Kopieren Sie `env.example` zu `.env` und passen Sie die Werte an:

```bash
# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=steuer-fair
KEYCLOAK_CLIENT_ID=steuer-fair-api
SESSION_SECRET=your-session-secret-here

# Frontend Keycloak Configuration
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=steuer-fair
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=steuer-fair-web
```

### 2. Dependencies installieren

```bash
# Web App
cd apps/web
npm install keycloak-js

# API
cd apps/api
npm install keycloak-connect express-session
```

## Funktionsweise

### Frontend (Next.js)

1. **Initialisierung**: Keycloak wird beim App-Start initialisiert
2. **SSO Check**: Automatische Überprüfung bestehender Sessions
3. **Login**: Weiterleitung zur Keycloak-Login-Seite
4. **Token Management**: Automatische Token-Erneuerung
5. **API Calls**: Token wird automatisch zu API-Anfragen hinzugefügt

### Backend (Express.js)

1. **Session Management**: Express-Session für Session-Handling
2. **Token Validation**: Middleware zur Token-Validierung
3. **User Extraction**: Benutzerinformationen aus Token extrahieren
4. **Role-based Access**: Rollenbasierte Zugriffskontrolle

## Sicherheitsfeatures

- **PKCE**: Proof Key for Code Exchange für sichere OAuth-Flows
- **Token Validation**: Server-seitige Token-Validierung
- **Session Management**: Sichere Session-Verwaltung
- **CORS**: Cross-Origin Resource Sharing konfiguriert
- **Rate Limiting**: Schutz vor DDoS-Angriffen

## Troubleshooting

### Häufige Probleme

1. **CORS-Fehler**: Überprüfen Sie die Web Origins in Keycloak
2. **Token-Validierung fehlgeschlagen**: Überprüfen Sie die Client-Konfiguration
3. **Session-Probleme**: Überprüfen Sie die Session-Secret-Konfiguration

### Debugging

```bash
# Keycloak Logs
docker logs <keycloak-container>

# API Logs
cd apps/api && npm run dev

# Frontend Logs
cd apps/web && npm run dev
```

## Migration von der alten Authentifizierung

Die alte Login-ID-basierte Authentifizierung wurde vollständig durch Keycloak ersetzt:

- ✅ Benutzerauthentifizierung über Keycloak
- ✅ Token-basierte API-Authentifizierung
- ✅ Rollenbasierte Zugriffskontrolle
- ✅ Sichere Session-Verwaltung
- ✅ SSO-Unterstützung

## Nächste Schritte

1. Keycloak Server einrichten
2. Umgebungsvariablen konfigurieren
3. Anwendung starten und testen
4. Benutzer und Rollen in Keycloak erstellen
5. Produktionsumgebung konfigurieren
