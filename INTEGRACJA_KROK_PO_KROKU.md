# 🎯 KROK PO KROKU: Integracja Backend z HTML

## 📋 Co będziemy robić?

Przekształcimy Twój HTML z localStorage na prawdziwy backend API w **5 prostych krokach**.

---

## KROK 1: Przygotuj backend (5 minut)

### 1.1 Zainstaluj zależności
```bash
cd akademia-backend
npm install
```

### 1.2 Uruchom seed (dane testowe)
```bash
npm run seed
```

**Otrzymasz 3 konta:**
- `admin@akademia.pl` / `admin123` (Administrator)
- `premium@akademia.pl` / `premium123` (Premium user)
- `test@akademia.pl` / `test123` (Zwykły user)

### 1.3 Uruchom serwer
```bash
npm run dev
```

✅ Serwer działa na: `http://localhost:5000`

---

## KROK 2: Dodaj funkcje API do HTML (2 minuty)

### Opcja A: Kopiuj bezpośrednio do HTML

Otwórz plik `api-integration.js` i skopiuj CAŁĄ jego zawartość do swojego HTML **przed** głównym kodem React:

```html
<script type="text/babel">
    // ===== WKLEJ TUTAJ CAŁĄ ZAWARTOŚĆ api-integration.js =====
    
    const { useState } = React;
    
    const App = () => {
        // ... reszta twojego kodu React
    };
</script>
```

### Opcja B: Załaduj jako osobny plik

```html
<!-- Przed głównym skryptem -->
<script src="api-integration.js"></script>

<script type="text/babel">
    const { useState } = React;
    // ... reszta kodu
</script>
```

---

## KROK 3: Zamień localStorage na API (15 minut)

### 3.1 AUTORYZACJA

**PRZED (stare):**
```javascript
const handleLogin = async (email, password) => {
    // Symulacja
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    setIsLoggedIn(true);
    setUserEmail(email);
};
```

**PO (nowe z API):**
```javascript
const handleLogin = async (email, password) => {
    try {
        const user = await API.login(email, password);
        // Token zapisany automatycznie przez API.login
        setIsLoggedIn(true);
        setUserEmail(user.email);
        setIsPremium(user.isPremium);
        setUserRole(user.role); // 🆕 Nowe!
        setCompletedSections(new Set(user.completedSections));
        showToast('Zalogowano pomyślnie!', 'success');
        
        // Jeśli admin, przekieruj do panelu
        if (user.role === 'admin') {
            setCurrentView('admin');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
};
```

**PRZED (rejestracja):**
```javascript
const handleRegister = async (email, password) => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    setIsLoggedIn(true);
};
```

**PO (rejestracja):**
```javascript
const handleRegister = async (email, password, name) => {
    try {
        const user = await API.register(email, password, name);
        setIsLoggedIn(true);
        setUserEmail(user.email);
        setIsPremium(user.isPremium);
        setUserRole(user.role);
        showToast('Konto utworzone!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
};
```

### 3.2 POSTĘPY

**PRZED:**
```javascript
const handleCompleteSection = (sectionId) => {
    const newCompleted = new Set(completedSections);
    newCompleted.add(sectionId);
    setCompletedSections(newCompleted);
    localStorage.setItem('completedSections', JSON.stringify([...newCompleted]));
};
```

**PO:**
```javascript
const handleCompleteSection = async (sectionId) => {
    try {
        const completedArray = await API.completeSection(sectionId);
        setCompletedSections(new Set(completedArray));
        showToast('Sekcja ukończona!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
};
```

**PRZED (quiz):**
```javascript
const handleQuizSubmit = () => {
    const results = [...(JSON.parse(localStorage.getItem('quizResults')) || [])];
    results.push({ quizId, score, answers });
    localStorage.setItem('quizResults', JSON.stringify(results));
};
```

**PO (quiz):**
```javascript
const handleQuizSubmit = async () => {
    try {
        await API.saveQuizResult('quiz-basics', score, totalQuestions, quizAnswers);
        showToast(`Wynik: ${score}/${totalQuestions}`, 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
};
```

### 3.3 SPRAWDZANIE AUTORYZACJI PRZY STARCIE

