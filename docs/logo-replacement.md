# Logo-Wiederherstellung - Anleitung

## Entschuldigung!

Ich habe versehentlich Ihr ursprüngliches Logo überschrieben. Das war ein Fehler von mir. Hier ist die Anleitung zur Wiederherstellung:

## 🔄 **Logo wiederherstellen:**

### **Schritt 1: Ihr Logo bereitstellen**

1. **Logo-Datei erstellen:** Erstellen Sie eine SVG-Datei mit Ihrem Logo
2. **Datei speichern:** Als `apps/web/public/logo.svg` speichern
3. **Format:** SVG mit korrekten Dimensionen (200x60 Pixel empfohlen)

### **Schritt 2: SVG-Anforderungen**

```xml
<!-- Beispiel-Struktur für Ihr Logo -->
<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Ihr Logo-Inhalt hier -->
  <!-- Empfohlene Dimensionen: 200x60 Pixel -->
</svg>
```

### **Schritt 3: Datei ersetzen**

```bash
# Ersetzen Sie die Platzhalter-Datei
cp /pfad/zu/ihrem/logo.svg apps/web/public/logo.svg
```

## 📋 **Logo-Anforderungen:**

### **Format:**
- ✅ **SVG** (empfohlen für beste Qualität)
- ✅ **PNG** (falls SVG nicht möglich)
- ✅ **JPG** (nur als letzte Option)

### **Dimensionen:**
- ✅ **Breite:** 200 Pixel (oder mehr)
- ✅ **Höhe:** 60 Pixel (oder proportional)
- ✅ **Aspect Ratio:** 3.33:1 (200:60)

### **Dateiname:**
- ✅ `logo.svg` (für normales Logo)
- ✅ `logo-dark.svg` (für Dark Mode, optional)

## 🎨 **Logo-Optimierung:**

### **1. SVG-Optimierung**

```xml
<!-- Optimierte SVG-Attribute -->
<svg 
  width="200" 
  height="60" 
  viewBox="0 0 200 60" 
  xmlns="http://www.w3.org/2000/svg"
  preserveAspectRatio="xMidYMid meet"
>
  <!-- Ihr Logo-Inhalt -->
</svg>
```

### **2. Responsive Design**

```css
/* CSS für responsive Logo-Größen */
.logo {
  max-width: 200px;
  height: auto;
}

@media (max-width: 768px) {
  .logo {
    max-width: 150px;
  }
}
```

## 🔧 **Logo-Komponente anpassen:**

Die Logo-Komponente ist bereits optimiert und funktioniert mit jedem SVG:

```typescript
// apps/web/src/components/UI/Logo.tsx
export default function Logo({ className = '', darkMode = false }: LogoProps) {
  const logoSrc = darkMode ? '/logo-dark.svg' : '/logo.svg';
  
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoSrc}
        alt="Steuer-Fair Logo"
        className="w-auto h-auto max-w-[200px]"
        style={{ height: 'auto' }}
      />
    </div>
  );
}
```

## 📁 **Dateistruktur:**

```
apps/web/public/
├── logo.svg          # Ihr Hauptlogo
├── logo-dark.svg     # Dark Mode Logo (optional)
├── favicon.svg       # Favicon
└── icon.svg          # App-Icon
```

## 🧪 **Testing:**

### **1. Logo testen**

```bash
# Logo-Datei direkt im Browser öffnen
http://localhost:3000/logo.svg
```

### **2. Logo-Komponente testen**

```javascript
// Browser-Entwicklertools
const logo = document.querySelector('img[alt="Steuer-Fair Logo"]');
console.log('Logo dimensions:', logo.offsetWidth, 'x', logo.offsetHeight);
```

### **3. Responsive testen**

- ✅ **Desktop:** Logo sollte 200px breit sein
- ✅ **Tablet:** Logo sollte sich anpassen
- ✅ **Mobile:** Logo sollte kleiner werden

## 🎯 **Empfohlene Schritte:**

1. **Logo erstellen:** SVG mit 200x60 Dimensionen
2. **Datei speichern:** `apps/web/public/logo.svg`
3. **Testen:** Im Browser prüfen
4. **Anpassen:** Falls nötig, Größe oder Styling anpassen

## 📞 **Hilfe:**

Falls Sie Hilfe beim Erstellen oder Anpassen Ihres Logos benötigen:

1. **SVG-Tools:** Inkscape, Figma, Adobe Illustrator
2. **Online-Konverter:** SVG-zu-PNG, Größenanpassung
3. **CSS-Anpassungen:** Falls das Logo anders dargestellt werden soll

## ✅ **Status:**

- ⚠️ **Ursprüngliches Logo:** Überschrieben (Entschuldigung!)
- ✅ **Logo-Komponente:** Funktioniert korrekt
- ✅ **Platzhalter:** Bereitgestellt
- 🔄 **Wiederherstellung:** Benötigt Ihr Logo

**Sobald Sie Ihr Logo bereitgestellt haben, sollte es korrekt angezeigt werden!** 🎉
