// ==================================================
// PRZYKŁADOWA INTEGRACJA Z FRONTENDEM
// Akademia Biznesowa - API Client
// ==================================================

// Konfiguracja
const API_URL = 'http://localhost:5000/api';

// ==================================================
// HELPER FUNCTIONS
// ==================================================

// Pobierz token z localStorage
const getToken = () => {
    return localStorage.getItem('token');
};

// Zapisz token w localStorage
const setToken = (token) => {
    localStorage.setItem('token', token);
};

// Usuń token
const removeToken = () => {
    localStorage.removeItem('token');
};

// Helper do wykonywania requestów
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
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

const authAPI = {
    // Rejestracja
    register: async (email, password, name) => {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });
        
        if (data.success && data.token) {
            setToken(data.token);
        }
        
        return data;
    },

    // Logowanie
    login: async (email, password) => {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (data.success && data.token) {
            setToken(data.token);
        }
        
        return data;
    },

    // Wylogowanie
    logout: () => {
        removeToken();
    },

    // Pobierz dane zalogowanego użytkownika
    getMe: async () => {
        return await apiRequest('/auth/me');
    },

    // Zmiana hasła
    changePassword: async (currentPassword, newPassword) => {
        return await apiRequest('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    },

    // Żądanie resetu hasła
    forgotPassword: async (email) => {
        return await apiRequest('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    },

    // Reset hasła
    resetPassword: async (token, newPassword) => {
        return await apiRequest(`/auth/reset-password/${token}`, {
            method: 'POST',
            body: JSON.stringify({ newPassword })
        });
    },

    // Sprawdź czy użytkownik jest zalogowany
    isAuthenticated: () => {
        return !!getToken();
    }
};

// ==================================================
// POSTĘPY
// ==================================================

const progressAPI = {
    // Pobierz postępy
    getProgress: async () => {
        return await apiRequest('/progress');
    },

    // Pobierz statystyki
    getStats: async () => {
        return await apiRequest('/progress/stats');
    },

    // Oznacz sekcję jako ukończoną
    completeSection: async (sectionId) => {
        return await apiRequest('/progress/complete-section', {
            method: 'POST',
            body: JSON.stringify({ sectionId })
        });
    },

    // Zapisz wynik quizu
    saveQuizResult: async (quizId, score, totalQuestions, answers) => {
        return await apiRequest('/progress/quiz-result', {
            method: 'POST',
            body: JSON.stringify({ quizId, score, totalQuestions, answers })
        });
    },

    // Pobierz wyniki quizów
    getQuizResults: async () => {
        return await apiRequest('/progress/quiz-results');
    },

    // Resetuj postępy
    resetProgress: async () => {
        return await apiRequest('/progress/reset', {
            method: 'DELETE'
        });
    }
};

// ==================================================
// PREMIUM
// ==================================================

const premiumAPI = {
    // Pobierz dostępne plany
    getPlans: async () => {
        return await apiRequest('/premium/plans');
    },

    // Sprawdź status premium
    checkStatus: async () => {
        return await apiRequest('/premium/status');
    },

    // Aktywuj premium
    activate: async (duration) => {
        return await apiRequest('/premium/activate', {
            method: 'POST',
            body: JSON.stringify({ duration })
        });
    },

    // Anuluj premium
    cancel: async () => {
        return await apiRequest('/premium/cancel', {
            method: 'POST'
        });
    },

    // Symulacja płatności (tylko dla testów)
    simulatePayment: async (email, plan) => {
        return await apiRequest('/premium/simulate-payment', {
            method: 'POST',
            body: JSON.stringify({ email, plan })
        });
    }
};

// ==================================================
// EKSPORT (dla ES6 modules)
// ==================================================

export { authAPI, progressAPI, premiumAPI };

// ==================================================
// PRZYKŁADY UŻYCIA
// ==================================================

// Przykład 1: Rejestracja i logowanie
async function exampleAuthFlow() {
    try {
        // Rejestracja
        const registerResult = await authAPI.register(
            'user@example.com',
            'password123',
            'Jan Kowalski'
        );
        console.log('Zarejestrowano:', registerResult);

        // Logowanie (token zapisany automatycznie)
        const loginResult = await authAPI.login(
            'user@example.com',
            'password123'
        );
        console.log('Zalogowano:', loginResult);

        // Pobierz dane użytkownika
        const userData = await authAPI.getMe();
        console.log('Dane użytkownika:', userData);
    } catch (error) {
        console.error('Błąd:', error.message);
    }
}

// Przykład 2: Zapisywanie postępów
async function exampleProgressFlow() {
    try {
        // Ukończ sekcję
        await progressAPI.completeSection(1);
        console.log('Sekcja 1 ukończona');

        // Zapisz wynik quizu
        const quizResult = await progressAPI.saveQuizResult(
            'quiz-basics',
            8,
            10,
            { 1: 0, 2: 1, 3: 2 }
        );
        console.log('Wynik quizu zapisany:', quizResult);

        // Pobierz statystyki
        const stats = await progressAPI.getStats();
        console.log('Statystyki:', stats);
    } catch (error) {
        console.error('Błąd:', error.message);
    }
}

// Przykład 3: Aktywacja premium
async function examplePremiumFlow() {
    try {
        // Pobierz plany
        const plans = await premiumAPI.getPlans();
        console.log('Dostępne plany:', plans);

        // Symuluj płatność
        const payment = await premiumAPI.simulatePayment(
            'user@example.com',
            'monthly'
        );
        console.log('Płatność przetworzona:', payment);

        // Sprawdź status
        const status = await premiumAPI.checkStatus();
        console.log('Status premium:', status);
    } catch (error) {
        console.error('Błąd:', error.message);
    }
}

// ==================================================
// REACT HOOKS (Przykład)
// ==================================================

// useAuth hook
function useAuth() {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        if (authAPI.isAuthenticated()) {
            try {
                const data = await authAPI.getMe();
                setUser(data.user);
            } catch (error) {
                authAPI.logout();
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const data = await authAPI.login(email, password);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
    };

    const register = async (email, password, name) => {
        const data = await authAPI.register(email, password, name);
        setUser(data.user);
        return data;
    };

    return { user, loading, login, logout, register };
}

// useProgress hook
function useProgress() {
    const [progress, setProgress] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const loadProgress = async () => {
        setLoading(true);
        try {
            const data = await progressAPI.getProgress();
            setProgress(data.progress);
        } catch (error) {
            console.error('Error loading progress:', error);
        }
        setLoading(false);
    };

    const completeSection = async (sectionId) => {
        const data = await progressAPI.completeSection(sectionId);
        setProgress(prev => ({
            ...prev,
            completedSections: data.completedSections
        }));
    };

    return { progress, loading, loadProgress, completeSection };
}

// ==================================================
// VUE COMPOSABLE (Przykład)
// ==================================================

// useAuth composable
function useAuthVue() {
    const user = Vue.ref(null);
    const loading = Vue.ref(true);

    const checkAuth = async () => {
        if (authAPI.isAuthenticated()) {
            try {
                const data = await authAPI.getMe();
                user.value = data.user;
            } catch (error) {
                authAPI.logout();
            }
        }
        loading.value = false;
    };

    const login = async (email, password) => {
        const data = await authAPI.login(email, password);
        user.value = data.user;
        return data;
    };

    const logout = () => {
        authAPI.logout();
        user.value = null;
    };

    Vue.onMounted(() => {
        checkAuth();
    });

    return { user, loading, login, logout };
}

// ==================================================
// VANILLA JAVASCRIPT (Przykład)
// ==================================================

// Formularz logowania
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const result = await authAPI.login(email, password);
        
        if (result.success) {
            alert('Zalogowano pomyślnie!');
            window.location.href = '/dashboard';
        }
    } catch (error) {
        alert('Błąd logowania: ' + error.message);
    }
});

// Formularz rejestracji
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;

    try {
        const result = await authAPI.register(email, password, name);
        
        if (result.success) {
            alert('Rejestracja zakończona sukcesem!');
            window.location.href = '/dashboard';
        }
    } catch (error) {
        alert('Błąd rejestracji: ' + error.message);
    }
});

// Przycisk wylogowania
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    authAPI.logout();
    window.location.href = '/login';
});

// Załaduj postępy
async function loadUserProgress() {
    try {
        const progress = await progressAPI.getProgress();
        console.log('Postępy użytkownika:', progress);
        
        // Zaktualizuj UI
        document.getElementById('completedSections').textContent = 
            progress.progress.completedSections.length;
    } catch (error) {
        console.error('Błąd ładowania postępów:', error);
    }
}

// Oznacz sekcję jako ukończoną
async function markSectionComplete(sectionId) {
    try {
        await progressAPI.completeSection(sectionId);
        alert('Sekcja ukończona!');
        loadUserProgress(); // Odśwież postępy
    } catch (error) {
        alert('Błąd: ' + error.message);
    }
}
