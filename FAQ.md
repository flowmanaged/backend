# ❓ FAQ - NAJCZĘŚCIEJ ZADAWANE PYTANIA

## 🔐 OGÓLNE

### Q1: Dlaczego użytkownicy mogą się logować bez rejestracji?
**A:** Backend nie sprawdza czy użytkownik istnieje w bazie danych przed wydaniem tokena JWT. Funkcja `User.findByCredentials()` zwraca `null` gdy użytkownik nie istnieje, ale kod nie sprawdza tej wartości przed wygenerowaniem tokena.

### Q2: Czy muszę wymienić wszystkie 3 pliki backendowe?
**A:** Teoretycznie wystarczy wymienić tylko `authController.js`, ale **zdecydowanie zalecamy** dodanie również `auth.js` i `validation.js` dla pełnego bezpieczeństwa i walidacji.

### Q3: Czy muszę zmieniać coś we frontendzie?
**A:** **NIE!** Frontend (app.js i index.html) już prawidłowo obsługuje autoryzację. Problem jest wyłącznie w backendzie.

### Q4: Czy stracę istniejących użytkowników?
**A:** **NIE!** Wszyscy użytkownicy w bazie MongoDB pozostaną bez zmian. Naprawa dotyczy tylko kodu autoryzacji.

---

## 🛠️ INSTALACJA

### Q5: Jakie pakiety npm muszę zainstalować?
**A:** 
```bash
npm install express-validator bcryptjs jsonwebtoken
```

### Q6: Gdzie umieścić nowe pliki?
**A:**
```
backend/
├── controllers/
│   └── authController.js       ← Wymień ten plik
├── middleware/
│   ├── auth.js                 ← Dodaj nowy plik
│   └── validation.js           ← Dodaj nowy plik
```

