# 🚀 Quick Start Guide - Akademia Biznesowa Backend

Szybki start w 5 krokach!

## Krok 1: Zainstaluj MongoDB

### Opcja A: MongoDB Lokalnie (Zalecane dla developmentu)

**Windows:**
1. Pobierz: https://www.mongodb.com/try/download/community
2. Zainstaluj z domyślnymi ustawieniami
3. MongoDB będzie działać automatycznie jako serwis

**Mac (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Opcja B: MongoDB Atlas (Chmura - Darmowy tier)

1. Zarejestruj się: https://www.mongodb.com/cloud/atlas
2. Utwórz darmowy cluster (M0)
3. Skopiuj connection string
4. Wklej do `.env` jako `MONGO_URI`

## Krok 2: Zainstaluj zależności

```bash
npm install
```

## Krok 3: Sprawdź konfigurację

Plik `.env` jest już skonfigurowany z domyślnymi wartościami.

**WAŻNE:** W produkcji zmień `JWT_SECRET` na losowy ciąg znaków!

## Krok 4: (Opcjonalnie) Dodaj dane testowe

```bash
npm run seed
```

To utworzy 3 użytkowników testowych:
- `test@akademia.pl` / `test123` (zwykły użytkownik)
- `premium@akademia.pl` / `premium123` (użytkownik premium)
- `admin@akademia.pl` / `admin123` (admin z rocznym premium)

## Krok 5: Uruchom serwer

```bash
# Development (z auto-reload)
npm run dev

# Production
npm start
```

Serwer będzie działać na: **http://localhost:5000**

---

## ✅ Sprawdź czy działa

Otwórz przeglądarkę lub użyj curl:

```bash
curl http://localhost:5000/health
```

Powinieneś zobaczyć:
```json
{
  "success": true,
  "status": "OK",
  "timestamp": "2025-01-..."
}
```

---

## 🧪 Przetestuj API

### 1. Zarejestruj użytkownika

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.pl","password":"test123"}'
```

### 2. Zaloguj się

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.pl","password":"test123"}'
```

Skopiuj token z odpowiedzi!

### 3. Pobierz swoje dane

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TWOJ_TOKEN"
```

---

## 🔗 Połącz z Frontendem

W frontendzie (HTML, React, Vue) użyj:

```javascript
const API_URL = 'http://localhost:5000/api';

// Przykład logowania
const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    return data.user;
  }
  throw new Error(data.message);
};

// Przykład autoryzowanego żądania
const getProgress = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/progress`, {
    headers: { 
      'Authorization': `Bearer ${token}` 
    }
  });
  return await response.json();
};
```

---

## 📝 Następne kroki

1. ✅ Backend działa
2. 📖 Przeczytaj pełną dokumentację w `README.md`
3. 🧪 Przetestuj wszystkie endpointy z `API_TESTS.md`
4. 🎨 Połącz ze swoim frontendem
5. 🚀 Deploy na serwer produkcyjny

---

## ❓ Problemy?

### MongoDB nie działa
```bash
# Sprawdź status
# Mac/Linux:
brew services list
# lub
sudo systemctl status mongodb

# Uruchom ponownie
brew services restart mongodb-community
# lub
sudo systemctl restart mongodb
```

### Port 5000 zajęty
Zmień w `.env`:
```
PORT=3001
```

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Przydatne komendy

```bash
# Uruchom serwer development
npm run dev

# Uruchom serwer production
npm start

# Dodaj dane testowe
npm run seed

# Sprawdź MongoDB
mongosh
# lub
mongo
```

---

**🎉 Gotowe! Backend działa!**

Teraz możesz zacząć korzystać z API w swoim projekcie frontend.
