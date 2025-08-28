# UI-Vereinfachung und Berechnungsmodus

## Übersicht

Die Anwendung wurde vereinfacht und um einen flexiblen Berechnungsmodus erweitert:

1. **Entfernung der Abzüge-Felder** - Werbungskosten, Sonderausgaben, etc.
2. **Neuer Berechnungsmodus** - Manuell vs. Automatisch
3. **Vereinfachte Datenbank** - Weniger Felder, bessere Performance

## Entfernte Felder

### **Partner-Formulare**
- ❌ **Werbungskosten** (`allowances`)
- ❌ **Sonderausgaben** (`specialExpenses`)
- ❌ **Außergewöhnliche Belastungen** (`extraordinaryExpenses`)
- ❌ **Kinderfreibetrag** (`childAllowance`)

### **Vorteile**
- ✅ **Einfachere Bedienung** - Weniger Eingabefelder
- ✅ **Schnellere Eingabe** - Fokus auf Kernwerte
- ✅ **Geringere Fehleranfälligkeit** - Weniger Komplexität
- ✅ **Bessere Performance** - Kleinere Datenbank

## Neuer Berechnungsmodus

### **Schiebeschalter**
Unter der Veranlagungsjahr-Dropdown wurde ein Toggle hinzugefügt:

```
[Manuell eingeben] ←→ [Automatisch berechnen]
```

### **Manueller Modus**
- ✅ **Steuer und Soli** werden manuell eingegeben
- ✅ **Input-Felder** sind editierbar
- ✅ **Aus Steuerbescheid** - Direkte Eingabe der Werte
- ✅ **Flexibilität** - Benutzer hat volle Kontrolle

### **Automatischer Modus**
- ✅ **Steuer und Soli** werden automatisch berechnet
- ✅ **Input-Felder** sind deaktiviert (disabled)
- ✅ **Berechnung** basiert auf zu versteuerndem Einkommen
- ✅ **Transparenz** - Klare Berechnungsgrundlage

## Technische Änderungen

### **Datenbank-Schema**
```sql
-- Entfernte Felder
partner_a_allowances DECIMAL(12,2),
partner_a_special_expenses DECIMAL(12,2),
partner_a_extraordinary_expenses DECIMAL(12,2),
partner_a_child_allowance DECIMAL(12,2),

-- Neues Feld
calculation_mode VARCHAR(20) DEFAULT 'manual'
```

### **TypeScript-Typen**
```typescript
// Entfernte Felder aus TaxPartner
allowances: number;
specialExpenses: number;
extraordinaryExpenses: number;
childAllowance: number;

// Neues Feld in JointTaxData
calculationMode: 'manual' | 'calculated';
```

### **TaxCalculator**
```typescript
// Vereinfachte Berechnung
static calculateIndividualTax(partner: TaxPartner): { fee: number; fse: number } {
  const taxableIncome = partner.sek; // Nur zu versteuerndes Einkommen
  // ... Berechnung mit Grundfreibetrag
}
```

## Frontend-Komponenten

### **Neue Komponente**
- ✅ `CalculationModeToggle.tsx` - Schiebeschalter für Berechnungsmodus

### **Angepasste Komponenten**
- ✅ `TaxPartnerForm.tsx` - Entfernte Abzüge-Felder, Berechnungsmodus
- ✅ `JointDataForm.tsx` - Berechnungsmodus für gemeinsame Werte
- ✅ `TaxCalculator.tsx` - Integration des Toggles

### **UI-Verhalten**
```typescript
// Manueller Modus
<input disabled={false} /> // Editierbar

// Automatischer Modus
<input disabled={true} className="opacity-50 cursor-not-allowed" /> // Deaktiviert
```

## Berechnungslogik

### **Manueller Modus**
- Benutzer gibt Steuer und Soli direkt ein
- Keine automatische Berechnung
- Werte werden aus Steuerbescheid übernommen

### **Automatischer Modus**
- Steuer wird basierend auf `sek` berechnet
- Grundfreibetrag wird angewendet
- Soli wird als 5,5% der Steuer berechnet
- Automatische Aktualisierung bei Eingabeänderungen

## Vorteile der Lösung

### ✅ **Benutzerfreundlichkeit**
- Klare Unterscheidung zwischen Modi
- Intuitive Bedienung
- Weniger Eingabefelder

### ✅ **Flexibilität**
- Zwei Berechnungsarten verfügbar
- Benutzer kann wählen
- Vergleich zwischen Modi möglich

### ✅ **Wartbarkeit**
- Einfachere Codebase
- Weniger Komplexität
- Bessere Testbarkeit

### ✅ **Performance**
- Kleinere Datenbank
- Schnellere Berechnungen
- Weniger Speicherverbrauch

## Migration

### **Datenbank-Migration**
```sql
-- Alte Felder entfernen
ALTER TABLE tax_data DROP COLUMN partner_a_allowances;
ALTER TABLE tax_data DROP COLUMN partner_a_special_expenses;
-- ... weitere Felder

-- Neues Feld hinzufügen
ALTER TABLE tax_data ADD COLUMN calculation_mode VARCHAR(20) DEFAULT 'manual';
```

### **Daten-Migration**
- Bestehende Daten werden mit `calculation_mode = 'manual'` gesetzt
- Abzüge-Werte werden ignoriert
- Berechnungen basieren nur auf `sek`

## Nächste Schritte

1. **Datenbank-Migration** ausführen
2. **Frontend testen** - Beide Modi
3. **Dokumentation** für Benutzer erstellen
4. **Tutorial** für neuen Berechnungsmodus
