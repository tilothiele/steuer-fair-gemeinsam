# Product Requirements Document (PRD)

## 1. Epische Story
Als Partnerpaar in Deutschland möchten wir unsere Steuererstattung aus gemeinsamer Veranlagung fair teilen,
damit beide in dem Verhältnis profitieren, wie sie bei getrennter Veranlagung Steuern gezahlt hätten.
So vermeiden wir Konflikte und schaffen Transparenz bei der Rückzahlung.

---

## 2. Funktionale Anforderungen

### Kernfunktionen
1. **Dateneingabe**
   - Einkommen, Werbungskosten, Sonderausgaben, Freibeträge, Steuerklasse.
   - Möglichkeit zum manuellen Eintrag oder Import (CSV/ELSTER-Export).

2. **Berechnung**
   - Steuerlast bei getrennter Veranlagung (Partner A und Partner B).
   - Steuerlast bei gemeinsamer Veranlagung.
   - Berechnung der Ersparnis durch Zusammenveranlagung.
   - Faire Aufteilung der Erstattung im Verhältnis der fiktiven Einzelsteuerlasten.

3. **Ausgabe**
   - Übersichtliche Darstellung der Ergebnisse in Tabellenform.
   - Grafische Visualisierung der Aufteilung (z. B. Balkendiagramm).
   - Export als PDF oder CSV.

4. **Benutzerverwaltung (optional, später)**
   - Registrierung/Login für Paare.
   - Speicherung von Szenarien (z. B. mehrere Steuerjahre).

---

## 3. Nicht-funktionale Anforderungen
- **Transparenz:** Jede Berechnung soll nachvollziehbar dokumentiert werden (Formeln, Berechnungsschritte, Visualisierung in Diagrammen).
- **Datenschutz:** DSGVO-konform, Speicherung nur mit expliziter Zustimmung.
- **Usability:** Intuitive Web-Oberfläche, mobile responsive.
- **Performance:** Ergebnisse sollen in <2 Sekunden berechnet und angezeigt werden.
- **Skalierbarkeit:** Anwendung soll mindestens 10.000 gleichzeitige Nutzer:innen bedienen können.

---

## 4. Datenmodell und Berechnungen

Für ein Kalenderjahr soll es einen Hauptdatensatz geben.

### Eingegebene Werte

Es werden diese Werge gespeichert:

- Steuernummer

Für jeden Partner (A/B)
- Name
- SteuerID
- Steuerpflichtiges Einkommen (SEK)
- Festgesetzte Einkommensteuer bei Einzelveranlagung (FEE)
- Festgesetzter Soli bei Einzelveranlagung (FSE)
- Bereits gezahlte Lohn-/Einkommensteuer (GL)
- Bereits gezahlte Vorauszahlung für Einkommentsteuer (GVE)
- Bereits gezahlter Soli (GS)

Gemeinsame Werte (bei gemeinsamer Veranlagung)
- Steuerpflichtiges Einkommen (GSEK)
- Festgesetzte Einkommensteuer (GFE)
- Festgesetzter Soli (GFS)

### Berechnete Werte

Plausibilitätsprüfung, ob FEEa+FEEb+FSEa+FSEb > GFE+GFS

Wenn nein -> Fehlermeldung anzeigen und keine Berechneten Werte ausweisen.

Ansonsten:

FaktorA = (FEEa+FSEa) / (FEEa+FEEb+FSEa+FSEb)
FaktorB = (FEEb+FSEb) / (FEEa+FEEb+FSEa+FSEb)

Ausweisen
- Gemeinsame zu Zahlen: GZZ=GFE+GFS

Ausweisen für jeden Partner (A/B)
- hätte zahlen müssen: FEE+FSE
- muss nun zahlen: MNZ = Faktor(A/B) * GZZ
- hat gezahlt: HG = GL+GVE+GS
- Differenz: MNZ-HG

---

## 5. Milestones & Roadmap

### M1: MVP – Kernfunktion
- Manuelle Eingabe der steuerrelevanten Daten.
- Berechnung getrennte vs. gemeinsame Veranlagung.
- Faire Aufteilung der Erstattung.
- Ergebnisdarstellung in Tabelle.

### M2: Komfort-Funktionen
- Datenimport (CSV/ELSTER).
- Export als PDF/CSV.
- Grafische Visualisierung.

### M3: Erweiterungen
- Benutzerkonten, Speicherung von Szenarien.
- Mehrsprachigkeit (DE/EN).
- API für Steuerberater:innen oder Integrationen mit Steuer-Software.

---

## 6. Annahmen & Risiken
- Annahme: Nutzer:innen haben ihre Steuerdaten bereits (z. B. aus ELSTER oder Steuerprogramm).
- Risiko: Steuerrechtliche Änderungen könnten Anpassungen in der Berechnungslogik erfordern.
- Risiko: Die App darf **keine Steuerberatung** ersetzen → klare rechtliche Abgrenzung notwendig.

---

## 7. Erfolgskriterien
- **Korrektheit:** Ergebnisse stimmen mit offizieller Steuerberechnung überein.
- **Akzeptanz:** Paare empfinden die Aufteilung als fair und nachvollziehbar.
- **Adoption:** Erste 100 Testnutzer:innen können ohne Hilfestellung ihre Rückzahlung aufteilen.
