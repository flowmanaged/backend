const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Generowanie JWT tokena
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Helper do hashowania tokenów
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// Walidatory
exports.registerValidation = [
    body('email')
        .isEmail().withMessage('Nieprawidłowy format email')
        .normalizeEmail()
        .isLength({ max: 255 }).withMessage('Email zbyt długi'),
    body('password')
        .isLength({ min: 8 }).withMessage('Hasło musi mieć min. 8 znaków')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Hasło musi zawierać małą i wielką literę oraz cyfrę'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Nazwa musi mieć 2-50 znaków')
];

exports.loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
];

// @desc    Rejestracja użytkownika
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        // Walidacja
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dane rejestracji są nieprawidłowe',
                errors: errors.array()
            });
        }

        const { email, password, name } = req.body;

        // Sprawdź czy użytkownik już istnieje
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Rejestracja nie powiodła się' // Nie ujawniaj że user istnieje
            });
        }

        // Utwórz nowego użytkownika
        const user = await User.create({
            email,
            password,
            name: name || email.split('@')[0]
        });

        // Wygeneruj token
        const token = generateToken(user._id);

        // Log zdarzenia (użyj logger w produkcji, np. Winston)
        console.info(`New user registered: ${user._id}`);

        res.status(201).json({
            success: true,
            message: 'Rejestracja zakończona sukcesem',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isPremium: user.isPremium,
                completedSections: user.completedSections,
                premiumExpiresAt: user.premiumExpiresAt 
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas rejestracji',
            // NIE zwracaj error.message w produkcji
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// @desc    Logowanie użytkownika
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        // Walidacja
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Nieprawidłowe dane logowania'
            });
        }

        const { email, password } = req.body;

        // Znajdź użytkownika
        const user = await User.findOne({ email }).select('+password');
        
        // Użyj stałego czasu odpowiedzi dla bezpieczeństwa
        const isPasswordCorrect = user 
            ? await user.comparePassword(password)
            : false;
        
        if (!user || !isPasswordCorrect) {
            // Log nieudanej próby
            console.warn(`Failed login attempt for: ${email}`);
            
            return res.status(401).json({
                success: false,
                message: 'Nieprawidłowy email lub hasło'
            });
        }

        // Sprawdź i zaktualizuj status premium
        await user.checkAndUpdatePremiumStatus();

        // Zaktualizuj ostatnie logowanie
        user.lastLogin = new Date();
        await user.save();

        // Wygeneruj token
        const token = generateToken(user._id);

        console.info(`User logged in: ${user._id}`);

        res.json({
            success: true,
            message: 'Zalogowano pomyślnie',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isPremium: user.isPremium,
                completedSections: user.completedSections,
                premiumExpiresAt: user.premiumExpiresAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas logowania',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// @desc    Pobierz dane zalogowanego użytkownika
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // Pobierz tylko potrzebne pola
        const user = await User.findById(req.user.id)
            .select('email name role isPremium completedSections premiumExpiresAt quizResults createdAt lastLogin');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        // Sprawdź i zaktualizuj status premium
        await user.checkAndUpdatePremiumStatus();

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isPremium: user.isPremium,
                completedSections: user.completedSections,
                premiumExpiresAt: user.premiumExpiresAt,
                quizResults: user.quizResults,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas pobierania danych użytkownika',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// @desc    Zmień hasło
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Walidacja
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Nowe hasło musi mieć minimum 8 znaków'
            });
        }

        const user = await User.findById(req.user.id).select('+password');
        
        // Sprawdź aktualne hasło
        const isPasswordCorrect = await user.comparePassword(currentPassword);
        if (!isPasswordCorrect) {
            console.warn(`Failed password change for user: ${user._id}`);
            return res.status(401).json({
                success: false,
                message: 'Nieprawidłowe aktualne hasło'
            });
        }

        // Ustaw nowe hasło
        user.password = newPassword;
        
        // WAŻNE: Unieważnij wszystkie stare tokeny
        // Opcja 1: Dodaj pole tokenVersion do user i zwiększ je
        // Opcja 2: Przechowuj tokeny w bazie i usuń je
        // Opcja 3: Dodaj timestamp do tokena i weryfikuj go
        
        await user.save();

        console.info(`Password changed for user: ${user._id}`);

        res.json({
            success: true,
            message: 'Hasło zostało zmienione pomyślnie'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas zmiany hasła',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// @desc    Żądanie resetu hasła
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        
        // ZAWSZE zwróć sukces, nawet jeśli user nie istnieje (bezpieczeństwo)
        if (!user) {
            console.warn(`Password reset requested for non-existent email: ${email}`);
            return res.json({
                success: true,
                message: 'Jeśli konto istnieje, link resetowania został wysłany na email'
            });
        }

        // Wygeneruj losowy token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = hashToken(resetToken);

        user.resetPasswordToken = hashedToken; // Przechowuj HASH, nie raw token
        user.resetPasswordExpires = Date.now() + 3600000; // 1 godzina
        await user.save();

        // TODO: Wysłać email z linkiem
        // const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        // await sendEmail({ to: user.email, subject: 'Reset hasła', html: ... });

        console.info(`Password reset requested for user: ${user._id}`);

        res.json({
            success: true,
            message: 'Jeśli konto istnieje, link resetowania został wysłany na email',
            // TYLKO dla developmentu
            ...(process.env.NODE_ENV === 'development' && { resetToken })
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas żądania resetu hasła',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// @desc    Reset hasła
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        // Walidacja nowego hasła
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Hasło musi mieć minimum 8 znaków'
            });
        }

        // Hash tokena z URL
        const hashedToken = hashToken(token);

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token resetowania jest nieprawidłowy lub wygasł'
            });
        }

        // Ustaw nowe hasło
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.info(`Password reset completed for user: ${user._id}`);

        res.json({
            success: true,
            message: 'Hasło zostało zresetowane pomyślnie'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas resetowania hasła',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};