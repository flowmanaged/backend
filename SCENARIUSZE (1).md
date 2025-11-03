# 📖 Scenariusze Użycia - Akademia Biznesowa Backend

## Spis treści
1. [Podstawowy flow użytkownika](#1-podstawowy-flow-użytkownika)
2. [Scenariusz uczenia się](#2-scenariusz-uczenia-się)
3. [Aktywacja Premium](#3-aktywacja-premium)
4. [Reset hasła](#4-reset-hasła)
5. [Dashboard użytkownika](#5-dashboard-użytkownika)

---

## 1. Podstawowy flow użytkownika

### Rejestracja → Logowanie → Pierwsze lekcje

```javascript
// KROK 1: Rejestracja nowego użytkownika
const registerUser = async () => {
    const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'jan.kowalski@example.com',
            password: 'bezpieczneHaslo123',
            name: 'Jan Kowalski'
        })
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Zapisz token w localStorage
        localStorage.setItem('token', data.token);
        console.log('Użytkownik zarejestrowany:', data.user);
        return data.token;
    }
};

// KROK 2: Pobranie danych użytkownika
const getUserData = async (token) => {
    const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 
            'Authorization': `Bearer ${token}` 
        }
    });
    
    const data = await response.json();
    console.log('Dane użytkownika:', data.user);
    
    // Zaktualizuj UI z danymi użytkownika
    document.getElementById('userName').textContent = data.user.name;
    document.getElementById('userEmail').textContent = data.user.email;
    
    return data.user;
};

// KROK 3: Zacznij naukę - oznacz pierwszą sekcję jako ukończoną
const startLearning = async (token) => {
    const response = await fetch('http://localhost:5000/api/progress/complete-section', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ sectionId: 1 })
    });
    
    const data = await response.json();
    console.log('Sekcja 1 ukończona!', data);
};

// Uruchom pełny flow
async function runBasicFlow() {
    try {
        const token = await registerUser();
        await getUserData(token);
        await startLearning(token);
        console.log('✅ Podstawowy flow zakończony!');
    } catch (error) {
        console.error('❌ Błąd:', error);
    }
}
```

---

## 2. Scenariusz uczenia się

### Użytkownik uczy się przez kilka dni

```javascript
// DZIEŃ 1: Ukończ 3 sekcje
async function day1Learning(token) {
    console.log('📚 Dzień 1: Nauka podstaw');
    
    // Ukończ sekcje 1, 2, 3
    for (let i = 1; i <= 3; i++) {
        const response = await fetch('http://localhost:5000/api/progress/complete-section', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ sectionId: i })
        });
        
        const data = await response.json();
        console.log(`✅ Sekcja ${i} ukończona`);
    }
    
    // Zrób quiz podstawowy
    const quizResponse = await fetch('http://localhost:5000/api/progress/quiz-result', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
            quizId: 'quiz-basics',
            score: 7,
            totalQuestions: 10,
            answers: {
                '1': 0, '2': 1, '3': 2, '4': 0, '5': 1,
                '6': 3, '7': 0, '8': 2, '9': 1, '10': 0
            }
        })
    });
    
    const quizData = await quizResponse.json();
    console.log('📝 Quiz podstawowy: 7/10 punktów');
}

// DZIEŃ 3: Kontynuuj naukę
async function day3Learning(token) {
    console.log('📚 Dzień 3: Zaawansowane tematy');
    
    // Ukończ sekcje 4, 5
    for (let i = 4; i <= 5; i++) {
        await fetch('http://localhost:5000/api/progress/complete-section', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ sectionId: i })
        });
        console.log(`✅ Sekcja ${i} ukończona`);
    }
    
    // Sprawdź postępy
    const progressResponse = await fetch('http://localhost:5000/api/progress/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const stats = await progressResponse.json();
    console.log('📊 Statystyki:', stats.stats);
    console.log(`   - Ukończone sekcje: ${stats.stats.completedSections}`);
    console.log(`   - Średni wynik: ${stats.stats.averageScore}%`);
}

// TYDZIEŃ 2: Chcę premium
async function weekTwoDecision(token, email) {
    console.log('💎 Tydzień 2: Decyzja o Premium');
    
    // Sprawdź plany
    const plansResponse = await fetch('http://localhost:5000/api/premium/plans');
    const plansData = await plansResponse.json();
    console.log('Dostępne plany:', plansData.plans);
    
    // Symuluj płatność za plan miesięczny
    const paymentResponse = await fetch('http://localhost:5000/api/premium/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email,
            plan: 'monthly'
        })
    });
    
    const paymentData = await paymentResponse.json();
    console.log('💳 Płatność przetworzona:', paymentData);
    
    // Sprawdź status premium
    const statusResponse = await fetch('http://localhost:5000/api/premium/status', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const statusData = await statusResponse.json();
    console.log('✨ Status premium aktywny!', statusData.premium);
}

// Uruchom pełny scenariusz nauki
async function runLearningScenario() {
    // Najpierw zaloguj się
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'jan.kowalski@example.com',
            password: 'bezpieczneHaslo123'
        })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    const email = loginData.user.email;
    
    // Symuluj uczenie się przez kilka dni
    await day1Learning(token);
    console.log('\n⏸️  Przerwa 2 dni...\n');
    await day3Learning(token);
    console.log('\n⏸️  Przerwa 1 tydzień...\n');
    await weekTwoDecision(token, email);
    
    console.log('\n✅ Scenariusz nauki zakończony!');
}
```

---

## 3. Aktywacja Premium

### Pełny proces od darmowego do premium

```javascript
// Scenariusz: Użytkownik darmowy chce przejść na premium

async function premiumUpgradeFlow() {
    const token = localStorage.getItem('token');
    
    // KROK 1: Sprawdź obecny status
    console.log('1️⃣ Sprawdzam obecny status...');
    const currentStatus = await fetch('http://localhost:5000/api/premium/status', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const currentData = await currentStatus.json();
    console.log('Status:', currentData.premium);
    
    // KROK 2: Zobacz dostępne plany
    console.log('\n2️⃣ Dostępne plany:');
    const plansResponse = await fetch('http://localhost:5000/api/premium/plans');
    const plansData = await plansResponse.json();
    
    plansData.plans.forEach(plan => {
        console.log(`   ${plan.name}: ${plan.price} ${plan.currency} / ${plan.duration}`);
    });
    
    // KROK 3: Użytkownik wybiera plan i "płaci"
    console.log('\n3️⃣ Przetwarzam płatność...');
    
    const userResponse = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const userData = await userResponse.json();
    
    const paymentResponse = await fetch('http://localhost:5000/api/premium/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: userData.user.email,
            plan: 'yearly' // Wybierz plan roczny
        })
    });
    
    const paymentData = await paymentResponse.json();
    console.log('Płatność:', paymentData);
    
    // KROK 4: Sprawdź nowy status
    console.log('\n4️⃣ Nowy status premium:');
    const newStatus = await fetch('http://localhost:5000/api/premium/status', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const newData = await newStatus.json();
    console.log('Status:', newData.premium);
    console.log(`✨ Premium aktywne przez ${newData.premium.daysRemaining} dni!`);
    
    // KROK 5: Teraz masz dostęp do sekcji premium
    console.log('\n5️⃣ Dostęp do premium funkcji odblokowany!');
    
    // Ukończ sekcję premium (np. sekcję 7)
    await fetch('http://localhost:5000/api/progress/complete-section', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ sectionId: 7 })
    });
    
    console.log('✅ Pierwsza sekcja premium ukończona!');
}
```

---

## 4. Reset hasła

### Użytkownik zapomniał hasła

```javascript
// Scenariusz: Użytkownik nie pamięta hasła

async function passwordResetFlow() {
    const userEmail = 'jan.kowalski@example.com';
    
    // KROK 1: Żądanie resetu hasła
    console.log('1️⃣ Wysyłam żądanie resetu hasła...');
    const forgotResponse = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
    });
    
    const forgotData = await forgotResponse.json();
    console.log('Odpowiedź:', forgotData.message);
    
    // W developmencie dostaniemy token w odpowiedzi
    // W produkcji token byłby wysłany mailem
    const resetToken = forgotData.resetToken;
    console.log('Token resetu:', resetToken);
    
    // KROK 2: Użytkownik klika w link z maila i ustawia nowe hasło
    console.log('\n2️⃣ Ustawiam nowe hasło...');
    const resetResponse = await fetch(`http://localhost:5000/api/auth/reset-password/${resetToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            newPassword: 'noweSuperbezpieczneHaslo123' 
        })
    });
    
    const resetData = await resetResponse.json();
    console.log('Wynik:', resetData.message);
    
    // KROK 3: Zaloguj się nowym hasłem
    console.log('\n3️⃣ Logowanie z nowym hasłem...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: userEmail,
            password: 'noweSuperbezpieczneHaslo123'
        })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Zalogowano pomyślnie!', loginData.user);
    
    localStorage.setItem('token', loginData.token);
}
```

---

## 5. Dashboard użytkownika

### Kompleksowy dashboard z postępami

```javascript
// Pobierz wszystkie dane dla dashboardu użytkownika

