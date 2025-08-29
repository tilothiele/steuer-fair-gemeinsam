# Logo und Favicon - Platzierung und Ersetzung

## Übersicht

Die Anwendung verwendet Platzhalter-Logos und Favicons, die Sie später durch Ihre eigenen Designs ersetzen können.

## Datei-Struktur

```
apps/web/public/
├── favicon.ico          # Browser-Favicon
├── logo.svg             # Hauptlogo (helles Theme)
├── logo-dark.svg        # Logo für dunkles Theme
└── icon.svg             # App-Icon (PWA/Manifest)
```

## Dateien und ihre Verwendung

### 1. `favicon.ico`
**Verwendung:** Browser-Tab-Icon
**Format:** .ico (Icon-Datei)
**Empfohlene Größen:**
- 16x16 px (Standard)
- 32x32 px (High-DPI)
- 48x48 px (Windows)

**Ersetzung:**
```bash
# Ersetzen Sie die Platzhalter-Datei
cp your-favicon.ico apps/web/public/favicon.ico
```

### 2. `logo.svg`
**Verwendung:** Hauptlogo der Anwendung (helles Theme)
**Format:** SVG (skalierbar)
**Aktuelle Größe:** 200x60 px
**Farben:** Hell (passend zu hellem Theme)

**Ersetzung:**
```bash
# Ersetzen Sie die Platzhalter-Datei
cp your-logo.svg apps/web/public/logo.svg
```

### 3. `logo-dark.svg`
**Verwendung:** Logo für dunkles Theme
**Format:** SVG (skalierbar)
**Aktuelle Größe:** 200x60 px
**Farben:** Dunkel (passend zu dunklem Theme)

**Ersetzung:**
```bash
# Ersetzen Sie die Platzhalter-Datei
cp your-logo-dark.svg apps/web/public/logo-dark.svg
```

### 4. `icon.svg`
**Verwendung:** App-Icon (PWA, Manifest, etc.)
**Format:** SVG (skalierbar)
**Aktuelle Größe:** 512x512 px
**Format:** Quadratisch (1:1)

**Ersetzung:**
```bash
# Ersetzen Sie die Platzhalter-Datei
cp your-icon.svg apps/web/public/icon.svg
```

## Integration in der Anwendung

### 1. Layout-Integration
```typescript
// apps/web/src/app/layout.tsx
import Logo from '../components/UI/Logo';

// Favicon-Metadaten
export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
  },
};

// Logo im Header
<div className="flex justify-center mb-4">
  <Logo className="max-w-xs" />
</div>
```

### 2. Logo-Komponente
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

## Design-Richtlinien

### 1. Logo-Design
**Empfohlene Eigenschaften:**
- **Format:** SVG für Skalierbarkeit
- **Größe:** 200x60 px (Hauptlogo)
- **Farben:** Passend zum "Steuer-Fair" Thema
- **Stil:** Professionell, vertrauenswürdig
- **Text:** "Steuer-Fair" oder "Steuer Fair"

### 2. Favicon-Design
**Empfohlene Eigenschaften:**
- **Format:** .ico mit mehreren Größen
- **Größen:** 16x16, 32x32, 48x48 px
- **Stil:** Einfach, erkennbar
- **Farben:** Kontrastreich

### 3. App-Icon-Design
**Empfohlene Eigenschaften:**
- **Format:** SVG oder PNG
- **Größe:** 512x512 px
- **Stil:** Quadratisch, mit Padding
- **Farben:** Passend zum Logo

## Farbpalette

### Aktuelle Farben (Platzhalter)
```css
/* Primär-Farben */
--primary-blue: #3b82f6;
--primary-green: #10b981;
--primary-orange: #f59e0b;

/* Text-Farben */
--text-dark: #1e293b;
--text-light: #f8fafc;
--text-muted: #64748b;
--text-muted-dark: #94a3b8;
```

