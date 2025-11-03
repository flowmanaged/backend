// ==================================================
// INTEGRACJA FRONTENDU Z BACKENDEM
// Akademia Biznesowa - Kompletny plik integracyjny
// ==================================================

// KONFIGURACJA
const API_URL = 'http://localhost:5000/api';

// ==================================================
// HELPER FUNCTIONS
// ==================================================

// Funkcja do wykonywania requestów do API
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
            throw new Error(data.message || 'Wystąpił błąd');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// ==================================================
// AUTORYZACJA
// ==================================================

// Rejestracja użytkownika
const register = async (email, password, name = '') => {
    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            return data.user;
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

// Logowanie użytkownika
const login = async (email, password) => {
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            return data.user;
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

// Wylogowanie
const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
};

// Sprawdź czy użytkownik jest zalogowany
const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const data = await apiCall('/auth/me');
        return data.success ? data.user : null;
    } catch (error) {
        localStorage.removeItem('token');
        return null;
    }
};

// Zmiana hasła
const changePassword = async (currentPassword, newPassword) => {
    try {
        const data = await apiCall('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Reset hasła - krok 1
const forgotPassword = async (email) => {
    try {
        const data = await apiCall('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Reset hasła - krok 2
const resetPassword = async (token, newPassword) => {
    try {
        const data = await apiCall(`/auth/reset-password/${token}`, {
            method: 'POST',
            body: JSON.stringify({ newPassword })
        });
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

// ==================================================
// POSTĘPY
// ==================================================

// Oznacz sekcję jako ukończoną
const completeSection = async (sectionId) => {
    try {
        const data = await apiCall('/progress/complete-section', {
            method: 'POST',
            body: JSON.stringify({ sectionId })
        });
        return data.completedSections;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Zapisz wynik quizu
const saveQuizResult = async (quizId, score, totalQuestions, answers) => {
    try {
        const data = await apiCall('/progress/quiz-result', {
            method: 'POST',
            body: JSON.stringify({ quizId, score, totalQuestions, answers })
        });
        return data.quizResults;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Pobierz postępy użytkownika
const getProgress = async () => {
    try {
        const data = await apiCall('/progress');
        return data.progress;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Pobierz statystyki użytkownika
const getStats = async () => {
    try {
        const data = await apiCall('/progress/stats');
        return data.stats;
    } catch (error) {
        throw new Error(error.message);
    }
};

// ==================================================
// PREMIUM
// ==================================================

// Pobierz dostępne plany
const getPlans = async () => {
    try {
        const data = await apiCall('/premium/plans');
        return data.plans;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Sprawdź status premium
const checkPremiumStatus = async () => {
    try {
        const data = await apiCall('/premium/status');
        return data.premium;
    } catch (error) {
        throw new Error(error.message);
    }
};

// ==================================================
// PŁATNOŚCI
// ==================================================

// Utwórz sesję płatności Stripe
const createStripePayment = async (plan, couponCode = null) => {
    try {
        const body = { plan };
        if (couponCode) body.couponCode = couponCode;
        
        const data = await apiCall('/payments/stripe/create-session', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        
        if (data.success) {
            // Przekieruj do Stripe Checkout
            window.location.href = data.url;
        }
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Utwórz zamówienie PayPal
const createPayPalPayment = async (plan, couponCode = null) => {
    try {
        const body = { plan };
        if (couponCode) body.couponCode = couponCode;
        
        const data = await apiCall('/payments/paypal/create-order', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Przechwycenie płatności PayPal
const capturePayPalPayment = async (orderId) => {
    try {
        const data = await apiCall('/payments/paypal/capture', {
            method: 'POST',
            body: JSON.stringify({ orderId })
        });
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Pobierz historię płatności
const getPaymentHistory = async () => {
    try {
        const data = await apiCall('/payments/history');
        return data.payments;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Testowa płatność (tylko development)
const completeTestPayment = async (paymentId) => {
    try {
        const data = await apiCall('/payments/complete-test', {
            method: 'POST',
            body: JSON.stringify({ paymentId })
        });
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

// ==================================================
// KUPONY
// ==================================================

// Waliduj kupon
const validateCoupon = async (code, plan) => {
    try {
        const data = await apiCall('/coupons/validate', {
            method: 'POST',
            body: JSON.stringify({ code, plan })
        });
        return data.coupon;
    } catch (error) {
        throw new Error(error.message);
    }
};

// ==================================================
// PANEL ADMIN
// ==================================================

// Pobierz statystyki dashboardu
const getAdminStats = async () => {
    try {
        const data = await apiCall('/admin/stats');
        return data.stats;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Pobierz listę użytkowników
const getUsers = async (page = 1, limit = 10, search = '', filter = 'all', sort = 'newest') => {
    try {
        const params = new URLSearchParams({ page, limit, search, filter, sort });
        const data = await apiCall(`/admin/users?${params}`);
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Pobierz szczegóły użytkownika
const getUserDetails = async (userId) => {
    try {
        const data = await apiCall(`/admin/users/${userId}`);
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Aktualizuj użytkownika
const updateUser = async (userId, updates) => {
    try {
        const data = await apiCall(`/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        return data.user;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Usuń użytkownika
const deleteUser = async (userId) => {
    try {
        const data = await apiCall(`/admin/users/${userId}`, {
            method: 'DELETE'
        });
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Przełącz status premium użytkownika
const toggleUserPremium = async (userId, duration = 30) => {
    try {
        const data = await apiCall(`/admin/users/${userId}/toggle-premium`, {
            method: 'POST',
            body: JSON.stringify({ duration })
        });
        return data.user;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Pobierz historię płatności (admin)
const getAdminPayments = async (page = 1, limit = 20, status = 'all') => {
    try {
        const params = new URLSearchParams({ page, limit, status });
        const data = await apiCall(`/admin/payments?${params}`);
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Pobierz wszystkie kupony (admin)
const getCoupons = async () => {
    try {
        const data = await apiCall('/coupons');
        return data.coupons;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Utwórz kupon (admin)
const createCoupon = async (couponData) => {
    try {
        const data = await apiCall('/coupons', {
            method: 'POST',
            body: JSON.stringify(couponData)
        });
        return data.coupon;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Aktualizuj kupon (admin)
const updateCoupon = async (code, updates) => {
    try {
        const data = await apiCall(`/coupons/${code}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        return data.coupon;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Usuń kupon (admin)
const deleteCoupon = async (code) => {
    try {
        const data = await apiCall(`/coupons/${code}`, {
            method: 'DELETE'
        });
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Przełącz aktywność kuponu (admin)
const toggleCoupon = async (code) => {
    try {
        const data = await apiCall(`/coupons/${code}/toggle`, {
            method: 'POST'
        });
        return data.coupon;
    } catch (error) {
        throw new Error(error.message);
    }
};

// ==================================================
// EKSPORT WSZYSTKICH FUNKCJI
// ==================================================

const API = {
    // Auth
    register,
    login,
    logout,
    checkAuth,
    changePassword,
    forgotPassword,
    resetPassword,
    
    // Progress
    completeSection,
    saveQuizResult,
    getProgress,
    getStats,
    
    // Premium
    getPlans,
    checkPremiumStatus,
    
    // Payments
    createStripePayment,
    createPayPalPayment,
    capturePayPalPayment,
    getPaymentHistory,
    completeTestPayment,
    
    // Coupons
    validateCoupon,
    
    // Admin
    getAdminStats,
    getUsers,
    getUserDetails,
    updateUser,
    deleteUser,
    toggleUserPremium,
    getAdminPayments,
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCoupon
};

// ==================================================
// INSTRUKCJE UŻYCIA W HTML
// ==================================================

/*
KROK 1: Dodaj ten plik do swojego HTML:
<script src="api-integration.js"></script>

KROK 2: Użyj funkcji w swoim kodzie React:

// Przykład logowania
const handleLogin = async (email, password) => {
    try {
        const user = await API.login(email, password);
        setIsLoggedIn(true);
        setUserEmail(user.email);
        setIsPremium(user.isPremium);
        setUserRole(user.role);
        showToast('Zalogowano pomyślnie!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
};

// Przykład ukończenia sekcji
const handleCompleteSection = async (sectionId) => {
    try {
        const completedSections = await API.completeSection(sectionId);
        setCompletedSections(new Set(completedSections));
        showToast('Sekcja ukończona!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
};

// Przykład płatności
const handlePayment = async (plan) => {
    setPaymentProcessing(true);
    try {
        await API.createStripePayment(plan, couponCode);
        // Użytkownik zostanie przekierowany do Stripe
    } catch (error) {
        showToast('Błąd płatności: ' + error.message, 'error');
        setPaymentProcessing(false);
    }
};

// Przykład panelu admin
const loadAdminDashboard = async () => {
    try {
        const stats = await API.getAdminStats();
        setAdminStats(stats);
    } catch (error) {
        showToast('Błąd ładowania danych: ' + error.message, 'error');
    }
};

KROK 3: Sprawdź autoryzację przy ładowaniu strony:

React.useEffect(() => {
    const initAuth = async () => {
        const user = await API.checkAuth();
        if (user) {
            setIsLoggedIn(true);
            setUserEmail(user.email);
            setIsPremium(user.isPremium);
            setUserRole(user.role);
            setCompletedSections(new Set(user.completedSections));
        }
    };
    initAuth();
}, []);
*/
