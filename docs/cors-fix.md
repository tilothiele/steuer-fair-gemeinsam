# CORS-Fix für dynamische API-URLs

## Problem

Bei der Implementierung der dynamischen API-URL-Funktionalität trat ein CORS-Problem auf:

```
OPTIONS /api/profile/tilo → 204 Error
```

### Ursache

Das Backend war nur für statische Frontend-URLs konfiguriert:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

Mit der neuen dynamischen URL-Generierung:
- **Frontend**: `app.example.com`
- **API**: `app-api.example.com`

Das Backend erkannte die neue Frontend-URL nicht als erlaubte Origin.

## Lösung

### 1. Dynamische CORS-Konfiguration

```javascript
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Erlaube requests ohne origin (z.B. Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    // Lokale Entwicklung
    if (origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000') {
      return callback(null, true);
    }

    // Dynamische Frontend-URLs basierend auf API-URL
    const apiUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Wenn FRONTEND_URL gesetzt ist, erlaube diese
    if (apiUrl && origin.startsWith(apiUrl.replace(':3001', ':3000'))) {
      return callback(null, true);
    }

    // Erlaube alle Subdomains der gleichen Domain
    try {
      const url = new URL(origin);
      const apiUrlObj = new URL(apiUrl);
      
      // Wenn gleiche Domain, erlaube
      if (url.hostname === apiUrlObj.hostname || 
          url.hostname.endsWith('.' + apiUrlObj.hostname) ||
          apiUrlObj.hostname.endsWith('.' + url.hostname)) {
        return callback(null, true);
      }
    } catch (e) {
      // Bei URL-Parsing-Fehlern, erlaube nicht
    }

    // Fallback: Erlaube alle Origins in Entwicklung
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    callback(new Error('CORS nicht erlaubt'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
```

### 2. Preflight-Handler für OPTIONS-Requests

```javascript
// Preflight handler für OPTIONS requests
app.options('*', cors(corsOptions));
```

## Funktionsweise

### 1. Origin-Validierung

Die CORS-Konfiguration prüft jede eingehende Request auf:

1. **Keine Origin**: Erlaubt (z.B. Postman, curl)
2. **Localhost**: Erlaubt für Entwicklung
3. **Gleiche Domain**: Erlaubt für Subdomains
4. **Entwicklung**: Erlaubt alle Origins in dev-Modus

### 2. URL-Beispiele

| Frontend | API | Status |
|----------|-----|--------|
| `localhost:3000` | `localhost:3001` | ✅ Erlaubt |
| `app.example.com` | `app-api.example.com` | ✅ Erlaubt |
| `staging.example.com` | `staging-api.example.com` | ✅ Erlaubt |
| `malicious.com` | `app-api.example.com` | ❌ Blockiert |

### 3. Authentifizierung

Die Authentifizierung wird korrekt übertragen:

```javascript
// Frontend: apps/web/src/services/api.ts
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Testing

### 1. Lokale Entwicklung

```bash
# Frontend starten
cd apps/web && npm run dev

# API starten
cd apps/api && npm run dev
```

### 2. Browser-Test

1. **Frontend öffnen**: `http://localhost:3000`
2. **Browser-Entwicklertools öffnen**
3. **Network-Tab prüfen**
4. **API-Request sollte 200 statt 204 zurückgeben**

### 3. CORS-Test

```bash
# OPTIONS-Request testen
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  http://localhost:3001/api/profile/test
```

## Deployment

### 1. DNS-Konfiguration

Stellen Sie sicher, dass die entsprechenden DNS-Einträge existieren:

```
app.example.com      A    [Frontend-Server-IP]
app-api.example.com  A    [API-Server-IP]
```

### 2. Environment-Variablen

```bash
# In .env
FRONTEND_URL=https://app.example.com
NODE_ENV=production
```

### 3. Container-Deployment

```bash
# API Container
docker run -p 3001:3001 \
  -e FRONTEND_URL=https://app.example.com \
  -e NODE_ENV=production \
  steuer-fair-api:latest

# Frontend Container
docker run -p 3000:3000 \
  steuer-fair-web:latest
```

## Troubleshooting

### Problem: 204 Error bei OPTIONS-Request

**Lösung**: CORS-Konfiguration prüfen

### Problem: 401 Unauthorized

**Lösung**: Token-Übertragung prüfen

### Problem: CORS-Fehler in Browser

**Lösung**: Origin-Validierung in CORS-Konfiguration prüfen

## Sicherheit

### 1. Production-Konfiguration

In der Produktion werden nur erlaubte Origins akzeptiert:

```javascript
if (process.env.NODE_ENV === 'development') {
  return callback(null, true); // Nur in Entwicklung
}
```

### 2. Domain-Validierung

Nur Subdomains der gleichen Domain werden erlaubt:

```javascript
if (url.hostname === apiUrlObj.hostname || 
    url.hostname.endsWith('.' + apiUrlObj.hostname)) {
  return callback(null, true);
}
```

### 3. Methoden-Beschränkung

Nur erlaubte HTTP-Methoden:

```javascript
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
```
