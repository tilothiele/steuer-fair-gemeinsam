# Dynamische API-URL-Konfiguration

## Übersicht

Die API-URL wird jetzt dynamisch basierend auf der aktuellen URL ermittelt, anstatt zur Build-Zeit festgelegt zu werden. Dies ermöglicht flexible Deployments ohne Container-Neubuilds.

## Funktionsweise

### 1. Priorität der URL-Ermittlung

1. **NEXT_PUBLIC_API_URL** (falls definiert)
2. **Dynamische URL-Generierung** basierend auf der aktuellen URL
3. **Fallback**: `http://localhost:3001`

### 2. URL-Parsing-Logik

Die Funktion `getApiBaseUrl()` analysiert die aktuelle URL nach folgendem Schema:

```
<servername>.<domain>.<tld> → <servername>-api.<domain>.<tld>
```

#### Beispiele:

| Aktuelle URL | API-URL |
|--------------|---------|
| `app.example.com` | `app-api.example.com` |
| `web.mydomain.de` | `web-api.mydomain.de` |
| `frontend.sub.domain.org` | `frontend-api.sub.domain.org` |
| `localhost` | `http://localhost:3001` |
| `127.0.0.1` | `http://localhost:3001` |

### 3. Protokoll und Port

- **Protokoll**: Wird von der aktuellen Seite übernommen (http/https)
- **Port**: Wird von der aktuellen Seite übernommen (falls vorhanden)

## Implementierung

### Code-Location
```typescript
// apps/web/src/services/api.ts
function getApiBaseUrl(): string {
  // Implementierung siehe Datei
}
```

### Verwendung
```typescript
import { apiClient, getApiBaseUrl } from '../services/api';

// API-Client verwendet automatisch die dynamische URL
const response = await apiClient.get('/api/health');

// Manuelle URL-Ermittlung
const apiUrl = getApiBaseUrl();
console.log('API URL:', apiUrl);
```

## Deployment-Szenarien

### 1. Lokale Entwicklung
```
Frontend: http://localhost:3000
API: http://localhost:3001
```

### 2. Staging-Umgebung
```
Frontend: https://staging.example.com
API: https://staging-api.example.com
```

### 3. Produktionsumgebung
```
Frontend: https://app.example.com
API: https://app-api.example.com
```

### 4. Custom API-URL (Override)
```bash
# In .env.local oder .env
NEXT_PUBLIC_API_URL=https://custom-api.example.com
```

**Hinweis**: Die `next.config.js` verwendet keine statische API-URL mehr. Alle API-Calls gehen direkt an die dynamisch ermittelte URL.

## Vorteile

1. **Flexible Deployments**: Keine Container-Neubuilds bei URL-Änderungen
2. **Automatische Konfiguration**: API-URL wird automatisch ermittelt
3. **Fallback-Mechanismus**: Robuste Fehlerbehandlung
4. **Override-Möglichkeit**: Manuelle URL-Konfiguration möglich

## DNS-Konfiguration

Stellen Sie sicher, dass die entsprechenden DNS-Einträge für die API-Subdomains existieren:

```
# Beispiel DNS-Einträge
app-api.example.com    A    192.168.1.100
staging-api.example.com A   192.168.1.101
```

## Troubleshooting

### Problem: API nicht erreichbar
1. Prüfen Sie die generierte API-URL in der Browser-Konsole
2. Stellen Sie sicher, dass die DNS-Einträge korrekt sind
3. Überprüfen Sie die Firewall-Konfiguration

### Problem: Falsche API-URL
1. Setzen Sie `NEXT_PUBLIC_API_URL` in `.env.local` für manuelle Konfiguration
2. Prüfen Sie die URL-Parsing-Logik für Ihre spezifische Domain-Struktur

### Debugging
```javascript
// In der Browser-Konsole
console.log('Current URL:', window.location.hostname);
console.log('API URL:', getApiBaseUrl());
```
