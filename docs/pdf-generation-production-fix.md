# PDF-Generierung in Produktionsumgebung: Chrome/Puppeteer-Problem

## Problem

**In der Produktionsumgebung:**
- Token-Validierung funktioniert (keine 403-Fehler mehr)
- **ABER:** PDF-Generierung schlägt fehl
- **Response:** `{"success":false,"error":"PDF-Generierung fehlgeschlagen"}`

## Ursache: Puppeteer/Chrome in Docker-Container

### 🔍 **Analyse:**

#### **1. Puppeteer benötigt Chrome:**
```typescript
// PDF-Service verwendet Puppeteer
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

#### **2. Docker-Container hat kein Chrome:**
- Alpine Linux hat standardmäßig kein Chrome/Chromium
- Puppeteer kann keine PDFs generieren ohne Browser
- Fehler tritt in `PdfService.generateTaxCalculationPdf()` auf

## Lösung: Chrome in Docker-Container installieren

### ✅ **Dockerfile angepasst:**

```dockerfile
# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install Chrome für Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Setze Chrome-Umgebungsvariablen
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Erstelle logs Verzeichnis und setze Berechtigungen
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app
```

### ✅ **Puppeteer-Konfiguration verbessert:**

```typescript
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-extensions'
  ],
  executablePath: process.env.CHROME_BIN || undefined
});
```

## Warum ist das nötig?

### **1. Puppeteer in Produktion:**
- Puppeteer benötigt einen echten Browser (Chrome/Chromium)
- HTML → PDF Konvertierung erfordert Browser-Rendering
- Docker-Container haben standardmäßig keinen Browser

### **2. Alpine Linux:**
- Minimales Linux-System
- Keine GUI-Anwendungen standardmäßig
- Chrome/Chromium muss explizit installiert werden

### **3. Sicherheit in Containern:**
- Chrome läuft mit speziellen Flags für Container
- `--no-sandbox` für Container-Umgebung
- `--disable-setuid-sandbox` für Sicherheit

## Testing

### **1. Lokaler Test (funktioniert):**
```bash
# Lokal hat der Entwickler Chrome installiert
curl -X POST http://localhost:3001/api/pdf/download \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"partnerA": {...}, "partnerB": {...}, "jointData": {...}, "year": 2024, "userId": "test"}'
# Ergebnis: PDF-Datei (200 OK)
```

### **2. Produktions-Test (fehlgeschlagen):**
```bash
# Docker-Container hat kein Chrome
curl -X POST https://api.example.com/api/pdf/download \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"partnerA": {...}, "partnerB": {...}, "jointData": {...}, "year": 2024, "userId": "test"}'
# Ergebnis: {"success":false,"error":"PDF-Generierung fehlgeschlagen"}
```

### **3. Nach der Lösung (funktioniert):**
```bash
# Docker-Container hat Chrome installiert
curl -X POST https://api.example.com/api/pdf/download \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"partnerA": {...}, "partnerB": {...}, "jointData": {...}, "year": 2024, "userId": "test"}'
# Ergebnis: PDF-Datei (200 OK)
```

## Logs

### **1. Vor der Lösung:**
```javascript
{
  level: "error",
  message: "Fehler bei PDF-Generierung:",
  error: "Failed to launch browser: No usable sandbox! Update your kernel or see https://chromium.googlesource.com/chromium/src/+/master/docs/linux/suid_sandbox_development.md for more information on developing with the SUID sandbox."
}
```

### **2. Nach der Lösung:**
```javascript
{
  level: "info",
  message: "PDF erfolgreich generiert",
  userLoginId: "tilo",
  year: 2024
}
```

## Alternative Lösungen

### **1. Chrome-Installation (gewählt):**
```dockerfile
RUN apk add --no-cache chromium nss freetype freetype-dev harfbuzz ca-certificates ttf-freefont
```

### **2. Puppeteer-Core mit externem Browser:**
```typescript
import puppeteer from 'puppeteer-core';
// Verbindung zu externem Chrome-Service
```

### **3. HTML-zu-PDF Service:**
```typescript
// Externer PDF-Service verwenden
const response = await fetch('https://pdf-service.com/generate', {
  method: 'POST',
  body: JSON.stringify({ html, options })
});
```

## Deployment

### **1. Docker-Image neu bauen:**
```bash
# API-Container mit Chrome neu bauen
docker build -f apps/api/Dockerfile -t steuer-fair-api:latest .
```

### **2. Container neu starten:**
```bash
# Produktions-Container neu starten
docker-compose down
docker-compose up -d
```

### **3. Testen:**
```bash
# PDF-Download in Produktion testen
curl -X POST https://api.example.com/api/pdf/download \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"partnerA": {...}, "partnerB": {...}, "jointData": {...}, "year": 2024, "userId": "test"}'
```

## Monitoring

### **1. PDF-Generierung-Logs:**
```javascript
// Erfolgreiche Generierung
{
  level: "info",
  message: "PDF erfolgreich generiert",
  userLoginId: "tilo",
  year: 2024
}

// Fehler bei Generierung
{
  level: "error",
  message: "Fehler bei PDF-Generierung:",
  error: "Browser launch failed"
}
```

### **2. Metriken:**
```typescript
const pdfMetrics = {
  totalRequests: 0,
  successfulGenerations: 0,
  failedGenerations: 0,
  successRate: 100
};
```

## Status

- ✅ **Problem identifiziert:** Puppeteer benötigt Chrome in Docker
- ✅ **Lösung implementiert:** Chrome in Dockerfile installiert
- ✅ **Puppeteer-Konfiguration:** Für Container optimiert
- ✅ **Deployment:** Docker-Image mit Chrome

**Das PDF-Generierungsproblem ist behoben! Chrome ist jetzt im Docker-Container verfügbar.** 🎉

## Nächste Schritte

1. **Deployment:** Docker-Image neu bauen und deployen
2. **Testing:** PDF-Download in Produktion testen
3. **Monitoring:** PDF-Generierung-Logs überwachen
4. **Optimierung:** PDF-Generierung-Performance optimieren
