# Verbessertes Error Logging System

## Problem

Bei HTTP 500-Fehlern erschienen keine detaillierten Log-Einträge, was die Fehlerbehebung erschwerte.

## Lösung

Implementierung eines umfassenden Error Logging Systems mit:

1. **Request-ID Tracking**
2. **Detaillierte Error Logs**
3. **Unterscheidung zwischen Client- und Server-Fehlern**
4. **Global Error Handler**

## Komponenten

### 1. Request Logger (`apps/api/src/middleware/requestLogger.ts`)

**Features:**
- ✅ **Request-ID Generation** mit UUID
- ✅ **Request/Response Tracking**
- ✅ **Status-basierte Log-Level**
- ✅ **Performance Monitoring**

**Log-Beispiele:**
```javascript
// Erfolgreiche Request
{
  message: "✅ Request completed",
  requestId: "550e8400-e29b-41d4-a716-446655440000",
  method: "GET",
  url: "/api/profile/tilo",
  statusCode: 200,
  duration: "45ms"
}

// Fehlerhafte Request
{
  message: "❌ Request failed",
  requestId: "550e8400-e29b-41d4-a716-446655440000",
  method: "PUT",
  url: "/api/profile/tilo",
  statusCode: 500,
  duration: "123ms"
}
```

### 2. Error Handler (`apps/api/src/middleware/errorHandler.ts`)

**Features:**
- ✅ **Status-Code-basierte Log-Level**
- ✅ **Detaillierte Request-Informationen**
- ✅ **Stack Trace Logging**
- ✅ **Request-ID Tracking**

**Log-Level:**
- **500+ (Server Errors)**: `ERROR` mit detaillierten Request-Daten
- **400-499 (Client Errors)**: `WARN` mit grundlegenden Informationen

**Server Error Log:**
```javascript
// 🚨 SERVER ERROR:
{
  message: "Cannot read property 'id' of undefined",
  stack: "TypeError: Cannot read property 'id' of undefined\n    at ProfileController.saveProfile...",
  url: "/api/profile/tilo",
  method: "PUT",
  statusCode: 500,
  isServerError: true,
  requestId: "550e8400-e29b-41d4-a716-446655440000"
}

// Request Details:
{
  body: { name: "Tilo", email: "tilo@example.com" },
  query: {},
  params: { loginId: "tilo" },
  headers: {
    authorization: "present",
    "content-type": "application/json",
    origin: "http://localhost:3000"
  }
}
```

### 3. Global Error Handler

**Features:**
- ✅ **Uncaught Exception Handling**
- ✅ **Unhandled Rejection Handling**
- ✅ **Graceful Shutdown**

**Log-Beispiele:**
```javascript
// 🚨 UNCAUGHT EXCEPTION:
{
  message: "ECONNREFUSED: connect ECONNREFUSED 127.0.0.1:5432",
  stack: "Error: connect ECONNREFUSED...",
  timestamp: "2025-08-29T11:45:00.000Z"
}

// 🚨 UNHANDLED REJECTION:
{
  reason: "Database connection failed",
  promise: "Promise { <pending> }",
  timestamp: "2025-08-29T11:45:00.000Z"
}
```

## Log-Level Übersicht

| Status Code | Log Level | Emoji | Beschreibung |
|-------------|-----------|-------|--------------|
| 200-299 | `INFO` | ✅ | Erfolgreiche Requests |
| 300-399 | `INFO` | ℹ️ | Redirects |
| 400-499 | `WARN` | ⚠️ | Client-Fehler |
| 500+ | `ERROR` | 🚨 | Server-Fehler |

## Request-ID Tracking

**Vorteile:**
- ✅ **Request-Verfolgung** über alle Log-Einträge
- ✅ **Einfache Fehleranalyse**
- ✅ **Performance-Monitoring**
- ✅ **Debugging-Unterstützung**

**Verwendung:**
```bash
# Request mit Request-ID
curl -H "X-Request-ID: my-custom-id" http://localhost:3001/api/profile/tilo

# Log-Ausgabe
{
  message: "📥 Incoming request",
  requestId: "my-custom-id",
  method: "GET",
  url: "/api/profile/tilo"
}
```

## Konfiguration

### Environment-Variablen
```bash
# Log Level
LOG_LEVEL=info  # debug, info, warn, error

# Request Logging
ENABLE_REQUEST_LOGGING=true

# Error Details in Production
NODE_ENV=production  # Keine Stack Traces in Production
```

### Logger-Konfiguration
```typescript
// apps/api/src/utils/logger.ts
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

## Monitoring und Alerting

### 1. Error Rate Monitoring
```bash
# Fehler-Rate überwachen
grep "🚨 SERVER ERROR" logs/combined.log | wc -l

# 500-Fehler in den letzten 5 Minuten
grep "$(date -d '5 minutes ago' +'%Y-%m-%d %H:%M')" logs/combined.log | grep "statusCode: 500"
```

### 2. Performance Monitoring
```bash
# Langsame Requests (>1s)
grep "duration.*[0-9][0-9][0-9][0-9]ms" logs/combined.log

# Durchschnittliche Response-Zeit
grep "Request completed" logs/combined.log | awk '{print $NF}' | sed 's/ms//' | awk '{sum+=$1} END {print sum/NR}'
```

### 3. Request-ID Tracking
```bash
# Alle Logs für eine spezifische Request-ID
grep "550e8400-e29b-41d4-a716-446655440000" logs/combined.log
```

## Troubleshooting

### Problem: Keine Error Logs bei 500-Fehlern

**Lösung:**
1. **Logger-Konfiguration prüfen**
2. **Error Handler Middleware prüfen**
3. **Request-ID Tracking aktivieren**

### Problem: Zu viele Log-Einträge

**Lösung:**
```bash
# Log-Level anpassen
export LOG_LEVEL=warn

# Request-Logging deaktivieren
export ENABLE_REQUEST_LOGGING=false
```

### Problem: Performance-Impact durch Logging

**Lösung:**
```typescript
// Asynchrones Logging implementieren
logger.info(logData, (err) => {
  if (err) console.error('Logging error:', err);
});
```

## Best Practices

### 1. Sensible Daten filtern
```typescript
// Passwörter und Tokens aus Logs entfernen
const sanitizedBody = { ...req.body };
delete sanitizedBody.password;
delete sanitizedBody.token;
```

### 2. Log-Rotation
```bash
# Log-Rotation mit logrotate
/var/log/steuer-fair-api/*.log {
  daily
  rotate 30
  compress
  delaycompress
  missingok
  notifempty
  create 644 nodejs nodejs
}
```

### 3. Structured Logging
```typescript
// Konsistente Log-Struktur
logger.error('Database connection failed', {
  error: error.message,
  code: error.code,
  host: process.env.DB_HOST,
  timestamp: new Date().toISOString()
});
```

## Testing

### 1. Error Logging Test
```bash
# 500-Fehler provozieren
curl -X PUT http://localhost:3001/api/profile/invalid \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'

# Logs prüfen
tail -f logs/combined.log | grep "🚨 SERVER ERROR"
```

### 2. Request-ID Test
```bash
# Request mit custom ID
curl -H "X-Request-ID: test-123" http://localhost:3001/api/profile/tilo

# Logs prüfen
grep "test-123" logs/combined.log
```

### 3. Performance Test
```bash
# Langsame Request simulieren
curl http://localhost:3001/api/slow-endpoint

# Performance-Logs prüfen
grep "duration.*[0-9][0-9][0-9]ms" logs/combined.log
```
