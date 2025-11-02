# Akademia Biznesowa - API Test Collection

## 1. Autoryzacja

### 1.1 Rejestracja użytkownika
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@akademia.pl",
  "password": "test123",
  "name": "Jan Testowy"
}
```

### 1.2 Logowanie
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@akademia.pl",
  "password": "test123"
}
```

### 1.3 Pobierz dane użytkownika
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

### 1.4 Zmiana hasła
```http
PUT http://localhost:5000/api/auth/change-password
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "currentPassword": "test123",
  "newPassword": "newtest123"
}
```

### 1.5 Żądanie resetu hasła
```http
POST http://localhost:5000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "test@akademia.pl"
}
```

### 1.6 Reset hasła
```http
POST http://localhost:5000/api/auth/reset-password/RESET_TOKEN_HERE
Content-Type: application/json

{
  "newPassword": "newpassword123"
}
```

## 2. Postępy

### 2.1 Pobierz postępy
```http
GET http://localhost:5000/api/progress
Authorization: Bearer YOUR_TOKEN_HERE
```

### 2.2 Pobierz statystyki
```http
GET http://localhost:5000/api/progress/stats
Authorization: Bearer YOUR_TOKEN_HERE
```

### 2.3 Oznacz sekcję jako ukończoną
```http
POST http://localhost:5000/api/progress/complete-section
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "sectionId": 1
}
```

### 2.4 Zapisz wynik quizu
```http
POST http://localhost:5000/api/progress/quiz-result
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "quizId": "quiz-basics",
  "score": 8,
  "totalQuestions": 10,
  "answers": {
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 1,
    "5": 0,
    "6": 3,
    "7": 1,
    "8": 2,
    "9": 0,
    "10": 1
  }
}
```

### 2.5 Pobierz wyniki quizów
```http
GET http://localhost:5000/api/progress/quiz-results
Authorization: Bearer YOUR_TOKEN_HERE
```

### 2.6 Resetuj postępy
```http
DELETE http://localhost:5000/api/progress/reset
Authorization: Bearer YOUR_TOKEN_HERE
```

## 3. Premium

### 3.1 Pobierz dostępne plany
```http
GET http://localhost:5000/api/premium/plans
```

### 3.2 Sprawdź status premium
```http
GET http://localhost:5000/api/premium/status
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3.3 Aktywuj premium
```http
POST http://localhost:5000/api/premium/activate
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "duration": 1
}
```

### 3.4 Symulacja płatności (do testów)
```http
POST http://localhost:5000/api/premium/simulate-payment
Content-Type: application/json

{
  "email": "test@akademia.pl",
  "plan": "monthly"
}
```

### 3.5 Anuluj premium
```http
POST http://localhost:5000/api/premium/cancel
Authorization: Bearer YOUR_TOKEN_HERE
```

## 4. Endpointy pomocnicze

### 4.1 Health check
```http
GET http://localhost:5000/health
```

### 4.2 Root endpoint
```http
GET http://localhost:5000/
```

---

## Scenariusze testowe

### Scenariusz 1: Nowy użytkownik - pełna ścieżka
1. Zarejestruj się (1.1)
2. Zaloguj się (1.2) - zapisz token
3. Pobierz swoje dane (1.3)
4. Sprawdź status premium (3.2)
5. Ukończ sekcję (2.3)
6. Zapisz wynik quizu (2.4)
7. Sprawdź statystyki (2.2)

### Scenariusz 2: Aktywacja premium
1. Zaloguj się (1.2)
2. Symuluj płatność (3.4)
3. Sprawdź status premium (3.2)
4. Aktywuj premium (3.3)

### Scenariusz 3: Reset hasła
1. Żądanie resetu (1.5)
2. Użyj tokenu z odpowiedzi w (1.6)
3. Zaloguj się nowym hasłem (1.2)

---

## Notatki

- Zawsze zapisuj token z odpowiedzi logowania
- Token jest ważny przez 7 dni (domyślnie)
- W environment variables ustaw BASE_URL=http://localhost:5000
- Zastąp YOUR_TOKEN_HERE rzeczywistym tokenem JWT
