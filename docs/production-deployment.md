# Produktions-Deployment - Troubleshooting

## Übersicht

Dieses Dokument beschreibt häufige Probleme bei Produktions-Deployments und deren Lösungen.

## Bekannte Probleme und Lösungen

### 1. Rate Limiting Error

**Problem:**
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

**Ursache:** Express erkennt die echte Client-IP nicht korrekt hinter einem Proxy/Load Balancer.

**Lösung:**
```typescript
// apps/api/src/index.ts
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
```

**Status:** ✅ Behoben

### 2. Favicon wird nicht angezeigt

**Problem:** Favicon erscheint nicht im Browser-Tab.

**Ursache:** 
- Falsche Datei-Referenz
- Fehlende Favicon-Datei
- Cache-Probleme

**Lösung:**
```typescript
// apps/web/src/app/layout.tsx
export const metadata: Metadata = {
  icons: {
    icon: '/favicon.svg',        // SVG-Favicon
    shortcut: '/favicon.svg',    // Shortcut-Icon
    apple: '/icon.svg',          // Apple-Touch-Icon
  },
};
```

**Dateien:**
- `apps/web/public/favicon.svg` - SVG-Favicon
- `apps/web/public/icon.svg` - App-Icon

**Status:** ✅ Behoben

### 3. Logo wird nicht angezeigt (Broken Link)

**Problem:** Logo erscheint als broken link.

**Ursache:**
- Falsche SVG-Struktur
- Fehlende Datei
- CORS-Probleme

**Lösung:**
```typescript
// apps/web/src/components/UI/Logo.tsx
export default function Logo({ className = '', darkMode = false }: LogoProps) {
  const logoSrc = darkMode ? '/logo-dark.svg' : '/logo.svg';
  
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={logoSrc}
        alt="Steuer-Fair Logo"
        width={200}
        height={60}
        className="h-auto w-auto"
        priority
      />
    </div>
  );
}
```

**Dateien:**
- `apps/web/public/logo.svg` - Hauptlogo (helles Theme)
- `apps/web/public/logo-dark.svg` - Logo (dunkles Theme)

**Status:** ✅ Behoben

## Deployment-Checkliste

### Vor dem Deployment

- [ ] **Node.js Version:** Node.js 20 verwenden
- [ ] **Environment Variables:** Alle erforderlichen Variablen setzen
- [ ] **Dependencies:** Alle Packages installiert
- [ ] **Build:** Anwendung erfolgreich gebaut
- [ ] **Tests:** Alle Tests bestanden

### Nach dem Deployment

- [ ] **Health Check:** `/health` Endpoint erreichbar
- [ ] **Frontend:** Anwendung lädt korrekt
- [ ] **Backend:** API-Endpoints funktionieren
- [ ] **Logos:** Alle Logos werden angezeigt
- [ ] **Favicon:** Browser-Tab-Icon sichtbar
- [ ] **Rate Limiting:** Keine Proxy-Fehler
- [ ] **CORS:** Frontend kann Backend erreichen

## Environment Variables

### Frontend (.env)
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NODE_ENV=production
```

### Backend (.env)
```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
SESSION_SECRET=your-secret-key
KEYCLOAK_REALM=TTSOFT
KEYCLOAK_URL=https://auth.swingdog.home64.de
KEYCLOAK_CLIENT_ID=steuer-fair-web
```

## Docker Deployment

### Frontend Container
```bash
docker run -d \
  --name steuer-fair-web \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=https://your-api-domain.com \
  steuer-fair-web:latest
```

### Backend Container
```bash
docker run -d \
  --name steuer-fair-api \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e FRONTEND_URL=https://your-frontend-domain.com \
  -e SESSION_SECRET=your-secret-key \
  steuer-fair-api:latest
```

## Monitoring und Logging

### 1. Container-Logs überwachen
```bash
# Frontend-Logs
docker logs -f steuer-fair-web

# Backend-Logs
docker logs -f steuer-fair-api
```

### 2. Health Checks
```bash
# Frontend Health Check
curl https://your-frontend-domain.com

# Backend Health Check
curl https://your-api-domain.com/health
```

### 3. Error Monitoring
```bash
# 500-Fehler überwachen
docker logs steuer-fair-api | grep "🚨 SERVER ERROR"

# Rate Limiting überwachen
docker logs steuer-fair-api | grep "Rate limit exceeded"
```

## Troubleshooting

### Problem: Container startet nicht

**Lösung:**
```bash
# Container-Logs prüfen
docker logs steuer-fair-api

# Container neu starten
docker restart steuer-fair-api
```

### Problem: CORS-Fehler

**Lösung:**
```bash
# CORS-Konfiguration prüfen
# apps/api/src/index.ts - corsOptions

# Frontend-URL in Backend setzen
docker run -e FRONTEND_URL=https://your-frontend-domain.com steuer-fair-api:latest
```

### Problem: Keycloak-Authentifizierung funktioniert nicht

**Lösung:**
```bash
# Keycloak-Konfiguration prüfen
docker run -e \
  KEYCLOAK_REALM=TTSOFT \
  KEYCLOAK_URL=https://auth.swingdog.home64.de \
  KEYCLOAK_CLIENT_ID=steuer-fair-web \
  steuer-fair-api:latest
```

### Problem: Rate Limiting zu strikt

**Lösung:**
```typescript
// apps/api/src/index.ts
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 200, // Erhöhen von 100 auf 200
  // ...
});
```

## Performance-Optimierung

### 1. Container-Ressourcen
```bash
# Memory-Limits setzen
docker run --memory=512m steuer-fair-api:latest
docker run --memory=1g steuer-fair-web:latest
```

### 2. Caching
```bash
# Redis für Session-Store
docker run -d --name redis redis:alpine
```

### 3. Load Balancing
```bash
# Nginx als Reverse Proxy
docker run -d --name nginx nginx:alpine
```

## Sicherheit

### 1. HTTPS erzwingen
```typescript
// apps/api/src/index.ts
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 2. Security Headers
```typescript
// apps/api/src/index.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
}));
```

### 3. Rate Limiting
```typescript
// Strikte Rate Limits für sensible Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Nur 5 Login-Versuche pro 15 Minuten
});
app.use('/api/auth', authLimiter);
```

## Backup und Recovery

### 1. Datenbank-Backup
```bash
# PostgreSQL Backup
pg_dump -h your-db-host -U your-user your-database > backup.sql
```

### 2. Container-Backup
```bash
# Container-Images exportieren
docker save steuer-fair-web:latest > web-backup.tar
docker save steuer-fair-api:latest > api-backup.tar
```

### 3. Environment-Backup
```bash
# Environment-Variablen sichern
docker inspect steuer-fair-api | grep -A 20 "Env"
```

## Support und Debugging

### 1. Debug-Modus aktivieren
```bash
# Development-Modus für Debugging
docker run -e NODE_ENV=development steuer-fair-api:latest
```

### 2. Log-Level anpassen
```bash
# Detaillierte Logs
docker run -e LOG_LEVEL=debug steuer-fair-api:latest
```

### 3. Remote Debugging
```bash
# Node.js Debug-Port öffnen
docker run -p 9229:9229 steuer-fair-api:latest
```
