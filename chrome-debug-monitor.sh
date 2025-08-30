#!/bin/bash
# chrome-debug-monitor.sh

CONTAINER_NAME="steuer-fair-api"
LOG_FILE="/tmp/chrome-debug.log"

echo "=== Chrome Debug Monitor ==="
echo "Container: $CONTAINER_NAME"
echo "Log-Datei: $LOG_FILE"
echo "Zeit: $(date)"
echo ""

# Chrome-Prozesse prüfen
echo "=== Chrome-Prozesse ==="
docker exec $CONTAINER_NAME ps aux | grep -i chrome || echo "Keine Chrome-Prozesse gefunden"

# Log-Datei-Größe
echo ""
echo "=== Log-Datei-Status ==="
docker exec $CONTAINER_NAME ls -lh $LOG_FILE 2>/dev/null || echo "Log-Datei nicht gefunden"

# Letzte Log-Einträge
echo ""
echo "=== Letzte Log-Einträge ==="
docker exec $CONTAINER_NAME tail -20 $LOG_FILE 2>/dev/null || echo "Keine Log-Einträge"

# Memory-Usage
echo ""
echo "=== Memory-Usage ==="
docker exec $CONTAINER_NAME free -h

# Chrome-Fehler
echo ""
echo "=== Chrome-Fehler ==="
docker exec $CONTAINER_NAME grep -i "error\|fail\|exception" $LOG_FILE 2>/dev/null | tail -10 || echo "Keine Fehler gefunden"

# Target-Close-Fehler
echo ""
echo "=== Target-Close-Fehler ==="
docker exec $CONTAINER_NAME grep -i "target.*close" $LOG_FILE 2>/dev/null | tail -5 || echo "Keine Target-Close-Fehler"

# Protocol-Fehler
echo ""
echo "=== Protocol-Fehler ==="
docker exec $CONTAINER_NAME grep -i "protocol.*error" $LOG_FILE 2>/dev/null | tail -5 || echo "Keine Protocol-Fehler"

# Chrome-Umgebungsvariablen
echo ""
echo "=== Chrome-Umgebungsvariablen ==="
docker exec $CONTAINER_NAME env | grep -i chrome || echo "Keine Chrome-Umgebungsvariablen gefunden"

# Chrome-Argumente aus Logs
echo ""
echo "=== Chrome-Argumente (aus Logs) ==="
docker exec $CONTAINER_NAME grep -i "chrome-argumente" /app/logs/app.log 2>/dev/null | tail -3 || echo "Keine Chrome-Argumente in Logs gefunden"