### Q7: Czy muszę zmieniać plik .env?
**A:** **NIE**, chyba że nie masz ustawionych `MONGO_URI` i `JWT_SECRET`. Sprawdź czy masz:
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=twoj_tajny_klucz
JWT_EXPIRE=7d
```

---

## 🧪 TESTOWANIE

### Q8: Jak sprawdzić czy naprawa działa?
**A:** Spróbuj zalogować się bez rejestracji:
1. Email: `test@test.pl`
2. Hasło: `Test1234`
3. Jeśli **dostajesz błąd** → naprawa działa ✅
4. Jeśli **logujesz się** → naprawa nie działa ❌

### Q9: Jak przetestować wszystkie funkcje?
**A:** Wykonaj 10 testów z pliku `TESTY_WERYFIKACYJNE.md`. Każdy test ma szczegółowe kroki i oczekiwane rezultaty.

### Q10: Co zrobić jeśli test failuje?
**A:** 
1. Sprawdź logi serwera (konsola backendu)
2. Sprawdź DevTools → Console i Network
3. Zobacz sekcję "Troubleshooting" w `README.md`
4. Sprawdź czy wszystkie pliki są w odpowiednich lokalizacjach

---

## 🐛 PROBLEMY

### Q11: Backend zwraca "Cannot connect to MongoDB"
**A:** 
1. Sprawdź `MONGO_URI` w `.env`
2. Sprawdź czy Twoje IP jest w whitelist MongoDB Atlas
3. Sprawdź czy cluster MongoDB jest aktywny
4. Testuj połączenie: `mongosh "TWOJ_MONGO_URI"`

### Q12: "JWT must be provided" lub błędy z tokenem
**A:**
1. Sprawdź czy `JWT_SECRET` jest w `.env`
2. Sprawdź czy frontend wysyła header: `Authorization: Bearer <token>`
3. Sprawdź czy middleware `auth.js` jest załadowany
4. W DevTools → Network sprawdź request headers

### Q13: "ValidationError" przy rejestracji/logowaniu
**A:**
1. Upewnij się że zainstalowałeś: `npm install express-validator`
2. Sprawdź czy `validation.js` jest w `backend/middleware/`
3. Sprawdź czy w `authRoutes.js` są importy walidacji
4. Zobacz logi serwera dla szczegółów błędu

### Q14: "Rate limit exceeded" - zbyt wiele prób
**A:**
1. **Opcja 1:** Poczekaj 15 minut
2. **Opcja 2:** Zrestartuj serwer backendu
3. **Opcja 3:** Użyj trybu Incognito w przeglądarce
4. **Opcja 4:** Wyczyść cookies i localStorage

### Q15: Użytkownik może się zalogować mimo naprawy
**A:** Sprawdź czy:
1. Wymieniono plik `authController.js`
2. W funkcji `login()` jest sprawdzenie `if (!user) { return 401; }`
3. Serwer został **zrestartowany** po zmianie plików
4. Frontend używa poprawnego URL do API

---

## 🔒 BEZPIECZEŃSTWO

### Q16: Czy hasła są bezpiecznie przechowywane?
**A:** **TAK!** Hasła są hashowane algorytmem BCrypt przed zapisem do bazy. Nikt (nawet administrator) nie może zobaczyć oryginalnego hasła.

### Q17: Jak działa walidacja hasła?
**A:** Hasło musi spełniać wymogi:
- Minimum 8 znaków
- Przynajmniej jedna wielka litera (A-Z)
- Przynajmniej jedna mała litera (a-z)
- Przynajmniej jedna cyfra (0-9)

### Q18: Co to jest Rate Limiting?
**A:** Ochrona przed atakami brute-force. Po 5 nieudanych próbach logowania w ciągu 15 minut, dalsze próby są blokowane.

### Q19: Czy token JWT wygasa?
**A:** **TAK!** Domyślnie token jest ważny przez 7 dni (ustawione w `.env` jako `JWT_EXPIRE=7d`).

### Q20: Co się stanie gdy token wygaśnie?
**A:** Użytkownik zostanie wylogowany i musi zalogować się ponownie. Backend zwróci błąd 401 z komunikatem "Token wygasł. Zaloguj się ponownie."

---

## 📊 BAZA DANYCH

### Q21: Jak sprawdzić użytkowników w bazie MongoDB?
**A:**
1. Zaloguj się do MongoDB Atlas
2. Kliknij "Browse Collections"
3. Wybierz bazę: `akademia-biznesowa`
4. Wybierz kolekcję: `users`
5. Zobaczysz listę użytkowników

### Q22: Jak wygląda użytkownik w bazie?
**A:**
```json
{
  "_id": ObjectId("673860..."),
  "email": "test@akademia.pl",
  "password": "$2a$10$...", // Zahashowane BCrypt
  "name": "test",
  "role": "user",
  "isPremium": false,
  "completedSections": [],
  "quizResults": [],
  "createdAt": ISODate("2024-11-16T12:00:00Z"),
  "lastLogin": ISODate("2024-11-16T13:00:00Z")
}
```

### Q23: Czy mogę usunąć użytkownika z bazy?
**A:** **TAK**, ale ostrożnie:
1. W MongoDB Atlas → Collections → users
2. Znajdź użytkownika
3. Kliknij "Delete"
4. **UWAGA:** To działanie jest nieodwracalne!

---

## 🎨 FRONTEND

### Q24: Czy mogę zmienić komunikaty błędów?
**A:** **TAK!** Komunikaty są zwracane z backendu w `authController.js`. Możesz je dostosować:
```javascript
message: 'Nieprawidłowy email lub hasło' // ← Tu zmień tekst
```

### Q25: Jak dodać pole "Imię" do rejestracji?
**A:** 
1. W frontendzie dodaj input dla imienia
2. Wyślij `name` w `body` rejestracji
3. Backend już obsługuje pole `name` (opcjonalne)

### Q26: Jak wyświetlić imię użytkownika po zalogowaniu?
**A:** Dane użytkownika są zwracane przy logowaniu:
```javascript
// Frontend otrzymuje:
{
  user: {
    name: "Jan Kowalski",
    email: "jan@test.pl",
    ...
  }
}
// Zapisz w state i wyświetl w UI
```

---

## 🚀 DEPLOYMENT

### Q27: Czy mogę wdrożyć to na Render/Vercel?
**A:** **TAK!** Upewnij się że:
1. Wszystkie zmienne środowiskowe są ustawione
2. MongoDB Atlas pozwala na połączenia z IP serwera
3. CORS jest poprawnie skonfigurowany

### Q28: Co z produkcyjnym JWT_SECRET?
**A:** **MUSISZ** zmienić `JWT_SECRET` na produkcji!
```env
# Development (NIE używaj tego w produkcji!)
JWT_SECRET=super_tajny_klucz_jwt_akademia_biznesowa_2025_change_me_in_production

