# ⚡ Szybki Start - 5 minut do działającego backendu!

## Kroki (dla początkujących):

### 1️⃣ Zainstaluj Node.js
- Wejdź: https://nodejs.org/
- Kliknij zielony przycisk "Download"
- Zainstaluj (domyślne opcje)
- Sprawdź: otwórz terminal i wpisz `node --version`

### 2️⃣ Przygotuj folder
```bash
cd backend
```

### 3️⃣ Zainstaluj biblioteki
```bash
npm install
```
Poczekaj ~1 minutę (pobiera potrzebne pakiety)

### 4️⃣ Skonfiguruj email

**Skopiuj plik:**
- Windows: `copy .env.example .env`
- Mac/Linux: `cp .env.example .env`

**Otwórz `.env` w notatniku i zmień:**
```env
JWT_SECRET=twoj-tajny-klucz-xyz789
EMAIL_USER=twoj@gmail.com
EMAIL_PASS=haslo-z-kroku-ponizej
EMAIL_FROM=twoj@gmail.com
```

**Zdobądź hasło aplikacji Gmail:**
1. https://myaccount.google.com/security
2. Włącz "Weryfikacja dwuetapowa"
3. https://myaccount.google.com/apppasswords
4. "Inna" → "Backend" → Wygeneruj
5. Skopiuj 16-znakowe hasło do `EMAIL_PASS`

### 5️⃣ Utwórz bazę
```bash
npm run init-db
```
Zobaczysz: ✅ Tabela users utworzona...

### 6️⃣ Uruchom!
```bash
npm start
```

Zobaczysz:
```
🚀 Serwer działa na porcie 3000
✅ Połączono z bazą danych
```

### 7️⃣ Sprawdź
Otwórz: http://localhost:3000/api/health

Widzisz `"status": "OK"`? 🎉 **DZIAŁA!**

---

## 🆘 Problemy?

**"Cannot find module..."**
→ `npm install`

**"Port 3000 zajęty"**
→ W `.env` zmień `PORT=3000` na `PORT=3001`

**"Email error"**
→ Sprawdź czy użyłeś hasła aplikacji (nie zwykłego hasła Gmail!)

---

## 📱 Połącz z frontendem

W pliku frontendu zmień adresy API na:
```javascript
const API_URL = 'http://localhost:3000/api';
```

---

## ✅ Co dalej?

1. Zobacz **README.md** - pełna dokumentacja
2. Testuj API w Postmanie
3. Czytaj kody w folderze `routes/`
4. Eksperymentuj i ucz się!

**Powodzenia!** 🚀
