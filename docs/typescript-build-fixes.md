# TypeScript Build Fixes

## Problem

Der Docker Build schlug fehl mit TypeScript-Fehlern:
```
1.386 src/types/tax-models.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
1.388 src/types/tax-models.ts(131,14): error TS7006: Parameter 'value' implicitly has an 'any' type.
```

## Ursache

1. **Shared Package nicht gebaut**: Das shared Package wurde nicht kompiliert, bevor die Apps es verwenden
2. **TypeScript-Konfiguration**: Fehlende `moduleResolution` in tsconfig.json
3. **Implizite any-Typen**: Parameter in Zod refine-Funktion hatte keinen expliziten Typ
4. **API-Komponenten veraltet**: API-Code verwendete noch die entfernten Felder (allowances, specialExpenses, etc.)
5. **Interface-Konflikte**: Namenskonflikte zwischen Komponenten und Typen

## Lösung

### **1. Shared Package Build im Dockerfile**

**API Dockerfile:**
```dockerfile
# Copy shared package first
COPY packages/shared ./packages/shared

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build
WORKDIR /app
```

**Web Dockerfile:**
```dockerfile
# Copy shared package first
COPY packages/shared ./packages/shared

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build
WORKDIR /app
```

### **2. TypeScript-Konfiguration korrigiert**

**Vorher:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true
  }
}
```

**Nachher:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  }
}
```

### **3. Explizite Typisierung**

**Vorher:**
```typescript
.refine((value) => {
  // ...
}, 'Login-ID muss alphanumerisch...')
```

**Nachher:**
```typescript
.refine((value: string) => {
  // ...
}, 'Login-ID muss alphanumerisch...')
```

### **4. API-Komponenten aktualisiert**

**TaxRepository (API):**
- ✅ **Entfernte Felder**: allowances, specialExpenses, extraordinaryExpenses, childAllowance
- ✅ **Hinzugefügt**: calculationMode zu JointTaxData
- ✅ **SQL-Queries**: Aktualisiert für neue Struktur
- ✅ **Return-Objekte**: Angepasst an neue Typen

**PDF-Service (API):**
- ✅ **Entfernte Felder**: Werbungskosten, Sonderausgaben, etc. aus PDF-Template
- ✅ **Variable-Fix**: `userId` → `user?.id` in pdf.ts

**PDF-Route (API):**
- ✅ **Variable-Fix**: `userId` → `user?.id || 'unknown'`

### **5. Web-Komponenten aktualisiert**

**Profile Page:**
- ✅ **User-Interface**: Angepasst an shared Package User-Typ
- ✅ **Import**: User-Typ aus @steuer-fair/shared importiert
- ✅ **State-Management**: Korrekte Typisierung

**TaxCalculator:**
- ✅ **Entfernte Felder**: allowances, specialExpenses, etc. aus Initialisierung
- ✅ **calculationMode**: Hinzugefügt zu JointTaxData
- ✅ **Reset-Funktion**: Aktualisiert

**TaxCalculationResult:**
- ✅ **Namenskonflikt**: `TaxCalculationResult as TaxCalculationResultType`
- ✅ **Interface**: Korrekte Typisierung

**API Service:**
- ✅ **Import**: User-Typ hinzugefügt
- ✅ **Methoden**: Korrekte Rückgabetypen

## Build-Prozess

### **1. Shared Package Build**
```bash
# Im shared Package Verzeichnis
cd packages/shared
npm install
npm run build
```

### **2. Apps verwenden gebautes Package**
```bash
# In den Apps
npm install
npm run build
```

### **3. Docker Build-Prozess**
1. ✅ **Shared Package kopieren**
2. ✅ **Dependencies installieren**
3. ✅ **Shared Package bauen**
4. ✅ **Apps bauen**

## Vorteile der Lösung

### ✅ **Korrekte Abhängigkeiten**
- Shared Package wird vor den Apps gebaut
- TypeScript-Deklarationen sind verfügbar
- Zod-Module wird korrekt aufgelöst

### ✅ **TypeScript-Konfiguration**
- `moduleResolution: "node"` für korrekte Modul-Auflösung
- Explizite Typisierung verhindert `any`-Typen
- Strikte TypeScript-Prüfung

### ✅ **Docker Build-Prozess**
- Vollständiger Build-Prozess
- Korrekte Reihenfolge der Build-Schritte
- Wiederverwendbare shared Komponenten
- Moderne ENV-Syntax (`key=value` statt `key value`)

### ✅ **API-Konsistenz**
- Alle Komponenten verwenden die gleichen Typen
- Keine veralteten Felder mehr
- Korrekte Datenbank-Interaktion

### ✅ **Web-Konsistenz**
- Einheitliche User-Interfaces
- Korrekte Typisierung in allen Komponenten
- Keine Namenskonflikte

## Nächste Schritte

1. **Build testen** - Neuen Release erstellen
2. **TypeScript-Fehler prüfen** - Sicherstellen, dass keine TS-Fehler auftreten
3. **Images testen** - Lokale Tests der Docker Images

## Troubleshooting

### **Zod-Module nicht gefunden**
- ✅ Prüfen Sie, ob das shared Package gebaut wurde
- ✅ Stellen Sie sicher, dass `zod` in den Dependencies steht
- ✅ Prüfen Sie die `moduleResolution` in tsconfig.json

### **Implizite any-Typen**
- ✅ Explizite Typisierung für alle Parameter
- ✅ `strict: true` in tsconfig.json aktiviert
- ✅ TypeScript-Kompilierung prüfen

### **Build-Reihenfolge**
- ✅ Shared Package wird vor den Apps gebaut
- ✅ Dependencies werden korrekt installiert
- ✅ Build-Kontext ist korrekt gesetzt

### **API-Komponenten**
- ✅ Alle veralteten Felder entfernt
- ✅ calculationMode hinzugefügt
- ✅ SQL-Queries aktualisiert

### **Web-Komponenten**
- ✅ User-Interface konsistent
- ✅ Namenskonflikte behoben
- ✅ Korrekte Typisierung
