# @steuer-fair/shared

Gemeinsame Bibliothek für Steuer-Fair-Gemeinsam mit Steuerberechnungen und Typen.

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Tests

### Tests ausführen

```bash
# Alle Tests einmal ausführen
npm test

# Tests im Watch-Modus (bei Dateiänderungen)
npm run test:watch

# Tests mit Coverage-Report
npm run test:coverage
```

### Test-Coverage

Die Tests decken alle wichtigen Funktionen der `TaxCalculationService` ab:

- ✅ `calculateIndividualTax` - Einzelsteuerberechnung
- ✅ `calculateJointTax` - Gemeinsame Steuerberechnung  
- ✅ `calculateFairSplit` - Faire Aufteilung der Steuerlast
- ✅ `calculatePartnerDisplayValues` - UI-Anzeigewerte
- ✅ `validatePartners` - Datenvalidierung

### Test-Szenarien

Die Tests decken folgende Szenarien ab:

1. **Normale Berechnungen** mit realistischen Steuerdaten
2. **Grenzwerte** (0, negative Werte, sehr große Werte)
3. **Fehlerfälle** (ungültige Daten, Plausibilitätsprüfung)
4. **Edge Cases** (sehr kleine Werte, Rundung)
5. **Validierung** aller Eingabefelder

### Beispiel-Testdaten

```typescript
// Partner A: 50.000€ Einkommen, 8.000€ Steuer, 440€ Soli
// Partner B: 40.000€ Einkommen, 6.000€ Steuer, 330€ Soli
// Gemeinsam: 90.000€ Einkommen, 13.000€ Steuer, 715€ Soli

// Erwartete Ergebnisse:
// - Faktor A: ~57.14%
// - Faktor B: ~42.86%
// - Partner A muss zahlen: ~7.835€
// - Partner B muss zahlen: ~5.880€
```

## Entwicklung

```bash
# TypeScript im Watch-Modus kompilieren
npm run dev

# Build-Verzeichnis bereinigen
npm run clean
```
