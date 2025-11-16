const { body, validationResult } = require('express-validator');

// Middleware do obsługi błędów walidacji
exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return res.status(400).json({
            success: false,
            message: errorMessages.join(', '),
            errors: errors.array()
        });
    }
    
    next();
};

// Walidacja rejestracji
exports.validateRegister = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Podaj prawidłowy adres email')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('Email jest zbyt długi'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Hasło musi mieć minimum 8 znaków')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Hasło musi zawierać małą literę, wielką literę i cyfrę')
        .isLength({ max: 128 })
        .withMessage('Hasło jest zbyt długie'),
    
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Imię musi mieć od 2 do 50 znaków')
        .matches(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/)
        .withMessage('Imię może zawierać tylko litery, spacje i myślniki')
];

// Walidacja logowania
exports.validateLogin = [
    body('email')
        .trim()
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
        .withMessage('Obecne hasło jest wymagane'),
    
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Nowe hasło musi mieć minimum 8 znaków')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Nowe hasło musi zawierać małą literę, wielką literę i cyfrę')
        .custom((value, { req }) => value !== req.body.currentPassword)
        .withMessage('Nowe hasło musi być inne niż obecne hasło')
];

// Walidacja zapomnienia hasła
exports.validateForgotPassword = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Podaj prawidłowy adres email')
        .normalizeEmail()
];

// Walidacja resetowania hasła
exports.validateResetPassword = [
    body('password')
        .isLength({ min: 8 })
        .withMessage('Hasło musi mieć minimum 8 znaków')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Hasło musi zawierać małą literę, wielką literę i cyfrę')
];
