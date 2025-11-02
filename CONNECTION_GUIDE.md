# 🔗 Połączenie Frontendu z Backendem

## Szybkie połączenie w 3 krokach

### Krok 1: Uruchom backend
```bash
cd backend
npm start
```
Backend będzie dostępny na: `http://localhost:3000`

### Krok 2: Zmień frontend

Otwórz plik HTML frontendu i dodaj na początku skryptu (przed `const { useState } = React;`):

```javascript
// Konfiguracja API
const API_URL = 'http://localhost:3000/api';

// Helper do wykonywania requestów
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Coś poszło nie tak');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### Krok 3: Zmień funkcje autoryzacji

Zamień symulowane funkcje na prawdziwe wywołania API:

**LOGOWANIE:**
```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  if (!email || !password) {
    setMessage('Proszę wypełnić wszystkie pola');
    return;
  }
  
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    // Zapisz token
    localStorage.setItem('authToken', data.token);
    
    setMessage('Logowanie pomyślne!');
    setTimeout(() => {
      setIsLoggedIn(true);
      setUserEmail(email);
      setIsPremium(data.user.isPremium);
      setShowAuthModal(false);
      setMessage('');
    }, 1000);
  } catch (error) {
    setMessage(error.message || 'Błąd logowania');
  }
};
```

**REJESTRACJA:**
```javascript
const handleRegister = async (e) => {
  e.preventDefault();
  if (!email || !password || !confirmPassword) {
    setMessage('Proszę wypełnić wszystkie pola');
    return;
  }
  if (password !== confirmPassword) {
    setMessage('Hasła nie są zgodne');
    return;
  }
  if (!acceptTerms) {
    setMessage('Musisz zaakceptować regulamin');
    return;
  }
  
  try {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    setMessage('Konto utworzone! Sprawdź email w celu potwierdzenia.');
    setTimeout(() => {
      setAuthView('login');
      setMessage('');
    }, 3000);
  } catch (error) {
    setMessage(error.message || 'Błąd rejestracji');
  }
};
```

**RESET HASŁA:**
```javascript
const handleForgotPassword = async (e) => {
  e.preventDefault();
  if (!email) {
    setMessage('Proszę podać adres email');
    return;
  }
  
  try {
    await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    
    setMessage('Link do resetowania hasła został wysłany na email.');
    setTimeout(() => {
      setAuthView('login');
      setMessage('');
    }, 3000);
  } catch (error) {
    setMessage(error.message || 'Błąd wysyłania linku');
  }
};
```

**AKTYWACJA PREMIUM:**
```javascript
const handleUpgradePremium = async () => {
  try {
    await apiRequest('/user/upgrade-premium', {
      method: 'POST'
    });
    
    setIsPremium(true);
    setShowPremiumModal(false);
    alert('Konto Premium aktywowane!');
  } catch (error) {
    alert(error.message || 'Błąd aktywacji Premium');
  }
};
```

**ZAPISYWANIE POSTĘPU:**
```javascript
const handleCompleteSection = async (sectionId) => {
  try {
    await apiRequest(`/progress/sections/${sectionId}/complete`, {
      method: 'POST'
    });
    
    const newCompleted = new Set(completedSections);
    newCompleted.add(sectionId);
    setCompletedSections(newCompleted);
  } catch (error) {
    console.error('Błąd zapisywania postępu:', error);
  }
};
```

**ZAPISYWANIE WYNIKU QUIZU:**
```javascript
const handleSubmitQuiz = async () => {
  try {
    await apiRequest('/progress/quiz', {
      method: 'POST',
      body: JSON.stringify({
        quizId: 'main-quiz',
        score: score,
        totalQuestions: availableQuestions.length,
        answers: quizAnswers
      })
    });
    
    setShowResults(true);
  } catch (error) {
    console.error('Błąd zapisywania wyniku:', error);
    setShowResults(true); // Pokaż wyniki mimo błędu
  }
};
```

**POBIERANIE PROFILU PO ZALOGOWANIU:**
```javascript
const loadUserProfile = async () => {
  try {
    const data = await apiRequest('/user/profile');
    
    setUserEmail(data.user.email);
    setIsPremium(data.user.isPremium);
    
    // Załaduj postępy
    const progressData = await apiRequest('/progress/sections');
    setCompletedSections(new Set(
      Object.keys(progressData.progress).filter(
        key => progressData.progress[key].completed
      ).map(Number)
    ));
  } catch (error) {
    console.error('Błąd ładowania profilu:', error);
    // Jeśli token nieprawidłowy, wyloguj
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
  }
};
```

**SPRAWDŹ TOKEN PRZY STARCIE:**
```javascript
// Dodaj w useEffect
React.useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    setIsLoggedIn(true);
    loadUserProfile();
  }
}, []);
```

**WYLOGOWANIE:**
```javascript
const handleLogout = () => {
  localStorage.removeItem('authToken');
  setIsLoggedIn(false);
  setUserEmail('');
  setIsPremium(false);
  setCompletedSections(new Set());
};
```

## 🔧 Dodatkowe funkcje

### Obsługa błędów 401 (token wygasł)
```javascript
const apiRequest = async (endpoint, options = {}) => {
  // ... (poprzedni kod)
  
  if (response.status === 401) {
    // Token wygasł
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    alert('Sesja wygasła. Zaloguj się ponownie.');
    return;
  }
  
  // ... (reszta kodu)
};
```

### Ładowanie (Loading state)
```javascript
const [isLoading, setIsLoading] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    // ... logika logowania
  } finally {
    setIsLoading(false);
  }
};

// W JSX:
<button disabled={isLoading}>
  {isLoading ? 'Ładowanie...' : 'Zaloguj się'}
</button>
```

## 🧪 Testowanie

1. Uruchom backend: `npm start` w folderze backend
2. Otwórz frontend w przeglądarce
3. Otwórz Console (F12 → Console)
4. Zarejestruj się - sprawdź czy dostałeś email
5. Zaloguj się - sprawdź Console, czy jest błąd
6. Oznacz sekcję jako ukończoną - odśwież stronę, czy jest zapisane

## ❗ Częste problemy

**CORS Error**
- Sprawdź czy backend działa na `localhost:3000`
- Sprawdź czy w `.env` jest: `FRONTEND_URL=http://localhost:8080`

**401 Unauthorized**
- Token wygasł lub jest nieprawidłowy
- Sprawdź czy `localStorage.getItem('authToken')` zwraca token

**Email nie przychodzi**
- Sprawdź folder SPAM
- Sprawdź logi backendu w terminalu
- Sprawdź konfigurację Gmail

**Postępy nie zapisują się**
- Sprawdź Console czy są błędy
- Sprawdź czy użytkownik jest zalogowany
- Sprawdź czy token jest poprawny

## 📱 Deployment

Gdy będziesz wdrażać na produkcję:

1. Backend na serwerze (np. Heroku)
2. Frontend na hostingu (np. Netlify)
3. Zmień `API_URL` na adres produkcyjny
4. Zaktualizuj `FRONTEND_URL` w `.env` backendu
5. Użyj HTTPS!

---

Masz pytania? Zobacz **README.md** w folderze backend lub napisz! 😊
