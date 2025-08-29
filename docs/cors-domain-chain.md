# CORS-Regel: Domain-Kette statt Subdomain

## Problem

Die ursprüngliche CORS-Regel erlaubte nur Subdomains der gleichen Domain:

```javascript
// Alte Regel: Nur Subdomains der gleichen Domain
if (url.hostname === apiUrlObj.hostname || 
    url.hostname.endsWith('.' + apiUrlObj.hostname) ||
    apiUrlObj.hostname.endsWith('.' + url.hostname)) {
  return callback(null, true);
}
```

**Beispiel:**
- **API**: `app-api.example.com`
- **Frontend**: `app.example.com` ✅ Erlaubt
- **Frontend**: `staging.example.com` ❌ Nicht erlaubt (falsche Domain)

## Lösung

Neue CORS-Regel basierend auf Domain-Ketten:

```javascript
// Neue Regel: Alle Origins mit gleicher Domain-Kette
const getDomainChain = (hostname: string) => {
  const parts = hostname.split('.');
  return parts.length > 1 ? parts.slice(1).join('.') : hostname;
};

const originDomainChain = getDomainChain(url.hostname);
const apiDomainChain = getDomainChain(apiUrlObj.hostname);

if (originDomainChain === apiDomainChain) {
  return callback(null, true);
}
```

## Funktionsweise

### 1. Domain-Kette extrahieren

Die Funktion `getDomainChain()` extrahiert alles nach dem ersten Punkt:

```javascript
getDomainChain('app-api.example.com')     // → 'example.com'
getDomainChain('staging-api.example.com') // → 'example.com'
getDomainChain('app.example.com')         // → 'example.com'
getDomainChain('staging.example.com')     // → 'example.com'
```

### 2. Vergleich der Domain-Ketten

| API Server | Frontend | Domain-Kette | Status |
|------------|----------|--------------|--------|
| `app-api.example.com` | `app.example.com` | `example.com` | ✅ Erlaubt |
| `app-api.example.com` | `staging.example.com` | `example.com` | ✅ Erlaubt |
| `app-api.example.com` | `dev.example.com` | `example.com` | ✅ Erlaubt |
| `app-api.example.com` | `malicious.com` | `com` | ❌ Blockiert |

## Beispiele

### Beispiel 1: Einfache Domain
```
API:     app-api.example.com
Frontend: app.example.com
         ↑
Domain-Kette: example.com (übereinstimmend)
Status: ✅ Erlaubt
```

### Beispiel 2: Verschiedene Subdomains
```
API:     staging-api.example.com
Frontend: production.example.com
         ↑
Domain-Kette: example.com (übereinstimmend)
Status: ✅ Erlaubt
```

### Beispiel 3: Verschiedene Domains
```
API:     app-api.example.com
Frontend: app.malicious.com
         ↑
Domain-Kette: example.com vs malicious.com (unterschiedlich)
Status: ❌ Blockiert
```

### Beispiel 4: Komplexe Domain-Kette
```
API:     api.app.example.co.uk
Frontend: web.staging.example.co.uk
         ↑
Domain-Kette: app.example.co.uk vs staging.example.co.uk (unterschiedlich)
Status: ❌ Blockiert
```

## Vorteile

### 1. Flexibilität
- ✅ **Alle Subdomains** der gleichen Domain-Kette erlaubt
- ✅ **Staging/Production** Umgebungen möglich
- ✅ **Entwicklung** auf verschiedenen Subdomains

### 2. Sicherheit
- ✅ **Domain-Isolation** zwischen verschiedenen Domains
- ✅ **Keine Cross-Domain** Requests
- ✅ **Kontrollierte** Zugriffe

### 3. Skalierbarkeit
- ✅ **Mehrere Umgebungen** auf gleicher Domain
- ✅ **Einfache Konfiguration** für neue Subdomains
- ✅ **Keine harte Codierung** von Domain-Namen

## Debugging

Die CORS-Konfiguration enthält Debug-Logs:

```javascript
console.log('url', url);
console.log('apiUrlObj', apiUrlObj);
console.log('originDomainChain', originDomainChain);
console.log('apiDomainChain', apiDomainChain);
console.log('Same domain chain');
```

### Log-Beispiel
```
url URL { hostname: 'app.example.com', ... }
apiUrlObj URL { hostname: 'app-api.example.com', ... }
originDomainChain example.com
apiDomainChain example.com
Same domain chain
```

## Konfiguration

### Environment-Variablen
```bash
# API Server URL
FRONTEND_URL=https://app.example.com

# Session Secret
SESSION_SECRET=your-secret-key

# Environment
NODE_ENV=production
```

### Docker Deployment
```bash
docker run -p 3001:3001 \
  -e FRONTEND_URL=https://app.example.com \
  -e NODE_ENV=production \
  steuer-fair-api:latest
```

## Testing

### 1. Lokale Entwicklung
```bash
# API starten
cd apps/api && npm run dev

# Frontend starten
cd apps/web && npm run dev
```

### 2. CORS-Test
```bash
# Erlaubte Domain
curl -X OPTIONS http://localhost:3001/api/profile/test \
  -H "Origin: http://app.example.com" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

# Nicht erlaubte Domain
curl -X OPTIONS http://localhost:3001/api/profile/test \
  -H "Origin: http://malicious.com" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
```

## Troubleshooting

### Problem: CORS-Fehler trotz gleicher Domain-Kette

**Lösung**: Debug-Logs prüfen
```bash
# API-Logs anzeigen
docker logs steuer-fair-api
```

### Problem: Domain-Kette wird nicht erkannt

**Lösung**: URL-Format prüfen
```javascript
// Korrekt: app-api.example.com
// Falsch: app-api.example.com:3001
```

### Problem: Lokale Entwicklung funktioniert nicht

**Lösung**: Localhost-Regel prüfen
```javascript
if (origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000') {
  return callback(null, true);
}
```
