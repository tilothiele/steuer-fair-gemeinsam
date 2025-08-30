# Verbesserte PDF-Fehlermeldungen

## Problem

**Vorher:** Unklare Fehlermeldungen bei PDF-Generierung
```json
{
  "success": false,
  "error": "PDF-Generierung fehlgeschlagen"
}
```

**Nachher:** Aussagekräftige, detaillierte Fehlermeldungen
```json
{
  "success": false,
  "error": "Chrome-Browser konnte nicht gestartet werden",
  "details": "Der PDF-Generator benötigt Chrome/Chromium, das möglicherweise nicht installiert ist oder nicht gestartet werden kann.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "abc123"
}
```

## Implementierte Fehlermeldungen

### 🔍 **Chrome/Browser-Fehler:**

#### **1. Browser-Start-Fehler:**
```json
{
  "success": false,
  "error": "Chrome-Browser konnte nicht gestartet werden",
  "details": "Der PDF-Generator benötigt Chrome/Chromium, das möglicherweise nicht installiert ist oder nicht gestartet werden kann."
}
```

#### **2. Sandbox-Probleme:**
```json
{
  "success": false,
  "error": "Chrome-Sandbox-Probleme",
  "details": "Chrome kann nicht im Sandbox-Modus gestartet werden. Dies ist ein bekanntes Problem in Docker-Containern."
}
```

#### **3. Executable nicht gefunden:**
```json
{
  "success": false,
  "error": "Chrome-Executable nicht gefunden",
  "details": "Der Chrome-Browser wurde nicht gefunden. Bitte stellen Sie sicher, dass Chrome/Chromium installiert ist."
}
```

### 💾 **Resource-Fehler:**

#### **1. Memory-Probleme:**
```json
{
  "success": false,
  "error": "Nicht genügend Speicher für PDF-Generierung",
  "details": "Der Server hat nicht genügend Speicher, um die PDF zu generieren."
}
```

### ⏱️ **Timeout-Fehler:**

#### **1. Generierung zu langsam:**
```json
{
  "success": false,
  "error": "PDF-Generierung hat zu lange gedauert",
  "details": "Die PDF-Generierung wurde wegen eines Timeouts abgebrochen."
}
```

### 🌐 **Netzwerk-Fehler:**

#### **1. Verbindungsprobleme:**
```json
{
  "success": false,
  "error": "Netzwerk-Fehler bei PDF-Generierung",
  "details": "Es gab ein Problem mit der Netzwerkverbindung während der PDF-Generierung."
}
```

### 🔧 **Puppeteer-Fehler:**

#### **1. Allgemeine Puppeteer-Probleme:**
```json
{
  "success": false,
  "error": "Puppeteer-Fehler bei PDF-Generierung",
  "details": "Es gab ein Problem mit dem PDF-Generator (Puppeteer)."
}
```

### ❓ **Unbekannte Fehler:**

#### **1. Unerwartete Probleme:**
```json
{
  "success": false,
  "error": "Unbekannter Fehler bei PDF-Generierung",
  "details": "Unerwarteter Fehler: [Original-Fehlermeldung]"
}
```

## Implementierung

### **1. PdfService - Detaillierte Fehleranalyse:**

```typescript
} catch (error) {
  // Detaillierte Fehleranalyse für bessere Diagnose
  let errorMessage = 'PDF-Generierung fehlgeschlagen';
  let errorDetails = '';

  if (error instanceof Error) {
    const errorStr = error.message.toLowerCase();

    // Chrome/Browser-spezifische Fehler
    if (errorStr.includes('chrome') || errorStr.includes('chromium') || errorStr.includes('browser')) {
      if (errorStr.includes('launch') || errorStr.includes('start')) {
        errorMessage = 'Chrome-Browser konnte nicht gestartet werden';
        errorDetails = 'Der PDF-Generator benötigt Chrome/Chromium, das möglicherweise nicht installiert ist oder nicht gestartet werden kann.';
      } else if (errorStr.includes('sandbox')) {
        errorMessage = 'Chrome-Sandbox-Probleme';
        errorDetails = 'Chrome kann nicht im Sandbox-Modus gestartet werden. Dies ist ein bekanntes Problem in Docker-Containern.';
      } else if (errorStr.includes('executable') || errorStr.includes('path')) {
        errorMessage = 'Chrome-Executable nicht gefunden';
        errorDetails = 'Der Chrome-Browser wurde nicht gefunden. Bitte stellen Sie sicher, dass Chrome/Chromium installiert ist.';
      }
    }
    // Memory/Resource-Fehler
    else if (errorStr.includes('memory') || errorStr.includes('out of memory')) {
      errorMessage = 'Nicht genügend Speicher für PDF-Generierung';
      errorDetails = 'Der Server hat nicht genügend Speicher, um die PDF zu generieren.';
    }
    // Timeout-Fehler
    else if (errorStr.includes('timeout') || errorStr.includes('timed out')) {
      errorMessage = 'PDF-Generierung hat zu lange gedauert';
      errorDetails = 'Die PDF-Generierung wurde wegen eines Timeouts abgebrochen.';
    }
    // Netzwerk-Fehler
    else if (errorStr.includes('network') || errorStr.includes('connection')) {
      errorMessage = 'Netzwerk-Fehler bei PDF-Generierung';
      errorDetails = 'Es gab ein Problem mit der Netzwerkverbindung während der PDF-Generierung.';
    }
    // Allgemeine Puppeteer-Fehler
    else if (errorStr.includes('puppeteer') || errorStr.includes('page')) {
      errorMessage = 'Puppeteer-Fehler bei PDF-Generierung';
      errorDetails = 'Es gab ein Problem mit dem PDF-Generator (Puppeteer).';
    }
    // Unbekannte Fehler
    else {
      errorMessage = 'Unbekannter Fehler bei PDF-Generierung';
      errorDetails = `Unerwarteter Fehler: ${error.message}`;
    }
  }

  // Logging mit detaillierten Informationen
  logger.error('Fehler bei PDF-Generierung:', {
    error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    stack: error instanceof Error ? error.stack : undefined,
    userLoginId,
    year,
    errorMessage,
    errorDetails
  });

  // Erstelle strukturierte Fehlermeldung
  const structuredError = new Error(errorMessage);
  (structuredError as any).details = errorDetails;
  (structuredError as any).originalError = error instanceof Error ? error.message : 'Unbekannter Fehler';
  (structuredError as any).userLoginId = userLoginId;
  (structuredError as any).year = year;

  throw structuredError;
}
```

