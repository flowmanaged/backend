# 🔐 NAPRAWA: Logowanie bez rejestracji konta

## ❌ Problem
Użytkownicy mogą się zalogować bez wcześniejszej rejestracji konta.

## 🎯 Przyczyna
Backend nie weryfikuje poprawnie:
1. Czy użytkownik istnieje w bazie danych
2. Czy wprowadzone hasło jest prawidłowe
3. Czy hasła są prawidłowo hashowane

## ✅ Rozwiązanie

### Krok 1: Zamień plik `controllers/authController.js`

Zastąp zawartość pliku `controllers/authController.js` zawartością z pliku `authController-FIXED.js`

**Lokalizacja:** `akademia-backend/controllers/authController.js`

**Kluczowe poprawki w funkcji login:**

```javascript
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ✅ WALIDACJA - sprawdź czy pola są wypełnione
        if (!email || !password) {
            return res.status(400).json({
                message: 'Proszę podać email i hasło'
            });
        }

        // ✅ ZNAJDŹ UŻYTKOWNIKA W BAZIE DANYCH
        const user = await User.findOne({ email: email.toLowerCase() });

        // ✅ SPRAWDŹ CZY UŻYTKOWNIK ISTNIEJE
        if (!user) {
            return res.status(401).json({
                message: 'Nieprawidłowy email lub hasło'
            });
        }

        // ✅ SPRAWDŹ CZY HASŁO JEST POPRAWNE
        const isPasswordCorrect = await user.matchPassword(password);
        
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Nieprawidłowy email lub hasło'
            });
        }

        // ✅ LOGOWANIE UDANE
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isPremium: user.isPremium,
            premiumUntil: user.premiumUntil,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('Błąd logowania:', error);
        res.status(500).json({
            message: 'Błąd serwera podczas logowania',
            error: error.message
        });
    }
};
```

### Krok 2: Zamień plik `models/User.js`

Zastąp zawartość pliku `models/User.js` zawartością z pliku `User-FIXED.js`

**Lokalizacja:** `akademia-backend/models/User.js`

**Kluczowe elementy:**

```javascript
// ✅ MIDDLEWARE - Hashuj hasło PRZED zapisaniem
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ✅ METODA - Porównaj hasła
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
```

### Krok 3: Sprawdź czy bcryptjs jest zainstalowany

```bash
cd akademia-backend
npm list bcryptjs
```

Jeśli nie jest zainstalowany:
```bash
npm install bcryptjs
```

### Krok 4: Wyczyść bazę danych i uruchom seed ponownie

**WAŻNE:** Stare hasła w bazie NIE SĄ zahashowane, więc musisz:

```bash
# 1. Zatrzymaj serwer (Ctrl+C)

# 2. Usuń starą bazę danych lub wszystkich użytkowników
# Opcja A - MongoDB Compass: Usuń kolekcję 'users'
# Opcja B - Przez terminal:
node
> const mongoose = require('mongoose')
> mongoose.connect('YOUR_MONGO_URI')
> mongoose.connection.db.dropCollection('users')
> process.exit()

# 3. Uruchom seed ponownie
npm run seed

# 4. Uruchom serwer
npm run dev
```

### Krok 5: Przetestuj poprawki

#### Test 1: Próba logowania bez rejestracji
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nieistniejacy@test.pl","password":"test123"}'
```

**Oczekiwany rezultat:**
```json
{
  "message": "Nieprawidłowy email lub hasło"
}
```

#### Test 2: Rejestracja nowego użytkownika
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@test.pl",
    "password":"test123"
  }'
```

**Oczekiwany rezultat:**
```json
{
  "_id": "...",
  "name": "Test User",
  "email": "test@test.pl",
  "role": "user",
  "isPremium": false,
  "token": "..."
}
```

#### Test 3: Logowanie z błędnym hasłem
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.pl","password":"blednehaslo"}'
```

**Oczekiwany rezultat:**
```json
{
  "message": "Nieprawidłowy email lub hasło"
}
```

#### Test 4: Logowanie z prawidłowymi danymi
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.pl","password":"test123"}'
```

**Oczekiwany rezultat:**
```json
{
  "_id": "...",
  "name": "Test User",
  "email": "test@test.pl",
  "role": "user",
  "isPremium": false,
  "token": "..."
}
```

## 🔒 Co zostało naprawione

### W authController.js:

1. ✅ **Walidacja istnienia użytkownika**
   - Sprawdzenie czy użytkownik istnieje w bazie PRZED weryfikacją hasła

2. ✅ **Weryfikacja hasła**
   - Użycie metody `matchPassword()` do porównania hasła

3. ✅ **Komunikaty błędów**
   - Jednolity komunikat dla błędnego email/hasła (bezpieczeństwo)

4. ✅ **Walidacja danych wejściowych**
   - Sprawdzenie czy wszystkie wymagane pola są wypełnione

### W User.js:

1. ✅ **Automatyczne hashowanie haseł**
   - Middleware `pre('save')` hashuje hasło przed zapisem

2. ✅ **Metoda porównywania haseł**
   - `matchPassword()` używa bcrypt.compare()

3. ✅ **Walidacja formatu email**
   - Regex w schemacie

4. ✅ **Minimalna długość hasła**
   - 6 znaków minimum

## 📋 Checklist

- [ ] Zamieniono plik `controllers/authController.js`
- [ ] Zamieniono plik `models/User.js`
- [ ] Sprawdzono czy bcryptjs jest zainstalowany
- [ ] Wyczyszczono bazę danych
- [ ] Uruchomiono seed ponownie
- [ ] Przetestowano logowanie bez rejestracji (powinno NIE działać)
- [ ] Przetestowano rejestrację
- [ ] Przetestowano logowanie z błędnym hasłem (powinno NIE działać)
- [ ] Przetestowano logowanie z prawidłowymi danymi (powinno działać)

## ⚠️ WAŻNE: Bezpieczeństwo

### Dlaczego jednolity komunikat błędu?

Używamy **tego samego komunikatu** dla:
- Nieistniejącego email
- Błędnego hasła

```javascript
"Nieprawidłowy email lub hasło"
```

**Powód:** Uniemożliwia to atakującym sprawdzenie czy dany email istnieje w systemie.

### Hashowanie haseł

- Hasła **NIGDY** nie są przechowywane w postaci jawnej
- Używamy **bcrypt** z salt=10
- Nawet administrator nie zna haseł użytkowników

## 🎉 Rezultat

Po zastosowaniu poprawek:

❌ **PRZED:** Można się zalogować bez konta  
✅ **PO:** Logowanie wymaga:
  1. Istniejącego konta w bazie danych
  2. Prawidłowego hasła
  3. Hasła są bezpiecznie zahashowane

## 🆘 Problemy?

### Problem: "bcrypt is not defined"
```bash
npm install bcryptjs
```

### Problem: Nadal można się zalogować bez konta
- Sprawdź czy na pewno zmieniłeś oba pliki
- Sprawdź czy restartujesz serwer po zmianach
- Sprawdź logi: `console.log` w funkcji login

### Problem: "Cannot find module bcryptjs"
```bash
cd akademia-backend
npm install bcryptjs
npm list bcryptjs
```

### Problem: Hasła seeded użytkowników nie działają
- To normalne! Stare hasła nie były hashowane
- Rozwiązanie: Usuń users z bazy i uruchom seed ponownie

## 📞 Gotowe!

Teraz Twój system jest bezpieczny i logowanie działa poprawnie! 🎉
