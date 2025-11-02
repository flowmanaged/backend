<<<<<<< HEAD
# 🚀 Business Analysis Platform - Backend

Backend dla platformy edukacyjnej Business Analysis. API REST zbudowane w Node.js + Express + SQLite.

## 📋 Wymagania

- **Node.js** (wersja 14 lub wyższa) - [Pobierz tutaj](https://nodejs.org/)
- **npm** (instaluje się razem z Node.js)
- Konto Gmail do wysyłania maili (lub inny SMTP)

## 🔧 Instalacja krok po kroku

### 1. Zainstaluj Node.js

Jeśli nie masz zainstalowanego Node.js:
- Wejdź na https://nodejs.org/
- Pobierz wersję LTS (Long Term Support)
- Zainstaluj (klikaj "Dalej" w instalatorze)
- Sprawdź instalację w terminalu:
```bash
node --version
npm --version
```

### 2. Zainstaluj zależności

Otwórz terminal w folderze `backend` i wykonaj:

```bash
npm install
```

To zainstaluje wszystkie potrzebne biblioteki (może potrwać 1-2 minuty).

### 3. Konfiguracja zmiennych środowiskowych

**WAŻNE:** Musisz skonfigurować email do wysyłania wiadomości!

1. Skopiuj plik `.env.example` i nazwij go `.env`
2. Otwórz plik `.env` w edytorze tekstu
3. Uzupełnij dane:

```env
# Port (możesz zostawić 3000)
PORT=3000

# Sekretny klucz JWT (ZMIEŃ NA LOSOWY STRING!)
JWT_SECRET=jakis-bardzo-tajny-klucz-12345

# Email - konfiguracja Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=twoj-email@gmail.com
EMAIL_PASS=twoje-haslo-aplikacji
EMAIL_FROM=twoj-email@gmail.com

# URL frontendu
FRONTEND_URL=http://localhost:8080
```

### 4. Konfiguracja Gmail (do wysyłania maili)

**Opcja A: Użyj hasła aplikacji Gmail (REKOMENDOWANE)**

1. Zaloguj się do swojego konta Gmail
2. Wejdź na: https://myaccount.google.com/security
3. Włącz "Weryfikacja dwuetapowa" (jeśli nie masz)
4. Przejdź do: https://myaccount.google.com/apppasswords
5. Wybierz "Aplikacja" → "Inna" → Wpisz "Business Analysis"
6. Skopiuj wygenerowane hasło (16 znaków)
7. Wklej to hasło do `EMAIL_PASS` w pliku `.env`

**Opcja B: Użyj innego serwisu email**

Jeśli nie chcesz używać Gmail, możesz skonfigurować inny SMTP:
- Outlook: `smtp.office365.com` port `587`
- Mailtrap (do testów): https://mailtrap.io/

### 5. Inicjalizacja bazy danych

Utwórz tabele w bazie danych:

```bash
npm run init-db
```

Zobaczysz komunikaty:
```
✅ Tabela users utworzona
✅ Tabela progress utworzona
✅ Tabela quiz_results utworzona
✅ Tabela subscriptions utworzona
```

### 6. Uruchom serwer

**Tryb normalny:**
```bash
npm start
```

**Tryb developerski (auto-restart po zmianach):**
```bash
npm run dev
```

Jeśli wszystko działa, zobaczysz:
```
🚀 Serwer działa na porcie 3000
📍 Health check: http://localhost:3000/api/health
🌍 Frontend URL: http://localhost:8080
✅ Połączono z bazą danych SQLite
✅ Serwer email gotowy do wysyłania wiadomości
```

### 7. Sprawdź czy działa

Otwórz przeglądarkę i wejdź na:
```
http://localhost:3000/api/health
```

Powinieneś zobaczyć:
```json
{
  "status": "OK",
  "message": "Backend działa poprawnie!",
  "timestamp": "2024-10-28T..."
}
```

## 📡 API Endpoints

### Autoryzacja

**POST** `/api/auth/register` - Rejestracja
```json
{
  "email": "test@example.com",
  "password": "haslo123"
}
```

**POST** `/api/auth/login` - Logowanie
```json
{
  "email": "test@example.com",
  "password": "haslo123"
}
```
Zwraca: `{ token, user }`

**GET** `/api/auth/verify/:token` - Weryfikacja emaila

**POST** `/api/auth/forgot-password` - Prośba o reset hasła
```json
{
  "email": "test@example.com"
}
```

**POST** `/api/auth/reset-password` - Reset hasła
```json
{
  "token": "abc123...",
  "password": "nowe-haslo"
}
```

### Użytkownik (wymagany token)

**Header dla wszystkich requestów:**
```
Authorization: Bearer twoj-jwt-token
```

**GET** `/api/user/profile` - Profil użytkownika

**POST** `/api/user/upgrade-premium` - Aktywuj Premium (demo)

**GET** `/api/user/subscription` - Status subskrypcji

**DELETE** `/api/user/account` - Usuń konto

### Postępy (wymagany token)

**GET** `/api/progress/sections` - Postępy w sekcjach

**POST** `/api/progress/sections/:sectionId/complete` - Oznacz jako ukończone

**POST** `/api/progress/quiz` - Zapisz wynik quizu
```json
{
  "quizId": "main-quiz",
  "score": 15,
  "totalQuestions": 22,
  "answers": { "1": 0, "2": 2, "3": 1, ... }
}
```

**GET** `/api/progress/quiz/history` - Historia quizów

**GET** `/api/progress/stats` - Statystyki ogólne

## 🗂️ Struktura plików

```
backend/
├── config/
│   └── database.js          # Konfiguracja SQLite
├── middleware/
│   └── auth.js              # JWT autoryzacja
├── routes/
│   ├── auth.js              # Rejestracja, logowanie
│   ├── user.js              # Profil, Premium
│   └── progress.js          # Postępy, quizy
├── scripts/
│   └── initDatabase.js      # Tworzenie tabel
├── utils/
│   └── email.js             # Wysyłanie maili
├── .env                     # Konfiguracja (NIE commituj!)
├── .env.example             # Przykład konfiguracji
├── package.json             # Zależności
├── server.js                # Główny plik
└── database.db              # Baza danych (auto-tworzona)
```

## 🔒 Bezpieczeństwo

- ✅ Hasła hashowane (bcrypt)
- ✅ JWT tokeny z wygasaniem
- ✅ Rate limiting
- ✅ Helmet.js (bezpieczeństwo headerów)
- ✅ CORS skonfigurowany
- ✅ Walidacja danych (express-validator)

## 🐛 Rozwiązywanie problemów

### "Cannot find module 'express'"
```bash
npm install
```

### "EADDRINUSE: address already in use"
Port 3000 jest zajęty. Zmień `PORT` w pliku `.env` na inny (np. 3001).

### "Error sending email"
- Sprawdź czy hasło aplikacji Gmail jest poprawne
- Upewnij się że weryfikacja dwuetapowa jest włączona
- Sprawdź czy EMAIL_USER i EMAIL_FROM są identyczne

### "Database locked"
Zamknij wszystkie połączenia i restartuj serwer.

### Nie otrzymuję maili
1. Sprawdź folder SPAM
2. Sprawdź logi w terminalu
3. Sprawdź czy EMAIL_PASS jest hasłem aplikacji (nie zwykłym hasłem)

## 🧪 Testowanie API

Możesz użyć:
- **Postman** - https://www.postman.com/downloads/
- **Thunder Client** - rozszerzenie VS Code
- **curl** - z terminala

Przykład curl:
```bash
# Rejestracja
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"haslo123"}'

# Logowanie
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"haslo123"}'
```

## 📦 Deployment (opcjonalnie)

Gdy będziesz gotowy do wdrożenia na serwer:

1. **Heroku** (darmowe)
   - https://devcenter.heroku.com/articles/deploying-nodejs

2. **Railway** (darmowe)
   - https://railway.app/

3. **Render** (darmowe)
   - https://render.com/

4. **VPS** (płatne, pełna kontrola)
   - DigitalOcean, Linode, AWS

## 💡 Wskazówki

- Plik `database.db` zawiera wszystkie dane - zrób backup!
- W produkcji użyj PostgreSQL zamiast SQLite
- Dodaj monitoring (np. Sentry)
- Regularnie aktualizuj zależności: `npm update`

## 📞 Kontakt

Email: flowmanaged@gmail.com

## 📄 Licencja

ISC

---

**Potrzebujesz pomocy?** Otwórz issue na GitHubie lub napisz maila! 😊
=======
# FM-final
>>>>>>> 5aa1bdac509ace31c5ef926a6b6a575b4c9ce47e