### Empfohlene Farben für Ihr Design
```css
/* Steuer-Fair Theme */
--brand-primary: #2563eb;    /* Vertrauensvolles Blau */
--brand-secondary: #059669;  /* Erfolgs-Grün */
--brand-accent: #dc2626;     /* Warnung-Rot */
--brand-neutral: #6b7280;    /* Neutral-Grau */
```

## Ersetzungsanleitung

### 1. Favicon ersetzen
```bash
# 1. Erstellen Sie Ihr .ico-Favicon
# 2. Ersetzen Sie die Datei
cp your-favicon.ico apps/web/public/favicon.ico

# 3. Testen Sie im Browser
# Öffnen Sie http://localhost:3000 und prüfen Sie den Tab
```

### 2. Logo ersetzen
```bash
# 1. Erstellen Sie Ihre SVG-Logos
# 2. Ersetzen Sie die Dateien
cp your-logo.svg apps/web/public/logo.svg
cp your-logo-dark.svg apps/web/public/logo-dark.svg

# 3. Testen Sie in der Anwendung
# Starten Sie die Anwendung und prüfen Sie das Logo
```

### 3. App-Icon ersetzen
```bash
# 1. Erstellen Sie Ihr App-Icon
# 2. Ersetzen Sie die Datei
cp your-icon.svg apps/web/public/icon.svg

# 3. Testen Sie PWA-Features
# Installieren Sie die App und prüfen Sie das Icon
```

## Tools und Ressourcen

### 1. Favicon-Generatoren
- **Favicon.io**: https://favicon.io/
- **RealFaviconGenerator**: https://realfavicongenerator.net/
- **Favicon Generator**: https://www.favicon-generator.org/

### 2. Logo-Design-Tools
- **Figma**: https://figma.com/ (kostenlos)
- **Canva**: https://canva.com/ (kostenlos)
- **Inkscape**: https://inkscape.org/ (Open Source)

### 3. SVG-Optimierung
- **SVGO**: https://github.com/svg/svgo
- **SVGOMG**: https://jakearchibald.github.io/svgomg/

## Testing

### 1. Favicon-Test
```bash
# Browser-Tab prüfen
# Favicon sollte in allen Browsern sichtbar sein
```

### 2. Logo-Test
```bash
# Anwendung starten
npm run dev

# Logo prüfen
# - Sichtbarkeit
# - Skalierung
# - Responsive Design
```

### 3. App-Icon-Test
```bash
# PWA installieren
# App-Icon sollte korrekt angezeigt werden
```

## Troubleshooting

### Problem: Favicon wird nicht angezeigt
**Lösung:**
1. **Cache leeren** (Ctrl+F5)
2. **Datei-Format prüfen** (.ico)
3. **Datei-Pfad prüfen** (/public/favicon.ico)

### Problem: Logo wird nicht geladen
**Lösung:**
1. **SVG-Format prüfen**
2. **Datei-Pfad prüfen**
3. **Next.js Image-Komponente prüfen**

### Problem: Logo ist verpixelt
**Lösung:**
1. **SVG-Format verwenden**
2. **Vektorgrafik statt Rastergrafik**
3. **Skalierung prüfen**

## Best Practices

### 1. Datei-Formate
- **Favicon:** .ico mit mehreren Größen
- **Logo:** SVG für Skalierbarkeit
- **App-Icon:** SVG oder hochauflösendes PNG

### 2. Datei-Größen
- **Favicon:** < 50 KB
- **Logo:** < 100 KB
- **App-Icon:** < 200 KB

### 3. Responsive Design
- **Logo:** Skalierbar für verschiedene Bildschirmgrößen
- **Favicon:** Verschiedene Größen für verschiedene Geräte
- **App-Icon:** Quadratisch mit Padding

### 4. Accessibility
- **Alt-Text:** Beschreibende Alt-Texte für alle Bilder
- **Kontrast:** Ausreichender Kontrast für Lesbarkeit
- **Skalierung:** Unterstützung für Zoom-Funktionen