### **2. PDF-Route - Client-Fehlermeldungen:**

```typescript
} catch (error) {
  logger.error('Fehler beim PDF-Download:', error);

  // Strukturierte Fehlermeldung für den Client
  let clientError = 'PDF-Generierung fehlgeschlagen';
  let clientDetails = '';

  if (error instanceof Error) {
    // Verwende die detaillierte Fehlermeldung aus dem PdfService
    if ((error as any).details) {
      clientError = error.message;
      clientDetails = (error as any).details;
    } else {
      // Fallback für andere Fehler
      const errorStr = error.message.toLowerCase();
      if (errorStr.includes('chrome') || errorStr.includes('browser')) {
        clientError = 'PDF-Generator nicht verfügbar';
        clientDetails = 'Der PDF-Generator ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.';
      } else if (errorStr.includes('timeout')) {
        clientError = 'PDF-Generierung hat zu lange gedauert';
        clientDetails = 'Die PDF-Generierung wurde wegen eines Timeouts abgebrochen. Bitte versuchen Sie es erneut.';
      } else if (errorStr.includes('memory')) {
        clientError = 'Server überlastet';
        clientDetails = 'Der Server ist derzeit überlastet. Bitte versuchen Sie es später erneut.';
      } else {
        clientError = 'PDF-Generierung fehlgeschlagen';
        clientDetails = 'Es gab ein unerwartetes Problem bei der PDF-Generierung.';
      }
    }
  }

  res.status(500).json({
    success: false,
    error: clientError,
    details: clientDetails,
    timestamp: new Date().toISOString(),
    requestId: (req as any).requestId || 'unknown'
  });
}
```

## Logs

### **1. Detaillierte Server-Logs:**

```javascript
{
  level: "error",
  message: "Fehler bei PDF-Generierung:",
  error: "Failed to launch browser: No usable sandbox!",
  stack: "Error: Failed to launch browser...",
  userLoginId: "tilo",
  year: 2024,
  errorMessage: "Chrome-Sandbox-Probleme",
  errorDetails: "Chrome kann nicht im Sandbox-Modus gestartet werden. Dies ist ein bekanntes Problem in Docker-Containern."
}
```

### **2. Client-Response:**

```json
{
  "success": false,
  "error": "Chrome-Sandbox-Probleme",
  "details": "Chrome kann nicht im Sandbox-Modus gestartet werden. Dies ist ein bekanntes Problem in Docker-Containern.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "abc123"
}
```

## Vorteile

### ✅ **Für Entwickler:**
- Detaillierte Fehleranalyse in Logs
- Einfache Diagnose von Problemen
- Strukturierte Fehlerinformationen

### ✅ **Für Benutzer:**
- Verständliche Fehlermeldungen
- Konkrete Handlungsempfehlungen
- Transparente Fehlerkommunikation

### ✅ **Für Support:**
- Spezifische Fehlerkategorien
- Reproduzierbare Fehlerinformationen
- Request-ID für Tracking

## Testing

### **1. Chrome-Start-Fehler simulieren:**
```bash
# Chrome nicht installiert
curl -X POST http://localhost:3001/api/pdf/download \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"partnerA": {...}, "partnerB": {...}, "jointData": {...}, "year": 2024, "userId": "test"}'

# Erwartete Response:
{
  "success": false,
  "error": "Chrome-Browser konnte nicht gestartet werden",
  "details": "Der PDF-Generator benötigt Chrome/Chromium, das möglicherweise nicht installiert ist oder nicht gestartet werden kann.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "abc123"
}
```

### **2. Memory-Fehler simulieren:**
```bash
# Server mit wenig Memory
# Erwartete Response:
{
  "success": false,
  "error": "Nicht genügend Speicher für PDF-Generierung",
  "details": "Der Server hat nicht genügend Speicher, um die PDF zu generieren.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "abc123"
}
```

## Status

- ✅ **Detaillierte Fehleranalyse:** Implementiert
- ✅ **Strukturierte Fehlermeldungen:** Implementiert
- ✅ **Client-freundliche Nachrichten:** Implementiert
- ✅ **Request-Tracking:** Implementiert

**Die PDF-Fehlermeldungen sind jetzt aussagekräftig und hilfreich für Diagnose und Support!** 🎉

## Nächste Schritte

1. **Testing:** Verschiedene Fehlerszenarien testen
2. **Monitoring:** Fehlerkategorien überwachen
3. **Support:** Fehlermeldungen für Support-Team dokumentieren
4. **Optimierung:** Weitere Fehlertypen hinzufügen
