# 🧪 TESTY WERYFIKACYJNE - LOGOWANIE I REJESTRACJA

## 📋 PRZYGOTOWANIE DO TESTÓW

### 1. Uruchom backend
```bash
cd backend
npm install
node server.js
```

### 2. Otwórz aplikację
```
http://localhost:3000
```

### 3. Otwórz DevTools
- Chrome/Edge: F12 lub Ctrl+Shift+I
- Firefox: F12 lub Ctrl+Shift+K

### 4. Wyczyść localStorage
W konsoli DevTools:
```javascript
localStorage.clear();
```

---

## ✅ TEST 1: LOGOWANIE BEZ REJESTRACJI (POWINIEN ZWRÓCIĆ BŁĄD)

### Kroki:
1. Kliknij **"Zaloguj się"**
2. Wpisz:
   - **Email:** `nieistniejacy@test.pl`
   - **Hasło:** `Test1234`
3. Kliknij **"Zaloguj"**

### Oczekiwany rezultat: ❌ BŁĄD
```
✓ Komunikat: "Nieprawidłowy email lub hasło"
✓ Status pozostaje: Niezalogowany
✓ Brak tokena w localStorage
✓ Modal logowania pozostaje otwarty
```

### Sprawdź w DevTools → Network:
```
Request URL: http://localhost:5000/api/auth/login
Status: 401 Unauthorized
Response:
{
  "success": false,
  "message": "Nieprawidłowy email lub hasło"
}
```

### Sprawdź localStorage:
```javascript
localStorage.getItem('token') // null
```

---

## ✅ TEST 2: REJESTRACJA NOWEGO UŻYTKOWNIKA

### Kroki:
1. Kliknij **"Zarejestruj się"**
2. Wpisz:
   - **Email:** `test@akademia.pl`
   - **Hasło:** `Test1234`
   - **Potwierdź hasło:** `Test1234`
3. Zaznacz checkbox **"Akceptuję regulamin"**
4. Kliknij **"Zarejestruj"**

### Oczekiwany rezultat: ✅ SUKCES
```
✓ Komunikat: "Konto utworzone pomyślnie!"
✓ Automatyczne przekierowanie do logowania (po 2 sekundach)
✓ Pola formularza wyczyszczone
✓ Toast z potwierdzeniem
```

### Sprawdź w DevTools → Network:
```
Request URL: http://localhost:5000/api/auth/register
Status: 201 Created
Response:
{
  "success": true,
  "message": "Rejestracja zakończona pomyślnie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673860...",
    "email": "test@akademia.pl",
    "name": "test",
    "role": "user",
    "isPremium": false
  }
}
```

### Sprawdź w MongoDB Atlas:
1. Zaloguj się do MongoDB Atlas
2. Browse Collections → akademia-biznesowa → users
3. Znajdź użytkownika z emailem `test@akademia.pl`
4. Sprawdź czy hasło jest zahashowane (BCrypt)

---

## ✅ TEST 3: LOGOWANIE ZAREJESTROWANEGO UŻYTKOWNIKA

### Kroki:
1. Kliknij **"Zaloguj się"**
2. Wpisz:
   - **Email:** `test@akademia.pl`
   - **Hasło:** `Test1234`
3. Kliknij **"Zaloguj"**

### Oczekiwany rezultat: ✅ SUKCES
```
✓ Komunikat: "Zalogowano pomyślnie!"
✓ Modal logowania zamyka się
✓ Widoczny email użytkownika w interfejsie
✓ Token zapisany w localStorage
✓ Status: Zalogowany
```

### Sprawdź w DevTools → Network:
```
Request URL: http://localhost:5000/api/auth/login
Status: 200 OK
Response:
{
  "success": true,
  "message": "Zalogowano pomyślnie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673860...",
    "email": "test@akademia.pl",
    "name": "test",
    "role": "user",
    "isPremium": false,
    "stats": {
      "totalQuizzes": 0,
      "averageScore": 0,
      "completedSections": 0
    }
  }
}
```

