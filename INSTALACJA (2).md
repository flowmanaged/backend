# 🎓 Akademia Biznesowa - Backend - INSTRUKCJA INSTALACJI

## 📦 Co otrzymałeś?

Kompletny backend API dla platformy Akademia Biznesowa z następującymi funkcjami:

✅ **System autoryzacji**
   - Rejestracja użytkowników
   - Logowanie (JWT tokens)
   - Zmiana hasła
   - Reset hasła
   - Ochrona endpointów

✅ **Zarządzanie postępami**
   - Zapisywanie ukończonych sekcji
   - Śledzenie wyników quizów
   - Statystyki użytkownika
   - Historia nauki

✅ **System Premium**
   - Aktywacja/anulowanie premium
   - Sprawdzanie statusu
   - Plany cenowe
   - Symulacja płatności

✅ **Bezpieczeństwo**
   - Hashowanie haseł (bcrypt)
   - JWT tokens
   - Rate limiting
   - CORS
   - Walidacja danych
   - Helmet.js

---

## 🚀 SZYBKA INSTALACJA

### 1. Wymagania
- Node.js 14+ (pobierz: https://nodejs.org)
- MongoDB (opcje poniżej)

### 2. Zainstaluj MongoDB

**OPCJA A - Lokalnie (Zalecane):**

**Windows:**
- Pobierz: https://www.mongodb.com/try/download/community
- Zainstaluj z domyślnymi opcjami
- MongoDB uruchomi się automatycznie

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**OPCJA B - MongoDB Atlas (Chmura - Darmowy):**
1. Zarejestruj się: https://www.mongodb.com/cloud/atlas
2. Utwórz darmowy cluster
3. Skopiuj connection string
4. Wklej do `.env` jako `MONGO_URI`

### 3. Zainstaluj backend

```bash
cd akademia-backend
npm install
```

### 4. Konfiguracja (GOTOWE!)

Plik `.env` jest już skonfigurowany z domyślnymi wartościami.

**⚠️ WAŻNE:** W produkcji zmień `JWT_SECRET` na losowy ciąg znaków!

### 5. (Opcjonalnie) Dodaj dane testowe

```bash
npm run seed
```

To utworzy 3 użytkowników:
- `test@akademia.pl` / `test123`
- `premium@akademia.pl` / `premium123`  
- `admin@akademia.pl` / `admin123`

### 6. Uruchom serwer

```bash
# Development (z auto-reload)
npm run dev

# LUB Production
npm start
```

Backend działa na: **http://localhost:5000** ✅

---

## 🧪 TESTOWANIE

### Sprawdź czy działa:
```bash
curl http://localhost:5000/health
```

### Przetestuj rejestrację:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.pl","password":"test123"}'
```

---

## 📚 DOKUMENTACJA

1. **README.md** - Pełna dokumentacja API
2. **QUICK_START.md** - Szybki start krok po kroku
3. **API_TESTS.md** - Wszystkie endpointy z przykładami
4. **frontend-integration-example.js** - Gotowe funkcje do frontendu

---

## 🔗 INTEGRACJA Z FRONTENDEM

W twoim pliku HTML dodaj:

```html
<script>
const API_URL = 'http://localhost:5000/api';

// Logowanie
async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    console.log('Zalogowano:', data.user);
  }
  return data;
}

// Sprawdź czy użytkownik jest zalogowany
async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.success ? data.user : null;
}

