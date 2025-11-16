const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generowanie JWT tokena
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Rejestracja użytkownika
// @route   POST /api/auth/register
// @access  Public
// @desc    Logowanie użytkownika
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔍 LOGIN ATTEMPT:', { email, passwordProvided: !!password });

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Proszę podać email i hasło'
            });
        }

        const user = await User.findOne({ email }).select('+password');
        
        console.log('👤 USER FOUND:', user ? 'YES' : 'NO');
        console.log('📧 Searching for email:', email);

        if (!user) {
            console.log('❌ USER NOT EXISTS - returning 401');
            return res.status(401).json({
                success: false,
                message: 'Nieprawidłowy email lub hasło'
            });
        }

        console.log('🔐 Checking password...');
        // POPRAWKA: ZMIANA NA matchPassword
        const isPasswordCorrect = await user.matchPassword(password);
        console.log('🔐 Password correct:', isPasswordCorrect);
        
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Nieprawidłowy email lub hasło'
            });
        }

       // 5. Sprawdź i zaktualizuj status premium jeśli wygasł
        if (user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt < new Date()) {
            user.isPremium = false;
            user.premiumExpiresAt = null;
        }

        // 6. Zaktualizuj ostatnie logowanie
        user.lastLogin = new Date();
        await user.save();

        // 7. Wygeneruj token
        const token = generateToken(user._id);

        console.log('✅ LOGIN SUCCESS for:', email);

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
            error: error.message
        });
    }
};

// @desc    Pobierz dane zalogowanego użytkownika
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        // Sprawdź i zaktualizuj status premium
        if (user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt < new Date()) {
            user.isPremium = false;
            user.premiumExpiresAt = null;
            await user.save();
        }

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
            error: error.message
        });
    }
};

// @desc    Zmień hasło
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');
        
        // Sprawdź aktualne hasło
        const isPasswordCorrect = await user.comparePassword(currentPassword);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Nieprawidłowe aktualne hasło'
            });
        }

        // Ustaw nowe hasło
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Hasło zostało zmienione pomyślnie'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas zmiany hasła',
            error: error.message
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
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik z tym adresem email nie istnieje'
            });
        }

        // Wygeneruj token resetowania (w produkcji należy wysłać email)
        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 godzina
        await user.save();

        // TODO: Wysłać email z linkiem do resetu
        // W produkcji należy zintegrować z serwisem email (np. SendGrid, Mailgun)
        
        res.json({
            success: true,
            message: 'Link do resetowania hasła został wysłany na email',
            // W developmencie zwracamy token (w produkcji usunąć!)
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas żądania resetu hasła',
            error: error.message
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

        // Weryfikuj token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Token resetowania jest nieprawidłowy lub wygasł'
            });
        }

        const user = await User.findOne({
            _id: decoded.id,
            resetPasswordToken: token,
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

        res.json({
            success: true,
            message: 'Hasło zostało zresetowane pomyślnie'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas resetowania hasła',
            error: error.message
        });
    }
};
