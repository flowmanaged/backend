const { body, validationResult } = require('express-validator');

// Middleware do obsługi błędów walidacji
exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Błędy walidacji',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    
    next();
};

// Walidacja rejestracji
exports.validateRegister = [
    body('email')
        .isEmail()
        .withMessage('Podaj prawidłowy adres email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Hasło musi mieć minimum 6 znaków')
        .matches(/\d/)
        .withMessage('Hasło musi zawierać przynajmniej jedną cyfrę'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Imię musi mieć od 2 do 50 znaków')
];

// Walidacja logowania
exports.validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Podaj prawidłowy adres email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Hasło jest wymagane')
];

// Walidacja zmiany hasła
exports.validateChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Aktualne hasło jest wymagane'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Nowe hasło musi mieć minimum 6 znaków')
        .matches(/\d/)
        .withMessage('Nowe hasło musi zawierać przynajmniej jedną cyfrę')
];

// Walidacja żądania resetu hasła
exports.validateForgotPassword = [
    body('email')
        .isEmail()
        .withMessage('Podaj prawidłowy adres email')
        .normalizeEmail()
];

// Walidacja resetu hasła
exports.validateResetPassword = [
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Nowe hasło musi mieć minimum 6 znaków')
        .matches(/\d/)
        .withMessage('Nowe hasło musi zawierać przynajmniej jedną cyfrę')
];

// Walidacja ukończenia sekcji
exports.validateCompleteSection = [
    body('sectionId')
        .isInt({ min: 1 })
        .withMessage('ID sekcji musi być liczbą całkowitą większą od 0')
];

// Walidacja zapisywania wyniku quizu
exports.validateQuizResult = [
    body('quizId')
        .notEmpty()
        .withMessage('ID quizu jest wymagane'),
    body('score')
        .isInt({ min: 0 })
        .withMessage('Wynik musi być liczbą całkowitą większą lub równą 0'),
    body('totalQuestions')
        .isInt({ min: 1 })
        .withMessage('Liczba pytań musi być liczbą całkowitą większą od 0'),
    body('answers')
        .isObject()
        .withMessage('Odpowiedzi muszą być obiektem')
];

// Walidacja aktywacji premium
exports.validateActivatePremium = [
    body('duration')
        .optional()
        .isInt({ min: 1, max: 24 })
        .withMessage('Czas trwania musi być liczbą od 1 do 24 miesięcy')
];

// Walidacja symulacji płatności
exports.validateSimulatePayment = [
    body('email')
        .isEmail()
        .withMessage('Podaj prawidłowy adres email')
        .normalizeEmail(),
    body('plan')
        .isIn(['monthly', 'yearly'])
        .withMessage('Plan musi być "monthly" lub "yearly"')
];
