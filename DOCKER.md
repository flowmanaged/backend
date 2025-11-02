# 🐳 Docker - Akademia Biznesowa Backend

## Uruchomienie z Docker

### Wymagania
- Docker Desktop (Windows/Mac) lub Docker Engine (Linux)
- Docker Compose

### Instalacja Docker

**Windows/Mac:**
Pobierz Docker Desktop: https://www.docker.com/products/docker-desktop

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

---

## 🚀 Szybki start

### Opcja 1: Docker Compose (Zalecane)

Docker Compose automatycznie uruchomi MongoDB i backend:

```bash
# W katalogu akademia-backend
docker-compose up -d
```

To polecenie:
- Pobierze obrazy MongoDB i Node.js
- Stworzy kontener MongoDB z bazą danych
- Zbuduje i uruchomi backend
- Połączy je w sieci Docker

Backend będzie dostępny na: **http://localhost:5000**

### Opcja 2: Ręczne uruchomienie

```bash
# 1. Zbuduj obraz
docker build -t akademia-backend .

# 2. Uruchom MongoDB
docker run -d \
  --name akademia-mongodb \
  -p 27017:27017 \
  mongo:7

# 3. Uruchom backend
docker run -d \
  --name akademia-backend \
  -p 5000:5000 \
  --link akademia-mongodb:mongodb \
  -e MONGO_URI=mongodb://mongodb:27017/akademia-biznesowa \
  -e JWT_SECRET=twoj_tajny_klucz \
  akademia-backend
```

---

## 📋 Podstawowe komendy

### Docker Compose

```bash
# Uruchom wszystko
docker-compose up -d

# Uruchom z logami w konsoli
docker-compose up

# Zatrzymaj wszystko
docker-compose down

# Zatrzymaj i usuń wszystkie dane
docker-compose down -v

# Zobacz logi
docker-compose logs -f

# Zobacz logi tylko backendu
docker-compose logs -f backend

# Zrestartuj serwisy
docker-compose restart

# Odbuduj i uruchom ponownie
docker-compose up -d --build
```

### Docker (bez compose)

```bash
# Zobacz uruchomione kontenery
docker ps

# Zobacz wszystkie kontenery
docker ps -a

# Zobacz logi
docker logs akademia-backend

# Logi na żywo
docker logs -f akademia-backend

# Zatrzymaj kontener
docker stop akademia-backend

# Uruchom zatrzymany kontener
docker start akademia-backend

# Usuń kontener
docker rm akademia-backend

# Wejdź do kontenera (shell)
docker exec -it akademia-backend sh
```

---

## 🔍 Weryfikacja

### Sprawdź czy działa:

```bash
# Sprawdź status kontenerów
docker-compose ps

# Powinno pokazać:
# NAME                  STATUS
# akademia-backend      Up (healthy)
# akademia-mongodb      Up (healthy)

# Sprawdź health check
curl http://localhost:5000/health

# Powinno zwrócić:
# {"success":true,"status":"OK"}
```

---

## 🛠 Konfiguracja

### Zmienne środowiskowe

Możesz zmienić konfigurację w `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=5000
  - MONGO_URI=mongodb://mongodb:27017/akademia-biznesowa
  - JWT_SECRET=twoj_super_tajny_klucz  # ZMIEŃ TO!
  - JWT_EXPIRE=7d
  - CLIENT_URL=http://localhost:3000
```

Lub utwórz plik `.env.docker`:

```env
JWT_SECRET=super_bezpieczny_klucz_produkcyjny_123456789
NODE_ENV=production
CLIENT_URL=https://twoja-domena.pl
```

I użyj go:
```bash
docker-compose --env-file .env.docker up -d
```

---

## 📊 Monitorowanie

### Logi

```bash
# Wszystkie logi
docker-compose logs -f

# Tylko backend
docker-compose logs -f backend

# Tylko MongoDB
docker-compose logs -f mongodb

# Ostatnie 100 linii
docker-compose logs --tail=100 backend
```

### Statystyki zasobów

```bash
# Użycie CPU/RAM
docker stats

# Dla konkretnego kontenera
docker stats akademia-backend
```

---

## 🗄 Zarządzanie danymi

### Backup bazy danych

```bash
# Export bazy
docker exec akademia-mongodb mongodump \
  --db=akademia-biznesowa \
  --out=/tmp/backup

# Skopiuj backup na host
docker cp akademia-mongodb:/tmp/backup ./backup
```

### Restore bazy danych

```bash
# Skopiuj backup do kontenera
docker cp ./backup akademia-mongodb:/tmp/backup

# Restore
docker exec akademia-mongodb mongorestore \
  --db=akademia-biznesowa \
  /tmp/backup/akademia-biznesowa
```

### Usuń wszystkie dane

```bash
# Zatrzymaj i usuń kontenery wraz z wolumenami
docker-compose down -v

# Usuń obraz
docker rmi akademia-backend
```

---

## 🔧 Rozwój z Docker

### Development mode

Utwórz `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - MONGO_URI=mongodb://mongodb:27017/akademia-biznesowa
    command: npm run dev

volumes:
  mongodb_data:
```

Uruchom:
```bash
docker-compose -f docker-compose.dev.yml up
```

### Hot reload w Dockerze

Aby mieć hot reload (automatyczne przeładowanie przy zmianach):

1. Zainstaluj nodemon lokalnie
2. Użyj volumens w docker-compose
3. Uruchom z `npm run dev`

---

## 🚀 Deployment

### Produkcja

```bash
# 1. Zbuduj obraz
docker build -t akademia-backend:1.0 .

# 2. Oznacz dla registry
docker tag akademia-backend:1.0 yourusername/akademia-backend:1.0

# 3. Wypchnij do Docker Hub
docker push yourusername/akademia-backend:1.0

# 4. Na serwerze produkcyjnym
docker pull yourusername/akademia-backend:1.0
docker-compose -f docker-compose.prod.yml up -d
```

---

## ❓ Troubleshooting

### Port jest zajęty

Zmień port w `docker-compose.yml`:
```yaml
ports:
  - "3001:5000"  # Zmień 5000 na inny port
```

### Kontener się nie uruchamia

```bash
# Zobacz logi błędów
docker-compose logs backend

# Sprawdź status
docker-compose ps

# Sprawdź konfigurację
docker-compose config
```

### MongoDB nie działa

```bash
# Sprawdź status
docker-compose ps mongodb

# Zobacz logi
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Brak połączenia między kontenerami

```bash
# Sprawdź sieci
docker network ls

# Sprawdź szczegóły sieci
docker network inspect akademia-backend_akademia-network

# Restart wszystkiego
docker-compose down
docker-compose up -d
```

### Reset wszystkiego

```bash
# Usuń wszystko i zacznij od nowa
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

---

## 📚 Dodatkowe zasoby

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## 💡 Wskazówki

- Używaj `docker-compose` dla łatwego zarządzania
- Zawsze backupuj dane przed aktualizacją
- W produkcji używaj konkretnych wersji obrazów (np. `mongo:7.0.5`)
- Nie commituj pliku `.env` do repozytorium
- Regularnie aktualizuj obrazy: `docker-compose pull`

---

**🐳 Docker ułatwia deployment i skalowanie aplikacji!**
