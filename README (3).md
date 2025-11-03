# 🎓 Akademia Biznesowa - Backend API

Backend API dla platformy e-learningowej "Akademia Biznesowa" - interaktywnej platformy do nauki analizy biznesowej.

## 📋 Spis treści

- [Funkcjonalności](#funkcjonalności)
- [Technologie](#technologie)
- [Instalacja](#instalacja)
- [Konfiguracja](#konfiguracja)
- [Uruchomienie](#uruchomienie)
- [Dokumentacja API](#dokumentacja-api)
- [Struktura projektu](#struktura-projektu)
- [Bezpieczeństwo](#bezpieczeństwo)

## ✨ Funkcjonalności

### 🔐 Autoryzacja i Uwierzytelnianie
- ✅ Rejestracja użytkowników z walidacją
- ✅ Logowanie z JWT tokenami
- ✅ Zmiana hasła
- ✅ Reset hasła (z tokenem)
- ✅ Ochrona endpointów

### 📚 Zarządzanie Postępami
- ✅ Zapisywanie ukończonych sekcji
- ✅ Śledzenie wyników quizów
- ✅ Statystyki użytkownika
- ✅ Historia nauki
- ✅ Reset postępów

### 💎 System Premium
- ✅ Sprawdzanie statusu premium
- ✅ Aktywacja konta premium
- ✅ Anulowanie subskrypcji
- ✅ Plany cenowe
- ✅ Symulacja płatności (do testów)

## 🛠 Technologie

- **Node.js** - środowisko wykonawcze
- **Express.js** - framework webowy
- **MongoDB** - baza danych NoSQL
- **Mongoose** - ODM dla MongoDB
- **JWT** - tokeny autoryzacyjne
- **bcryptjs** - hashowanie haseł
- **express-validator** - walidacja danych
- **helmet** - bezpieczeństwo HTTP
- **cors** - Cross-Origin Resource Sharing
- **express-rate-limit** - ograniczanie żądań

## 📦 Instalacja

1. **Sklonuj repozytorium** (lub skopiuj pliki)
```bash
cd akademia-backend
```

2. **Zainstaluj zależności**
```bash
npm install
```

3. **Zainstaluj MongoDB**
   - [Pobierz MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Lub użyj MongoDB Atlas (chmura): [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)

## ⚙️ Konfiguracja

1. **Skopiuj plik .env.example do .env**
```bash
cp .env.example .env
```

2. **Edytuj plik .env** i ustaw swoje wartości:

```env
NODE_ENV=development
PORT=5000

# MongoDB - lokalna baza danych
MONGO_URI=mongodb://localhost:27017/akademia-biznesowa

# Lub MongoDB Atlas (chmura)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/akademia-biznesowa

# JWT Secret - zmień na losowy ciąg znaków!
JWT_SECRET=twoj_super_tajny_klucz_jwt_zmien_to_w_produkcji
JWT_EXPIRE=7d

# CORS
CLIENT_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Uruchomienie

### Development (z auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

Serwer będzie dostępny pod adresem: **http://localhost:5000**

## 📖 Dokumentacja API

### Base URL
```
http://localhost:5000/api
```

### Endpointy

#### 🔐 Autoryzacja (`/api/auth`)

| Metoda | Endpoint | Opis | Auth |
|--------|----------|------|------|
| POST | `/auth/register` | Rejestracja użytkownika | Nie |
| POST | `/auth/login` | Logowanie użytkownika | Nie |
| GET | `/auth/me` | Pobierz dane zalogowanego | Tak |
| PUT | `/auth/change-password` | Zmień hasło | Tak |
| POST | `/auth/forgot-password` | Żądanie resetu hasła | Nie |
| POST | `/auth/reset-password/:token` | Reset hasła | Nie |

**Przykład rejestracji:**
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "haslo123",
  "name": "Jan Kowalski"
}
```

**Przykład logowania:**
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "haslo123"
}

// Odpowiedź:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "isPremium": false,
    "completedSections": []
  }
}
```

#### 📚 Postępy (`/api/progress`)

| Metoda | Endpoint | Opis | Auth |
|--------|----------|------|------|
| GET | `/progress` | Pobierz postępy | Tak |
| GET | `/progress/stats` | Statystyki użytkownika | Tak |
| POST | `/progress/complete-section` | Oznacz sekcję jako ukończoną | Tak |
| POST | `/progress/quiz-result` | Zapisz wynik quizu | Tak |
| GET | `/progress/quiz-results` | Pobierz wyniki quizów | Tak |
| DELETE | `/progress/reset` | Resetuj postępy | Tak |

**Przykład ukończenia sekcji:**
```javascript
POST /api/progress/complete-section
Authorization: Bearer <token>
Content-Type: application/json

{
  "sectionId": 1
}
```

**Przykład zapisu wyniku quizu:**
```javascript
POST /api/progress/quiz-result
Authorization: Bearer <token>
Content-Type: application/json

{
  "quizId": "quiz-1",
  "score": 8,
  "totalQuestions": 10,
  "answers": {
    "q1": 0,
    "q2": 1,
    "q3": 2
  }
}
```

#### 💎 Premium (`/api/premium`)

| Metoda | Endpoint | Opis | Auth |
|--------|----------|------|------|
| GET | `/premium/plans` | Dostępne plany | Nie |
| GET | `/premium/status` | Status premium użytkownika | Tak |
| POST | `/premium/activate` | Aktywuj premium | Tak |
| POST | `/premium/cancel` | Anuluj premium | Tak |
| POST | `/premium/simulate-payment` | Symulacja płatności | Nie |

**Przykład symulacji płatności:**
```javascript
POST /api/premium/simulate-payment
Content-Type: application/json

{
  "email": "user@example.com",
  "plan": "monthly"
}
```

### Autoryzacja

Wszystkie chronione endpointy wymagają tokena JWT w headerze:

```javascript
Authorization: Bearer <twoj_token_jwt>
```

### Odpowiedzi API

**Sukces:**
```json
{
  "success": true,
  "message": "Operacja wykonana pomyślnie",
  "data": { ... }
}
```

**Błąd:**
```json
{
  "success": false,
  "message": "Opis błędu",
  "errors": [ ... ]
}
```

## 📁 Struktura projektu

```
akademia-backend/
├── config/
│   └── database.js          # Konfiguracja MongoDB
├── controllers/
│   ├── authController.js    # Logika autoryzacji
│   ├── progressController.js # Logika postępów
│   └── premiumController.js  # Logika premium
├── middleware/
│   ├── auth.js              # Middleware autoryzacji
│   └── validation.js        # Walidacja danych
├── models/
│   └── User.js              # Model użytkownika
├── routes/
│   ├── authRoutes.js        # Trasy autoryzacji
│   ├── progressRoutes.js    # Trasy postępów
│   └── premiumRoutes.js     # Trasy premium
├── .env.example             # Przykładowa konfiguracja
├── .gitignore              # Pliki ignorowane przez Git
├── package.json            # Zależności projektu
├── README.md              # Dokumentacja
└── server.js              # Główny plik serwera
```

## 🔒 Bezpieczeństwo

- ✅ Hashowanie haseł z bcrypt
- ✅ JWT tokeny do autoryzacji
- ✅ Helmet.js dla zabezpieczeń HTTP
- ✅ Rate limiting
- ✅ CORS skonfigurowany
- ✅ Walidacja danych wejściowych
- ✅ Ochrona przed SQL/NoSQL injection
- ✅ Sanityzacja danych

## 🔄 Integracja z Frontendem

### Przykład użycia w JavaScript/React:

```javascript
// Rejestracja
const register = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  
  if (data.success) {
    // Zapisz token
    localStorage.setItem('token', data.token);
  }
  return data;
};

// Logowanie
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

// Pobierz dane użytkownika
const getMe = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};

// Zapisz ukończoną sekcję
const completeSection = async (sectionId) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/progress/complete-section', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ sectionId })
  });
  return await response.json();
};
```

## 🧪 Testowanie

### Przykładowe dane testowe

Możesz użyć następujących danych do testowania:

```javascript
// Użytkownik testowy
{
  "email": "test@akademia.pl",
  "password": "test123"
}
```

### Testowanie z Postman/Insomnia

1. Zarejestruj użytkownika
2. Skopiuj otrzymany token
3. Użyj tokenu w headerze `Authorization: Bearer <token>`
4. Testuj pozostałe endpointy

## 🐛 Troubleshooting

### Problem: Nie mogę połączyć się z MongoDB
**Rozwiązanie:** 
- Sprawdź czy MongoDB działa: `mongosh` lub `mongo`
- Zweryfikuj MONGO_URI w pliku .env
- Spróbuj użyć MongoDB Atlas (chmura)

### Problem: Błąd "JWT must be provided"
**Rozwiązanie:** 
- Upewnij się, że wysyłasz token w headerze
- Format: `Authorization: Bearer <token>`

### Problem: CORS errors
**Rozwiązanie:** 
- Zweryfikuj CLIENT_URL w .env
- Sprawdź czy frontend działa na tym samym porcie

## 📝 TODO / Przyszłe funkcje

- [ ] Integracja z rzeczywistą bramką płatności (Stripe/PayPal)
- [ ] Wysyłanie emaili (reset hasła, powitanie)
- [ ] System powiadomień
- [ ] Testy jednostkowe i integracyjne
- [ ] Docker configuration
- [ ] API rate limiting per user
- [ ] Logging system (Winston)
- [ ] API documentation (Swagger)

## 📞 Wsparcie

Jeśli masz pytania lub napotkasz problemy:
1. Sprawdź logi serwera
2. Zweryfikuj konfigurację w .env
3. Upewnij się, że MongoDB działa

## 📄 Licencja

MIT License - możesz swobodnie używać i modyfikować ten kod.

---

**Autor:** Akademia Biznesowa Team
**Wersja:** 1.0.0
**Data:** 2025
