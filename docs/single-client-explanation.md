# Warum nur ein Client benötigt wird

## Einfache Architektur

Für die Steuer-Fair-Anwendung benötigen wir nur **einen Client** (`steuer-fair-web`), weil:

### 1. **Frontend und Backend teilen sich den gleichen Client**
- Das Frontend (Next.js) verwendet den Client für die Benutzeranmeldung
- Das Backend (Express.js) validiert die Token vom gleichen Client
- Beide verwenden die gleichen Keycloak-Einstellungen

### 2. **Token-basierte Authentifizierung**
- Der Benutzer meldet sich über das Frontend an
- Keycloak gibt einen JWT-Token aus
- Das Frontend sendet diesen Token an das Backend
- Das Backend validiert den Token mit Keycloak

### 3. **Keine separaten Berechtigungen nötig**
- Alle API-Endpunkte sind für angemeldete Benutzer zugänglich
- Keine komplexe Rollenverwaltung erforderlich
- Einfache Authentifizierung reicht aus

## Wann würden zwei Clients benötigt?

Zwei Clients wären nötig, wenn:

- **Service-to-Service Kommunikation**: Backend ruft andere Services auf
- **Verschiedene Berechtigungen**: Frontend und Backend haben unterschiedliche Rollen
- **Microservices**: Verschiedene Services mit eigenen Clients
- **Admin-Funktionen**: Separate Admin-Bereiche mit anderen Berechtigungen

## Vorteile der Ein-Client-Lösung

✅ **Einfacher zu konfigurieren**
✅ **Weniger Verwaltungsaufwand**
✅ **Geringere Komplexität**
✅ **Schnellerer Setup**
✅ **Einfacheres Debugging**

## Konfiguration

```bash
# Nur ein Client in Keycloak:
Client ID: steuer-fair-web
Access Type: public
Valid Redirect URIs: http://localhost:3000/*
Web Origins: http://localhost:3000
```

```bash
# Frontend (.env.local)
NEXT_PUBLIC_KEYCLOAK_URL=https://auth.swingdog.home64.de
NEXT_PUBLIC_KEYCLOAK_REALM=TTSOFT
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=steuer-fair-web

# Backend (.env)
KEYCLOAK_URL=https://auth.swingdog.home64.de
KEYCLOAK_REALM=TTSOFT
KEYCLOAK_CLIENT_ID=steuer-fair-web
```

Diese Lösung ist perfekt für Ihre Anwendung und reduziert die Komplexität erheblich!
