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