async function loadUserDashboard(token) {
    console.log('📊 Ładowanie dashboardu użytkownika...\n');
    
    // 1. Dane użytkownika
    const userResponse = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const userData = await userResponse.json();
    console.log('👤 Użytkownik:', {
        name: userData.user.name,
        email: userData.user.email,
        premium: userData.user.isPremium,
        członekOd: new Date(userData.user.createdAt).toLocaleDateString('pl-PL')
    });
    
    // 2. Statystyki nauki
    const statsResponse = await fetch('http://localhost:5000/api/progress/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsData = await statsResponse.json();
    console.log('\n📚 Statystyki nauki:', {
        ukończoneSekcje: statsData.stats.completedSections,
        quizyRozwiązane: statsData.stats.totalQuizzes,
        średniWynik: `${statsData.stats.averageScore}%`,
        najlepszyWynik: `${statsData.stats.bestScore}%`
    });
    
    // 3. Historia quizów
    const quizResponse = await fetch('http://localhost:5000/api/progress/quiz-results', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const quizData = await quizResponse.json();
    console.log('\n📝 Ostatnie quizy:');
    quizData.quizResults.slice(-3).forEach(result => {
        console.log(`   ${result.quizId}: ${result.score}/${result.totalQuestions} - ${new Date(result.completedAt).toLocaleDateString('pl-PL')}`);
    });
    
    // 4. Status premium
    if (userData.user.isPremium) {
        const premiumResponse = await fetch('http://localhost:5000/api/premium/status', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const premiumData = await premiumResponse.json();
        console.log('\n💎 Status Premium:', {
            aktywne: premiumData.premium.isPremium,
            wygasaNieco: `${premiumData.premium.daysRemaining} dni`,
            dataWygaśnięcia: new Date(premiumData.premium.expiresAt).toLocaleDateString('pl-PL')
        });
    }
    
    // 5. Oblicz postęp ogólny
    const totalSections = 10; // Zakładamy 10 sekcji
    const progress = Math.round((statsData.stats.completedSections / totalSections) * 100);
    console.log(`\n📈 Ogólny postęp: ${progress}%`);
    
    // 6. Rekomendacje
    console.log('\n💡 Rekomendacje:');
    if (statsData.stats.completedSections < 3) {
        console.log('   - Ukończ pierwsze 3 sekcje, aby odblokować quiz podstawowy');
    }
    if (!userData.user.isPremium && statsData.stats.completedSections >= 5) {
        console.log('   - Rozważ premium, aby uzyskać dostęp do zaawansowanych sekcji');
    }
    if (statsData.stats.totalQuizzes === 0) {
        console.log('   - Rozwiąż quiz, aby sprawdzić swoją wiedzę');
    }
}

// Uruchom dashboard
async function showDashboard() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ Musisz się najpierw zalogować!');
        return;
    }
    
    await loadUserDashboard(token);
}
```

---

## Przykładowy HTML z integracją

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Akademia Biznesowa - Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
        .premium { background: gold; color: black; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>Akademia Biznesowa</h1>
    
    <div class="section" id="authSection">
        <h2>Autoryzacja</h2>
        <input type="email" id="email" placeholder="Email">
        <input type="password" id="password" placeholder="Hasło">
        <button onclick="handleLogin()">Zaloguj</button>
        <button onclick="handleRegister()">Zarejestruj</button>
    </div>
    
    <div class="section" id="userSection" style="display: none;">
        <h2>Witaj, <span id="userName"></span>!</h2>
        <p>Email: <span id="userEmail"></span></p>
        <p>Status: <span id="userStatus"></span></p>
        <button onclick="loadProgress()">Pokaż postępy</button>
        <button onclick="handleLogout()">Wyloguj</button>
    </div>
    
    <div class="section" id="progressSection" style="display: none;">
        <h2>Twoje postępy</h2>
        <div id="progressContent"></div>
    </div>
    
    <script>
        const API_URL = 'http://localhost:5000/api';
        
        async function handleLogin() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    localStorage.setItem('token', data.token);
                    showUserSection(data.user);
                } else {
                    alert('Błąd: ' + data.message);
                }
            } catch (error) {
                alert('Błąd połączenia: ' + error);
            }
        }
        
        async function handleRegister() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    localStorage.setItem('token', data.token);
                    showUserSection(data.user);
                } else {
                    alert('Błąd: ' + data.message);
                }
            } catch (error) {
                alert('Błąd połączenia: ' + error);
            }
        }
        
        function showUserSection(user) {
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('userSection').style.display = 'block';
            document.getElementById('userName').textContent = user.name || user.email;
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userStatus').textContent = user.isPremium ? '💎 Premium' : '🆓 Darmowy';
        }
        
        async function loadProgress() {
            const token = localStorage.getItem('token');
            
            try {
                const response = await fetch(`${API_URL}/progress/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const data = await response.json();
                
                document.getElementById('progressSection').style.display = 'block';
                document.getElementById('progressContent').innerHTML = `
                    <p>Ukończone sekcje: ${data.stats.completedSections}</p>
                    <p>Rozwiązane quizy: ${data.stats.totalQuizzes}</p>
                    <p>Średni wynik: ${data.stats.averageScore}%</p>
                    <p>Najlepszy wynik: ${data.stats.bestScore}%</p>
                `;
            } catch (error) {
                alert('Błąd ładowania postępów: ' + error);
            }
        }
        
        function handleLogout() {
            localStorage.removeItem('token');
            location.reload();
        }
        
        // Sprawdź czy użytkownik jest zalogowany przy ładowaniu strony
        window.onload = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch(`${API_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.success) {
                        showUserSection(data.user);
                    }
                } catch (error) {
                    console.error('Błąd weryfikacji tokena');
                }
            }
        };
    </script>
</body>
</html>
```

---

**🎯 Te scenariusze pokazują wszystkie najważniejsze przypadki użycia API!**
