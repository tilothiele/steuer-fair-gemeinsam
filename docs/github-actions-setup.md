# GitHub Actions Setup für Docker Images

## Übersicht

Der GitHub Actions Workflow erstellt automatisch Docker Images für Backend und Frontend, wenn ein Release in GitHub erstellt wird.

## Workflow-Details

### **Trigger**
- ✅ **Nur bei Releases** - Workflow startet nur bei `release: types: [published]`
- ✅ **Manueller Release** - Images werden nur bei manuell erstellten Releases gebaut
- ✅ **Tag-basiert** - Image-Tag entspricht dem GitHub Release Tag

### **Docker Images**
- ✅ **Backend**: `tilothiele/steuer-fair-api:tag`
- ✅ **Frontend**: `tilothiele/steuer-fair-web:tag`
- ✅ **Registry**: Docker Hub (`docker.io`)

## Setup-Anleitung

### **1. Docker Hub Token erstellen**

1. **Docker Hub Account**:
   - Gehen Sie zu https://hub.docker.com/
   - Melden Sie sich mit Ihrem Account `tilothiele` an

2. **Access Token erstellen**:
   - Klicken Sie auf Ihr Profil → "Account Settings"
   - Gehen Sie zu "Security" → "New Access Token"
   - Geben Sie einen Namen ein (z.B. "GitHub Actions")
   - Wählen Sie "Read & Write" Berechtigungen
   - Kopieren Sie den Token

### **2. GitHub Secret hinzufügen**

1. **Repository Secrets**:
   - Gehen Sie zu Ihrem GitHub Repository
   - Klicken Sie auf "Settings" → "Secrets and variables" → "Actions"
   - Klicken Sie auf "New repository secret"

2. **Secret konfigurieren**:
   - **Name**: `DOCKERHUB_TOKEN`
   - **Value**: Den kopierten Docker Hub Token einfügen
   - Klicken Sie auf "Add secret"

### **3. Release erstellen**

1. **Tag erstellen**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub Release**:
   - Gehen Sie zu "Releases" in Ihrem Repository
   - Klicken Sie auf "Create a new release"
   - Wählen Sie den Tag aus (z.B. `v1.0.0`)
   - Füllen Sie Titel und Beschreibung aus
   - Klicken Sie auf "Publish release"

## Workflow-Schritte

### **1. Checkout**
```yaml
- name: Checkout code
  uses: actions/checkout@v4
```

### **2. Docker Setup**
```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
```

### **3. Docker Hub Login**
```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    registry: docker.io
    username: tilothiele
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

### **4. Build & Push API**
```yaml
- name: Build and push API image
  uses: docker/build-push-action@v5
  with:
    context: ./apps/api
    file: ./apps/api/Dockerfile
    push: true
    tags: tilothiele/steuer-fair-api:${{ github.event.release.tag_name }}
```

### **5. Build & Push Web**
```yaml
- name: Build and push Web image
  uses: docker/build-push-action@v5
  with:
    context: ./apps/web
    file: ./apps/web/Dockerfile
    push: true
    tags: tilothiele/steuer-fair-web:${{ github.event.release.tag_name }}
```

## Beispiel-Output

### **Release Tag**: `v1.0.0`

**Erstellte Images**:
- `tilothiele/steuer-fair-api:v1.0.0`
- `tilothiele/steuer-fair-web:v1.0.0`

**Docker Hub URL**:
- https://hub.docker.com/r/tilothiele/steuer-fair-api
- https://hub.docker.com/r/tilothiele/steuer-fair-web

## Features

### ✅ **Automatisierung**
- Keine manuelle Arbeit nötig
- Images werden automatisch bei Release erstellt
- Push zu Docker Hub erfolgt automatisch

### ✅ **Tag-basierte Versionierung**
- Image-Tag entspricht Release-Tag
- Klare Versionierung
- Einfache Rollbacks möglich

### ✅ **Caching**
- GitHub Actions Cache für schnellere Builds
- Layer-Caching zwischen Builds
- Optimierte Build-Zeiten

### ✅ **Sicherheit**
- Docker Hub Token als Secret
- Sichere Authentifizierung
- Keine Credentials im Code

## Troubleshooting

### **Workflow startet nicht**
- ✅ Prüfen Sie, ob ein Release erstellt wurde
- ✅ Prüfen Sie, ob der Release "published" ist
- ✅ Prüfen Sie die Workflow-Datei im `.github/workflows/` Ordner

### **Docker Hub Login fehlgeschlagen**
- ✅ Prüfen Sie den `DOCKERHUB_TOKEN` Secret
- ✅ Prüfen Sie die Token-Berechtigungen
- ✅ Prüfen Sie den Docker Hub Account-Namen

### **Build fehlgeschlagen**
- ✅ Prüfen Sie die Dockerfiles in `apps/api/` und `apps/web/`
- ✅ Prüfen Sie die Build-Kontexte
- ✅ Prüfen Sie die GitHub Actions Logs

## Nächste Schritte

1. **Docker Hub Token erstellen**
2. **GitHub Secret hinzufügen**
3. **Ersten Release erstellen**
4. **Images auf Docker Hub prüfen**
5. **Deployment mit neuen Images testen**