# Production (wygeneruj losowy, długi klucz)
JWT_SECRET=9K#mL$pQ2@nR5&tV8*wX3^yZ6+aB4!cD7-eF0_gH1
```

Wygeneruj bezpieczny klucz:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Q29: Jak skonfigurować CORS dla produkcji?
**A:** W `.env` ustaw:
```env
# Development
CLIENT_URL=http://localhost:3000

# Production
CLIENT_URL=https://twoja-domena.pl
```

---

## 📈 FUNKCJE PREMIUM

### Q30: Jak nadać użytkownikowi status Premium?
**A:** Bezpośrednio w MongoDB Atlas:
```javascript
// W kolekcji users, edytuj dokument użytkownika:
{
  "isPremium": true,
  "premiumExpiresAt": ISODate("2025-12-31T23:59:59Z") // Opcjonalne
}
```

Lub przez API (endpoint do dodania):
```javascript
PUT /api/users/:id/premium
Body: { isPremium: true, expiresAt: "2025-12-31" }
```

### Q31: Co jeśli Premium wygaśnie?
**A:** Automatycznie! Przy każdym logowaniu middleware sprawdza:
```javascript
await user.checkAndUpdatePremiumStatus();
```
Jeśli `premiumExpiresAt < now`, to `isPremium` jest ustawiane na `false`.

---

## 📞 WSPARCIE

### Q32: Gdzie znaleźć szczegółowe instrukcje?
**A:** W pakiecie naprawczym masz:
- `README.md` - Ogólny przewodnik
- `INSTRUKCJA_NAPRAWY_LOGOWANIA.md` - Szczegółowe kroki
- `SZYBKA_NAPRAWA.md` - Skrócona wersja
- `TESTY_WERYFIKACYJNE.md` - 10 testów
- `DIAGRAM_PROBLEMU.md` - Wizualizacja

### Q33: Co jeśli nadal mam problemy?
**A:** Sprawdź:
1. **Logi serwera** - konsola backendu
2. **DevTools** → Console + Network
3. **MongoDB Atlas** → Browse Collections
4. **Pliki** - czy wszystkie są w odpowiednich lokalizacjach
5. **Pakiety npm** - czy wszystkie są zainstalowane

### Q34: Czy mogę kontaktować się z supportem?
**A:** Skontaktuj się z Flowmanaged:
- Email: flowmanaged@gmail.com
- Dołącz: logi błędów, zrzuty ekranu, opis problemu

---

## ✅ CHECKLIST SZYBKIEJ WERYFIKACJI

- [ ] Wymieniono `authController.js`
- [ ] Dodano `middleware/auth.js`
- [ ] Dodano `middleware/validation.js`
- [ ] Zainstalowano: `npm install express-validator bcryptjs jsonwebtoken`
- [ ] Zrestartowano serwer backendu
- [ ] Test: Logowanie bez rejestracji → ❌ BŁĄD (działa!)
- [ ] Test: Rejestracja → ✅ SUKCES (działa!)
- [ ] Test: Logowanie po rejestracji → ✅ SUKCES (działa!)
- [ ] Sprawdzono logi - brak błędów
- [ ] Sprawdzono MongoDB - użytkownicy zapisani

---

## 🎯 NAJCZĘSTSZY BŁĄD

**Problem:** "Użytkownicy nadal mogą się logować bez rejestracji"

**Przyczyna:** Zapomniałeś **zrestartować serwer** po zmianie plików!

**Rozwiązanie:**
```bash
# Zatrzymaj serwer (Ctrl+C)
# Uruchom ponownie:
node server.js
```

**Pamiętaj:** Node.js **nie przeładowuje plików automatycznie**!

---

**Data aktualizacji:** 16 listopada 2025
**Wersja:** 1.0
