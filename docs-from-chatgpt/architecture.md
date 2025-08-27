# Architecture Document

## 1. Überblick
Das System soll eine Webanwendung bereitstellen, mit der Partner:innen in Deutschland
eine faire Aufteilung der Steuererstattung aus gemeinsamer Veranlagung berechnen können.
Die Architektur ist modular aufgebaut und erlaubt spätere Erweiterungen (z. B. Benutzerkonten, Datenimport/Export).

---

## 2. Architekturziele
- **Transparenz:** Jede Berechnung muss nachvollziehbar und dokumentierbar sein.
- **Datenschutz:** DSGVO-konforme Speicherung, keine unnötige Datenhaltung.
- **Erweiterbarkeit:** Klare Trennung zwischen Frontend, Backend und Berechnungslogik.
- **Portabilität:** Deployment als Container (Docker), um flexible Bereitstellung zu ermöglichen.

---

## 3. Systemkomponenten

### Frontend
- **Technologie:** React + TailwindCSS (oder Next.js für SSR/SEO)
- **Funktionen:**
  - Eingabemasken für steuerrelevante Daten
  - Darstellung der Berechnungsergebnisse (Tabellen & Diagramme)
  - Export-Buttons (PDF/CSV)
- **Integration:** Kommuniziert ausschließlich mit dem Backend über REST API oder GraphQL.

### Backend
- **Technologie:** Node.js (Express oder NestJS)
- **Funktionen:**
  - REST-API für Eingabe, Berechnung und Ausgabe
  - Authentifizierung & Benutzerverwaltung (optional in M3)
  - Logging & Fehlerbehandlung
- **Schnittstellen:**
  - API-Endpunkte:
    - `/calculate` → nimmt Input-Daten, liefert Berechnungsergebnisse
    - `/export/pdf` → generiert PDF-Report
    - `/export/csv` → exportiert Daten

### Berechnungsmodul
- **Technologie:** Eigenständiges Modul (JavaScript/TypeScript)
- **Aufgaben:**
  - Steuerlast bei getrennter Veranlagung berechnen (Partner A, Partner B)
  - Steuerlast bei gemeinsamer Veranlagung berechnen
  - Ersparnis ermitteln und anteilig im Verhältnis der Einzelsteuerlasten aufteilen
- **Erweiterbar:** Regel-Engine für künftige Steuerrechtsänderungen

### Datenhaltung
- **Phase M1 (MVP):** Keine dauerhafte Speicherung, alles Client-seitig oder temporär im Backend.
- **Phase M3:** Relationale Datenbank (PostgreSQL oder MySQL) zur Speicherung von Nutzerkonten und Szenarien.

---

## 4. Infrastruktur

### Deployment
- Containerisiert mit Docker
- Lokale Entwicklung: Docker Compose
- Produktion: Cloud Deployment (z. B. AWS, Azure, Hetzner Cloud oder Vercel + Railway)

### Sicherheit
- HTTPS-Verschlüsselung (TLS)
- Eingabedaten-Validierung im Backend
- Optionale Authentifizierung via JWT (bei Benutzerkonten)

---

## 5. Datenfluss (High-Level)

```mermaid
flowchart TD
    UI[Frontend: React/Next.js] --> API[Backend: Node.js/Express]
    API --> CALC[Berechnungsmodul]
    CALC --> API
    API --> DB[(DB: optional ab M3)]
    API --> UI