**Dodaj na początku App:**
```javascript
const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('user');
    const [isPremium, setIsPremium] = useState(false);
    const [completedSections, setCompletedSections] = useState(new Set());
    
    // 🆕 Sprawdź autoryzację przy starcie
    React.useEffect(() => {
        const checkUserAuth = async () => {
            const user = await API.checkAuth();
            if (user) {
                setIsLoggedIn(true);
                setUserEmail(user.email);
                setUserRole(user.role);
                setIsPremium(user.isPremium);
                setCompletedSections(new Set(user.completedSections));
            }
        };
        checkUserAuth();
    }, []);
    
    // ... reszta kodu
};
```

---

## KROK 4: Dodaj Panel Admin (10 minut)

### 4.1 Załaduj statystyki dashboardu

Znajdź w HTML funkcję która ładuje dane do panelu admin i zamień na:

```javascript
const loadAdminDashboard = async () => {
    try {
        const stats = await API.getAdminStats();
        
        // Użyj statystyk w UI
        // stats.users.total - całkowita liczba użytkowników
        // stats.users.premium - użytkownicy premium
        // stats.users.todayRegistrations - dzisiejsze rejestracje
        // stats.revenue.total - całkowity przychód
        // stats.progress.totalQuizzes - rozwiązane quizy
        
        setAdminStats(stats);
    } catch (error) {
        showToast('Błąd ładowania danych', 'error');
    }
};

// Wywołaj przy wejściu do panelu
React.useEffect(() => {
    if (userRole === 'admin' && currentView === 'admin') {
        loadAdminDashboard();
    }
}, [currentView, userRole]);
```

### 4.2 Zarządzanie użytkownikami

```javascript
const loadUsers = async (page = 1, search = '') => {
    try {
        const data = await API.getUsers(page, 10, search);
        setUsers(data.users);
        setPagination(data.pagination);
    } catch (error) {
        showToast('Błąd', 'error');
    }
};

const handleTogglePremium = async (userId) => {
    try {
        await API.toggleUserPremium(userId, 30); // 30 dni
        loadUsers(); // Odśwież listę
        showToast('Status premium zaktualizowany', 'success');
    } catch (error) {
        showToast('Błąd', 'error');
    }
};

const handleDeleteUser = async (userId) => {
    if (!confirm('Czy na pewno usunąć użytkownika?')) return;
    
    try {
        await API.deleteUser(userId);
        loadUsers(); // Odśwież listę
        showToast('Użytkownik usunięty', 'success');
    } catch (error) {
        showToast('Błąd: ' + error.message, 'error');
    }
};
```

---

## KROK 5: Dodaj Płatności (10 minut)

### 5.1 Obsługa płatności Stripe

Znajdź w HTML modal płatności i zamień handler:

**PRZED:**
```javascript
const handleStripePayment = (plan) => {
    // Symulacja
    setIsPremium(true);
    showToast('Płatność zakończona', 'success');
};
```

**PO:**
```javascript
const handleStripePayment = async (plan) => {
    setPaymentProcessing(true);
    
    try {
        // Opcjonalnie sprawdź kupon
        let validatedCoupon = null;
        if (couponCode) {
            validatedCoupon = await API.validateCoupon(couponCode, plan);
        }
        
        // Utwórz sesję płatności (przekieruje do Stripe)
        await API.createStripePayment(plan, couponCode);
        
        // Użytkownik zostanie przekierowany do Stripe Checkout
        // Po powrocie sprawdź status
        
    } catch (error) {
        showToast('Błąd płatności: ' + error.message, 'error');
        setPaymentProcessing(false);
    }
};
```

### 5.2 Testowa płatność (development)

Dodaj funkcję do testowania płatności bez prawdziwej bramki:

```javascript
const handleTestPayment = async (plan) => {
    try {
        // Utwórz płatność jako pending
        const paymentData = await API.createStripePayment(plan);
        
        // W trybie development możemy od razu ją zatwierdzić
        await API.completeTestPayment(paymentData.payment.id);
        
        // Sprawdź status użytkownika
        const user = await API.checkAuth();
        setIsPremium(user.isPremium);
        
        showToast('Premium aktywowane! (test)', 'success');
    } catch (error) {
        showToast('Błąd: ' + error.message, 'error');
    }
};
```

### 5.3 Walidacja kuponu

```javascript
const handleValidateCoupon = async () => {
    try {
        const coupon = await API.validateCoupon(couponCode, selectedPlan);
        
        // Pokaż informację o zniżce
        setCouponValid(true);
        setCouponDiscount(coupon.discountValue);
        
        if (coupon.discountType === 'percentage') {
            showToast(`Kupon ważny! Zniżka ${coupon.discountValue}%`, 'success');
        } else {
            showToast(`Kupon ważny! Zniżka ${coupon.discountValue} PLN`, 'success');
        }
    } catch (error) {
        setCouponValid(false);
        showToast(error.message, 'error');
    }
};
```