### Sprawdź localStorage:
```javascript
localStorage.getItem('token') // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## ✅ TEST 4: LOGOWANIE Z BŁĘDNYM HASŁEM

### Kroki:
1. Kliknij **"Zaloguj się"**
2. Wpisz:
   - **Email:** `test@akademia.pl` (istniejący)
   - **Hasło:** `ZleHaslo123` (błędne)
3. Kliknij **"Zaloguj"**

### Oczekiwany rezultat: ❌ BŁĄD
```
✓ Komunikat: "Nieprawidłowy email lub hasło"
✓ Status pozostaje: Niezalogowany
✓ Brak tokena w localStorage
✓ Modal pozostaje otwarty
```

### Sprawdź w DevTools → Network:
```
Status: 401 Unauthorized
Response:
{
  "success": false,
  "message": "Nieprawidłowy email lub hasło"
}
```

---

## ✅ TEST 5: PRÓBA DUPLIKATU EMAIL

### Kroki:
1. Kliknij **"Zarejestruj się"**
2. Wpisz:
   - **Email:** `test@akademia.pl` (już istniejący!)
   - **Hasło:** `NoweHaslo123`
   - **Potwierdź hasło:** `NoweHaslo123`
3. Zaznacz regulamin
4. Kliknij **"Zarejestruj"**

### Oczekiwany rezultat: ❌ BŁĄD
```
✓ Komunikat: "Użytkownik z tym adresem email już istnieje"
✓ Brak utworzenia duplikatu w bazie
✓ Formularz pozostaje otwarty
```

### Sprawdź w DevTools → Network:
```
Status: 400 Bad Request
Response:
{
  "success": false,
  "message": "Użytkownik z tym adresem email już istnieje"
}
```

---

## ✅ TEST 6: WALIDACJA HASŁA (ZA KRÓTKIE)

### Kroki:
1. Kliknij **"Zarejestruj się"**
2. Wpisz:
   - **Email:** `nowy@test.pl`
   - **Hasło:** `Test12` (tylko 6 znaków)
   - **Potwierdź hasło:** `Test12`
3. Zaznacz regulamin
4. Kliknij **"Zarejestruj"**

### Oczekiwany rezultat: ❌ BŁĄD
```
✓ Komunikat: "Hasło musi mieć minimum 8 znaków"
✓ Formularz pozostaje otwarty
✓ Brak utworzenia konta
```

---

## ✅ TEST 7: WYLOGOWANIE

### Kroki:
1. Po zalogowaniu, kliknij przycisk **"Wyloguj"** (jeśli istnieje)

### Oczekiwany rezultat: ✅ SUKCES
```
✓ Token usunięty z localStorage
✓ Status: Niezalogowany
✓ Przekierowanie do strony głównej
✓ Komunikat: "Wylogowano pomyślnie!"
```

### Sprawdź localStorage:
```javascript
localStorage.getItem('token') // null
```

---

## ✅ TEST 8: DOSTĘP DO CHRONIONEGO ENDPOINT BEZ TOKENA

### Kroki w DevTools → Console:
```javascript
fetch('http://localhost:5000/api/auth/me', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(res => res.json())
.then(data => console.log(data));
```

### Oczekiwany rezultat: ❌ BŁĄD
```
Status: 401 Unauthorized
Response:
{
  "success": false,
  "message": "Brak autoryzacji. Zaloguj się ponownie."
}
```

---

## ✅ TEST 9: DOSTĘP DO CHRONIONEGO ENDPOINT Z TOKENEM

### Kroki w DevTools → Console:
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/auth/me', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
})
.then(res => res.json())
.then(data => console.log(data));
```

### Oczekiwany rezultat: ✅ SUKCES
```
Status: 200 OK
Response:
{
  "success": true,
  "user": {
    "id": "673860...",
    "email": "test@akademia.pl",
    "name": "test",
    "role": "user",
    "isPremium": false,
    "stats": {...}
  }
}
```

---

## ✅ TEST 10: RATE LIMITING (OCHRONA PRZED BRUTEFORCE)

### Kroki:
1. Spróbuj zalogować się **6 razy** z błędnym hasłem w ciągu 1 minuty

### Oczekiwany rezultat po 5 próbie: ❌ RATE LIMIT
```
✓ Status: 429 Too Many Requests
✓ Komunikat: "Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut"
✓ Kolejne próby blokowane przez 15 minut
```

### Sprawdź w DevTools → Network:
```
Status: 429 Too Many Requests
Response:
{
  "success": false,
  "message": "Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut"
}
```

---

## 📊 TABELA WYNIKÓW TESTÓW

| Test | Scenariusz | Status | Komunikat |
|------|------------|--------|-----------|
| 1 | Logowanie bez rejestracji | ❌ 401 | "Nieprawidłowy email lub hasło" |
| 2 | Rejestracja nowego użytkownika | ✅ 201 | "Rejestracja zakończona pomyślnie" |
| 3 | Logowanie zarejestrowanego | ✅ 200 | "Zalogowano pomyślnie" |
| 4 | Logowanie z błędnym hasłem | ❌ 401 | "Nieprawidłowy email lub hasło" |
| 5 | Duplikat email | ❌ 400 | "Użytkownik z tym adresem email już istnieje" |
| 6 | Za krótkie hasło | ❌ 400 | "Hasło musi mieć minimum 8 znaków" |
| 7 | Wylogowanie | ✅ 200 | "Wylogowano pomyślnie" |
| 8 | Endpoint bez tokena | ❌ 401 | "Brak autoryzacji" |
| 9 | Endpoint z tokenem | ✅ 200 | Dane użytkownika |
| 10 | Rate limiting | ❌ 429 | "Zbyt wiele prób logowania" |

---

## 🐛 DEBUGGING - CO SPRAWDZIĆ GDY TEST FAILUJE

### Test 1 failuje (można się zalogować bez rejestracji)
```bash
# Sprawdź authController.js
# Czy jest sprawdzenie: if (!user) { return 401; }
```

### Test 2 failuje (nie można się zarejestrować)
```bash
# Sprawdź połączenie z MongoDB
# Sprawdź logi serwera
# Sprawdź czy MONGO_URI w .env jest prawidłowy
```

### Test 3 failuje (nie można się zalogować po rejestracji)
```bash
# Sprawdź czy użytkownik jest w bazie MongoDB
# Sprawdź czy hasło jest prawidłowe
# Sprawdź logi backendu
```

### Test 8/9 failuje (problemy z tokenem)
```bash
# Sprawdź JWT_SECRET w .env
# Sprawdź middleware/auth.js
# Sprawdź czy token jest wysyłany w headerze Authorization
```

---

## 📝 CHECKLIST PO TESTACH

- [ ] Test 1: ❌ Brak logowania bez rejestracji ✅
- [ ] Test 2: ✅ Rejestracja działa ✅
- [ ] Test 3: ✅ Logowanie po rejestracji działa ✅
- [ ] Test 4: ❌ Błędne hasło zwraca błąd ✅
- [ ] Test 5: ❌ Duplikat email blokowany ✅
- [ ] Test 6: ❌ Za krótkie hasło blokowane ✅
- [ ] Test 7: ✅ Wylogowanie działa ✅
- [ ] Test 8: ❌ Brak dostępu bez tokena ✅
- [ ] Test 9: ✅ Dostęp z tokenem działa ✅
- [ ] Test 10: ❌ Rate limiting działa ✅

---

## ✅ WSZYSTKIE TESTY PRZESZŁY?

**GRATULACJE! 🎉**

Twoja aplikacja jest teraz bezpieczna i działa prawidłowo!

---

**Data utworzenia:** 16 listopada 2025
**Wersja:** 1.0