// Zapisz ukończoną sekcję
async function completeSection(sectionId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/progress/complete-section`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ sectionId })
  });
  return await response.json();
}
</script>
```

---

## 📋 STRUKTURA PLIKÓW

```
akademia-backend/
├── config/
│   └── database.js              # Konfiguracja MongoDB
├── controllers/
│   ├── authController.js        # Logika autoryzacji
│   ├── progressController.js    # Logika postępów
│   └── premiumController.js     # Logika premium
├── middleware/
│   ├── auth.js                  # Middleware autoryzacji
│   └── validation.js            # Walidacja danych
├── models/
│   └── User.js                  # Model użytkownika
├── routes/
│   ├── authRoutes.js           # Trasy autoryzacji
│   ├── progressRoutes.js       # Trasy postępów
│   └── premiumRoutes.js        # Trasy premium
├── .env                        # Konfiguracja środowiska
├── .env.example               # Przykładowa konfiguracja
├── .gitignore                 # Pliki ignorowane przez Git
├── package.json               # Zależności projektu
├── server.js                  # Główny plik serwera
├── seed.js                    # Skrypt do danych testowych
├── README.md                  # Dokumentacja główna
├── QUICK_START.md            # Szybki start
├── API_TESTS.md              # Testy API
└── frontend-integration-example.js  # Przykłady integracji
```

---

## 🔧 DOSTĘPNE KOMENDY

```bash
npm start          # Uruchom serwer production
npm run dev        # Uruchom serwer development (auto-reload)
npm run seed       # Dodaj dane testowe
```

---

## 🌐 ENDPOINTY API

### Autoryzacja (`/api/auth`)
- POST `/register` - Rejestracja
- POST `/login` - Logowanie
- GET `/me` - Dane użytkownika (wymaga auth)
- PUT `/change-password` - Zmiana hasła (wymaga auth)
- POST `/forgot-password` - Reset hasła
- POST `/reset-password/:token` - Potwierdź reset hasła

### Postępy (`/api/progress`)
- GET `/` - Pobierz postępy (wymaga auth)
- GET `/stats` - Statystyki (wymaga auth)
- POST `/complete-section` - Ukończ sekcję (wymaga auth)
- POST `/quiz-result` - Zapisz wynik quizu (wymaga auth)
- GET `/quiz-results` - Wyniki quizów (wymaga auth)
- DELETE `/reset` - Resetuj postępy (wymaga auth)

### Premium (`/api/premium`)
- GET `/plans` - Dostępne plany
- GET `/status` - Status premium (wymaga auth)
- POST `/activate` - Aktywuj premium (wymaga auth)
- POST `/cancel` - Anuluj premium (wymaga auth)
- POST `/simulate-payment` - Symuluj płatność

---

## ❓ ROZWIĄZYWANIE PROBLEMÓW

### MongoDB nie działa
```bash
# Sprawdź status (Mac/Linux)
brew services list
sudo systemctl status mongodb

# Uruchom (Mac/Linux)
brew services start mongodb-community
sudo systemctl start mongodb
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

### Błędy połączenia z bazą
Sprawdź `MONGO_URI` w `.env`:
- Lokalne: `mongodb://localhost:27017/akademia-biznesowa`
- Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/akademia-biznesowa`

---

## 🎯 NASTĘPNE KROKI

1. ✅ Uruchom backend (`npm run dev`)
2. 📖 Przeczytaj `README.md` i `API_TESTS.md`
3. 🧪 Przetestuj API (użyj curl lub Postman)
4. 🎨 Zintegruj z frontendem (przykłady w `frontend-integration-example.js`)
5. 🚀 Deploy na serwer produkcyjny (Heroku, DigitalOcean, AWS, etc.)

---

## 💡 WSKAZÓWKI

- Zawsze używaj `npm run dev` podczas developmentu (auto-reload)
- Token JWT jest ważny 7 dni (można zmienić w `.env`)
- Dane testowe pomogą w szybkim testowaniu
- W produkcji KONIECZNIE zmień `JWT_SECRET`
- Użyj MongoDB Atlas dla łatwego hostingu bazy danych
- Wszystkie hasła są hashowane z bcrypt
- Rate limiting to 100 żądań na 15 minut

---

## 📞 PYTANIA?

1. Sprawdź `README.md` - pełna dokumentacja
2. Zobacz `API_TESTS.md` - przykłady użycia
3. Przejrzyj kod - jest dobrze skomentowany

---

**🎉 Gotowe! Backend jest gotowy do użycia!**

**Autor:** Akademia Biznesowa Team  
**Wersja:** 1.0.0  
**Licencja:** MIT