---

## BONUS: Kupony dla Admina

### Tworzenie kuponu

```javascript
const handleCreateCoupon = async () => {
    try {
        const couponData = {
            code: couponCode.toUpperCase(),
            discountType: discountType, // 'percentage' lub 'fixed'
            discountValue: parseInt(discountValue),
            maxUses: maxUses ? parseInt(maxUses) : null,
            validUntil: new Date(validUntil),
            applicablePlans: selectedPlans // ['3months', '6months']
        };
        
        await API.createCoupon(couponData);
        showToast('Kupon utworzony!', 'success');
        
        // Wyczyść formularz
        setCouponCode('');
        setDiscountValue('');
        
        // Odśwież listę
        loadCoupons();
    } catch (error) {
        showToast('Błąd: ' + error.message, 'error');
    }
};

const loadCoupons = async () => {
    try {
        const coupons = await API.getCoupons();
        setCoupons(coupons);
    } catch (error) {
        console.error('Błąd ładowania kuponów');
    }
};
```

---

## ✅ CHECKLIST - Co zrobić?

Zaznaczaj po kolei:

### Backend
- [ ] `npm install` w folderze akademia-backend
- [ ] `npm run seed` - utworzenie użytkowników testowych
- [ ] `npm run dev` - uruchomienie serwera
- [ ] Sprawdź że działa: `curl http://localhost:5000/health`

### Frontend
- [ ] Skopiuj `api-integration.js` do HTML
- [ ] Zamień funkcję `handleLogin` na wersję z API
- [ ] Zamień funkcję `handleRegister` na wersję z API
- [ ] Dodaj `React.useEffect` do sprawdzania autoryzacji
- [ ] Zamień `handleCompleteSection` na wersję z API
- [ ] Zamień `handleQuizSubmit` na wersję z API
- [ ] Dodaj funkcję `loadAdminDashboard` dla panelu admin
- [ ] Zamień `handleStripePayment` na wersję z API

### Testowanie
- [ ] Zarejestruj nowego użytkownika
- [ ] Zaloguj się
- [ ] Ukończ sekcję - sprawdź czy zapisuje się w bazie
- [ ] Rozwiąż quiz - sprawdź czy zapisuje wynik
- [ ] Zaloguj jako admin (`admin@akademia.pl` / `admin123`)
- [ ] Sprawdź panel admin - czy statystyki się ładują
- [ ] Przetestuj płatność (test mode)

---

## 🚨 Najczęstsze Problemy

### Problem 1: "Network error" / CORS
**Rozwiązanie:** Sprawdź czy backend działa na `localhost:5000` i czy `CLIENT_URL` w `.env` to `http://localhost:3000`

### Problem 2: "Token invalid"
**Rozwiązanie:** Wyczyść localStorage i zaloguj się ponownie
```javascript
localStorage.clear();
```

### Problem 3: "Admin access denied"
**Rozwiązanie:** Upewnij się że logujesz się jako `admin@akademia.pl` i że seed został uruchomiony

### Problem 4: Backend nie startuje
**Rozwiązanie:** 
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem 5: MongoDB nie działa
**Rozwiązanie:** 
- Windows: Sprawdź Services → MongoDB
- Mac: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongodb`

---

## 📚 Co dalej?

Po ukończeniu integracji:

1. **Produkcja:**
   - Zmień `JWT_SECRET` w `.env`
   - Dodaj prawdziwe klucze Stripe
   - Zmień `CLIENT_URL` na domenę produkcyjną
   - Deploy na Heroku/DigitalOcean/AWS

2. **Dodatkowe funkcje:**
   - Email notifications (SendGrid)
   - Webhooks Stripe (produkcja)
   - PayPal integration
   - Przelewy24 integration

3. **Dokumentacja:**
   - `README.md` - Pełna dokumentacja
   - `API_TESTS.md` - Testy wszystkich endpointów
   - `SCENARIUSZE.md` - Przykłady użycia

---

## 🎉 Gratulacje!

Jeśli doszedłeś do tego miejsca, Twoja aplikacja ma teraz:
- ✅ Prawdziwy backend z bazą danych
- ✅ System autoryzacji z JWT
- ✅ Panel administracyjny
- ✅ Płatności online
- ✅ System kuponów
- ✅ Pełną obsługę postępów

**Backend jest gotowy do produkcji!** 🚀
