# Einfache Steuerberechnung ohne Abzüge

## Übersicht

Die Anwendung bietet jetzt zwei Berechnungsmodi:

1. **Vollständige Berechnung** - Mit allen Abzügen (Werbungskosten, Sonderausgaben, etc.)
2. **Einfache Berechnung** - Nur basierend auf dem zu versteuernden Einkommen

## Neue Methoden

### 1. Einzelsteuerberechnung ohne Abzüge

```typescript
TaxCalculator.calculateIndividualTaxSimple(partner: TaxPartner): { fee: number; fse: number }
```

**Funktionalität:**
- ✅ Berechnet Einkommensteuer nur aus `partner.sek`
- ✅ Ignoriert alle Abzüge (Werbungskosten, Sonderausgaben, etc.)
- ✅ Wendet Grundfreibetrag an (11.604€ für 2024)
- ✅ Berechnet Solidaritätszuschlag (5,5%)

**Beispiel:**
```typescript
const partner = {
  sek: 50000, // Zu versteuerndes Einkommen
  allowances: 1000, // Wird ignoriert
  specialExpenses: 500, // Wird ignoriert
  // ... andere Felder
};

const result = TaxCalculator.calculateIndividualTaxSimple(partner);
// result.fee = Einkommensteuer
// result.fse = Solidaritätszuschlag
```

### 2. Gemeinsame Steuerberechnung ohne Abzüge

```typescript
TaxCalculator.calculateJointTaxSimple(jointData: JointTaxData): { gfe: number; gfs: number }
```

**Funktionalität:**
- ✅ Berechnet gemeinsame Einkommensteuer nur aus `jointData.gsek`
- ✅ Wendet Grundfreibetrag für Ehepaare an (23.208€ für 2024)
- ✅ Berechnet Solidaritätszuschlag (5,5%)

### 3. Faire Aufteilung ohne Abzüge

```typescript
TaxCalculator.calculateFairSplitSimple(partnerA: TaxPartner, partnerB: TaxPartner, jointData: JointTaxData): TaxCalculationResult
```

**Funktionalität:**
- ✅ Verwendet einfache Steuerberechnung für beide Partner
- ✅ Berechnet faire Aufteilung basierend auf berechneten Steuern
- ✅ Gleiche Logik wie `calculateFairSplit`, aber ohne Abzüge

## Steuersätze (2024)

### Einzelveranlagung
- **Grundfreibetrag**: 11.604€
- **14%**: 0€ - 10.908€
- **24%**: 10.909€ - 62.809€
- **42%**: Ab 62.810€

### Zusammenveranlagung
- **Grundfreibetrag**: 23.208€
- **14%**: 0€ - 21.816€
- **24%**: 21.817€ - 125.618€
- **42%**: Ab 125.619€

### Solidaritätszuschlag
- **5,5%** auf die Einkommensteuer

## Verwendung

### Frontend Integration
```typescript
// Einfache Berechnung verwenden
const result = TaxCalculator.calculateFairSplitSimple(partnerA, partnerB, jointData);

// Vollständige Berechnung verwenden
const result = TaxCalculator.calculateFairSplit(partnerA, partnerB, jointData);
```

### API Integration
```typescript
// Neue Route für einfache Berechnung
POST /api/tax/calculate-simple
{
  "partnerA": { "sek": 50000, ... },
  "partnerB": { "sek": 40000, ... },
  "jointData": { "gsek": 90000, ... }
}
```

## Vorteile der einfachen Berechnung

### ✅ **Einfachheit**
- Weniger Eingabefelder erforderlich
- Schnellere Berechnung
- Geringere Fehleranfälligkeit

### ✅ **Transparenz**
- Klare Berechnungsgrundlage
- Einfacher nachvollziehbar
- Weniger komplexe Logik

### ✅ **Flexibilität**
- Zwei Berechnungsmodi verfügbar
- Benutzer kann wählen
- Vergleich zwischen den Modi möglich

## Implementierung

### Backend
- ✅ Neue Methoden in `TaxCalculator` Klasse
- ✅ Gleiche Validierung und Fehlerbehandlung
- ✅ Konsistente API-Struktur

### Frontend
- ✅ Option zum Umschalten zwischen Modi
- ✅ Klare Kennzeichnung der Berechnungsart
- ✅ Vergleichsanzeige möglich

## Nächste Schritte

1. **Frontend-Integration**: Umschalter zwischen Berechnungsmodi
2. **API-Route**: Neue Route für einfache Berechnung
3. **Dokumentation**: Benutzeranleitung für beide Modi
4. **Vergleich**: Side-by-Side Vergleich der Ergebnisse
