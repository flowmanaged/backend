# 🔍 REVIEW BACKENDU - Integracja z HTML Frontend

## 📋 Spis treści
1. [Analiza Frontend](#analiza-frontend)
2. [Co jest gotowe w Backend](#co-jest-gotowe)
3. [Co trzeba dodać](#co-trzeba-dodać)
4. [Plan integracji](#plan-integracji)
5. [Konkretne zmiany](#konkretne-zmiany)

---

## 1️⃣ ANALIZA FRONTEND

### Funkcje obecne w HTML:

#### ✅ Autoryzacja i użytkownicy
- [x] Rejestracja użytkownika
- [x] Logowanie
- [x] Reset hasła (forgot password)
- [x] Zmiana hasła
- [x] Role użytkowników (admin/user)
- [x] Profile użytkownika

#### ✅ System postępów
- [x] Zapisywanie ukończonych sekcji
- [x] Wyniki quizów
- [x] Statystyki użytkownika
- [x] Historia nauki

#### ✅ Premium
- [x] Status premium
- [x] Plany cenowe (3, 6, 12 miesięcy)
- [x] Aktywacja premium
- [x] Integracja płatności

#### ✅ Panel Administracyjny
- [x] Dashboard ze statystykami
- [x] Zarządzanie użytkownikami
- [x] Historia zakupów
- [x] Zarządzanie dostępem
- [x] Edycja treści
- [x] Raporty
- [x] Promocje/kupony
- [x] Komunikacja (email/powiadomienia)
- [x] Logi systemowe
- [x] Ustawienia

#### ✅ Płatności
- [x] Stripe integration
- [x] PayPal integration
- [x] Przelewy24 integration
- [x] Przetwarzanie płatności

---

## 2️⃣ CO JEST GOTOWE W BACKEND

### ✅ DZIAŁA (100% zgodne z frontend):

#### Autoryzacja - `/api/auth`
```javascript
✅ POST /register         - Rejestracja
✅ POST /login           - Logowanie
✅ GET  /me              - Dane użytkownika
✅ PUT  /change-password - Zmiana hasła
✅ POST /forgot-password - Reset hasła
✅ POST /reset-password/:token - Potwierdzenie resetu
```

#### Postępy - `/api/progress`
```javascript
✅ GET    /              - Postępy użytkownika
✅ GET    /stats         - Statystyki
✅ POST   /complete-section - Ukończ sekcję
✅ POST   /quiz-result   - Wynik quizu
✅ GET    /quiz-results  - Historia quizów
✅ DELETE /reset         - Reset postępów
```

#### Premium - `/api/premium`
```javascript
✅ GET  /plans           - Plany cenowe
✅ GET  /status          - Status premium
✅ POST /activate        - Aktywuj premium
✅ POST /cancel          - Anuluj premium
✅ POST /simulate-payment - Symulacja płatności (dev)
```

---

## 3️⃣ CO TRZEBA DODAĆ DO BACKEND

### ❌ BRAKUJE (wymagane dla pełnej funkcjonalności):

#### 1. Panel Administracyjny
```javascript
❌ GET    /api/admin/stats              - Dashboard stats
❌ GET    /api/admin/users              - Lista użytkowników
❌ GET    /api/admin/users/:id          - Szczegóły użytkownika
❌ PUT    /api/admin/users/:id          - Edycja użytkownika
❌ DELETE /api/admin/users/:id          - Usuń użytkownika
❌ POST   /api/admin/users/:id/toggle-premium - Toggle premium
❌ GET    /api/admin/purchases          - Historia zakupów
❌ GET    /api/admin/logs               - Logi systemowe
❌ POST   /api/admin/communication      - Wyślij wiadomość
```

#### 2. System płatności (integracje)
```javascript
❌ POST /api/payments/stripe/create-session    - Stripe checkout
❌ POST /api/payments/stripe/webhook          - Stripe webhook
❌ POST /api/payments/paypal/create-order     - PayPal order
❌ POST /api/payments/paypal/capture          - PayPal capture
❌ POST /api/payments/p24/create              - P24 płatność
❌ POST /api/payments/p24/callback            - P24 callback
❌ GET  /api/payments/history                 - Historia płatności
```

#### 3. Promocje i kupony
```javascript
❌ POST /api/coupons/validate    - Walidacja kuponu
❌ GET  /api/coupons/           - Lista kuponów (admin)
❌ POST /api/coupons/           - Utwórz kupon (admin)
❌ DELETE /api/coupons/:code    - Usuń kupon (admin)
```

#### 4. Komunikacja
```javascript
❌ POST /api/notifications/send       - Wyślij powiadomienie
❌ GET  /api/notifications/          - Powiadomienia użytkownika
❌ PUT  /api/notifications/:id/read  - Oznacz jako przeczytane
```

#### 5. Role i uprawnienia
```javascript
❌ Middleware do sprawdzania roli admin
❌ Endpoint do zmiany roli użytkownika
```

---

## 4️⃣ PLAN INTEGRACJI

### FAZA 1: Podstawowa integracja (1-2 dni)
**Priorytet: WYSOKI**

1. ✅ Podłącz istniejące endpointy auth
2. ✅ Podłącz postępy i quizy
3. ✅ Podłącz system premium
4. ⚠️ Zastąp localStorage API calls
5. ⚠️ Dodaj error handling

**Co zrobić:**
```javascript
// W HTML zamień:
localStorage.setItem('token', token)
// Na:
await fetch('/api/auth/login', {...})
```

### FAZA 2: Panel Admin (2-3 dni)
**Priorytet: ŚREDNI**

1. ❌ Dodaj role do User model
2. ❌ Stwórz admin middleware
3. ❌ Dodaj admin endpointy
4. ❌ Dashboard statistics
5. ❌ User management

### FAZA 3: Płatności (3-5 dni)
**Priorytet: WYSOKI (jeśli produkcja)**

1. ❌ Integracja Stripe
2. ❌ Integracja PayPal
3. ❌ Integracja Przelewy24
4. ❌ Webhooks
5. ❌ Historia płatności

### FAZA 4: Dodatkowe funkcje (2-3 dni)
**Priorytet: NISKI**

1. ❌ System kuponów
2. ❌ Powiadomienia
3. ❌ Email notifications
4. ❌ Logi systemowe

---

## 5️⃣ KONKRETNE ZMIANY

### A) ZMIANY W BACKEND (Do dodania)

#### 1. Dodaj role do User Model

```javascript
// models/User.js - DODAJ
role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
},
```

#### 2. Stwórz Admin Middleware

```javascript
// middleware/admin.js - NOWY PLIK
exports.adminOnly = async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Dostęp tylko dla administratorów'
        });
    }
    next();
};
```

#### 3. Dodaj Admin Controller

```javascript
// controllers/adminController.js - NOWY PLIK

// Dashboard stats
exports.getStats = async (req, res) => {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const todayRegistrations = await User.countDocuments({
        createdAt: { $gte: new Date().setHours(0,0,0,0) }
    });
    
    res.json({
        success: true,
        stats: {
            totalUsers,
            premiumUsers,
            freeUsers: totalUsers - premiumUsers,
            todayRegistrations,
            // ... więcej statystyk
        }
    });
};

// Lista użytkowników
exports.getUsers = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = search 
        ? { email: { $regex: search, $options: 'i' } }
        : {};
    
    const users = await User.find(query)
        .select('-password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
    
    const count = await User.countDocuments(query);
    
    res.json({
        success: true,
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    });
};

// Toggle premium
exports.toggleUserPremium = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Użytkownik nie znaleziony'
        });
    }
    
    user.isPremium = !user.isPremium;
    if (user.isPremium) {
        // Dodaj 30 dni
        user.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else {
        user.premiumExpiresAt = null;
    }
    
    await user.save();
    
    res.json({
        success: true,
        user
    });
};
```

#### 4. Dodaj Admin Routes

```javascript
// routes/adminRoutes.js - NOWY PLIK
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// Wszystkie endpointy wymagają admin
router.use(protect, adminOnly);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/toggle-premium', adminController.toggleUserPremium);

module.exports = router;
```

#### 5. Dodaj Payment Model

```javascript
// models/Payment.js - NOWY PLIK
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'PLN'
    },
    plan: {
        type: String,
        enum: ['3months', '6months', '12months'],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'paypal', 'p24'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: String,
    metadata: Object
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
```

#### 6. Dodaj Payment Controller (przykład Stripe)

```javascript
// controllers/paymentController.js - NOWY PLIK
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const User = require('../models/User');

// Stripe checkout session
exports.createStripeSession = async (req, res) => {
    try {
        const { plan } = req.body; // '3months', '6months', '12months'
        const user = req.user;
        
        // Ceny planów
        const prices = {
            '3months': 9900,  // 99.00 PLN w groszach
            '6months': 19900,
            '12months': 29900
        };
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'pln',
                    product_data: {
                        name: `Plan Premium - ${plan}`,
                        description: 'Dostęp do wszystkich sekcji premium'
                    },
                    unit_amount: prices[plan]
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
            client_reference_id: user._id.toString(),
            metadata: {
                userId: user._id.toString(),
                plan: plan
            }
        });
        
        // Zapisz płatność jako pending
        await Payment.create({
            user: user._id,
            amount: prices[plan] / 100,
            currency: 'PLN',
            plan: plan,
            paymentMethod: 'stripe',
            status: 'pending',
            transactionId: session.id
        });
        
        res.json({
            success: true,
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas tworzenia sesji płatności',
            error: error.message
        });
    }
};

// Stripe webhook
exports.stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const plan = session.metadata.plan;
        
        // Aktywuj premium
        const user = await User.findById(userId);
        if (user) {
            const duration = parseInt(plan.replace('months', ''));
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + duration);
            
            user.isPremium = true;
            user.premiumExpiresAt = expiresAt;
            await user.save();
            
            // Zaktualizuj payment
            await Payment.findOneAndUpdate(
                { transactionId: session.id },
                { status: 'completed' }
            );
        }
    }
    
    res.json({ received: true });
};
```

### B) ZMIANY W FRONTEND (HTML)

#### 1. Dodaj konfigurację API

```javascript
// Na początku skryptu w HTML
const API_URL = 'http://localhost:5000/api';

// Helper do API calls
const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Błąd API');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};
```

#### 2. Zamień localStorage calls na API calls

**PRZED (localStorage):**
```javascript
// Stara wersja
const handleLogin = async (email, password) => {
    // Symulacja - zapisz w localStorage
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
};
```

**PO (API):**
```javascript
// Nowa wersja z prawdziwym API
const handleLogin = async (email, password) => {
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            setIsLoggedIn(true);
            setUserEmail(data.user.email);
            setIsPremium(data.user.isPremium);
            setUserRole(data.user.role);
            showToast('Zalogowano pomyślnie!', 'success');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
};
```

#### 3. Integracja płatności Stripe

**Dodaj w modal płatności:**
```javascript
const handleStripePayment = async (plan) => {
    setPaymentProcessing(true);
    
    try {
        const data = await apiCall('/payments/stripe/create-session', {
            method: 'POST',
            body: JSON.stringify({ plan })
        });
        
        if (data.success) {
            // Przekieruj do Stripe Checkout
            window.location.href = data.url;
        }
    } catch (error) {
        showToast('Błąd płatności: ' + error.message, 'error');
        setPaymentProcessing(false);
    }
};
```

#### 4. Panel Admin - pobierz statystyki

```javascript
const loadAdminStats = async () => {
    try {
        const data = await apiCall('/admin/stats');
        
        if (data.success) {
            setAdminStats(data.stats);
        }
    } catch (error) {
        console.error('Błąd ładowania statystyk:', error);
    }
};

// Wywołaj przy wejściu do panelu admin
React.useEffect(() => {
    if (userRole === 'admin' && currentView === 'admin') {
        loadAdminStats();
    }
}, [currentView, userRole]);
```

---

## 6️⃣ PRIORYTETYZACJA

### ⚡ ZRÓB TO NAJPIERW (Dzień 1):

1. **Podłącz autoryzację**
   - Login/Register
   - Token handling
   - Error handling

2. **Podłącz postępy**
   - Complete section
   - Quiz results
   - Stats

3. **Testuj podstawowy flow**
   - Rejestracja → Logowanie → Nauka → Quiz

### 🔥 POTEM (Tydzień 1):

4. **Dodaj role admina**
   - Role field w User
   - Admin middleware
   - Admin routes

5. **Panel admin - podstawy**
   - Dashboard stats
   - Lista użytkowników
   - Toggle premium

### 💰 PÓŹNIEJ (Tydzień 2-3):

6. **Integracja płatności**
   - Stripe (najpopularniejszy)
   - PayPal (opcjonalnie)
   - P24 (dla PL)

7. **Dodatkowe funkcje**
   - Kupony
   - Powiadomienia
   - Email

---

## 7️⃣ SZYBKI START (15 minut)

### Krok 1: Zaktualizuj User model
```bash
# Dodaj pole role do User.js
```

### Krok 2: Utwórz plik z helper funkcjami
```bash
# Skopiuj funkcję apiCall do HTML
```

### Krok 3: Zamień pierwsze localStorage na API
```bash
# Zaczynając od login/register
```

### Krok 4: Testuj
```bash
npm run dev
# Otwórz HTML i przetestuj login
```

---

## 📊 PODSUMOWANIE

### ✅ CO DZIAŁA OD RAZU:
- Autoryzacja (login, register, reset)
- Postępy (sekcje, quizy)
- Premium (status, aktywacja)

### ⚠️ CO WYMAGA PRACY:
- Panel administracyjny (2-3 dni)
- Integracje płatności (3-5 dni)
- Kupony i promocje (1-2 dni)

### 🎯 KOŃCOWY REZULTAT:
Pełnowartościowa platforma z:
- ✅ Funkcjonalną autoryzacją
- ✅ Systemem postępów
- ✅ Premium features
- ✅ Panelem admin
- ✅ Płatnościami online
- ✅ Kuponami
- ✅ Powiadomieniami

**BACKEND JEST 60% GOTOWY - Brakuje głównie panelu admin i płatności!**
