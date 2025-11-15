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
exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Sprawdź czy użytkownik istnieje
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Użytkownik z tym adresem email już istnieje'
            });
        }

        // Utwórz użytkownika
        const user = await User.create({
            email,
            password,
            name: name || email.split('@')[0]
        });

        const token = generateToken(user._id);

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
                completedSections: user.completedSections
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas rejestracji',
            error: error.message
        });
    }
};

// @desc    Logowanie użytkownika
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Walidacja
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Proszę podać email i hasło'
            });
        }

        // 🚀 POBIERZ UŻYTKOWNIKA Z BAZY — TEGO BRAKOWAŁO
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Nieprawidłowy email lub hasło'
            });
        }

        // 🚀 SPRAWDZENIE HASŁA
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Nieprawidłowy email lub hasło'
            });
        }

        // Aktualizacja premium
        if (user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt < new Date()) {
            user.isPremium = false;
            user.premiumExpiresAt = null;
        }

        // Ostatnie logowanie
        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        return res.json({
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
        return res.status(500).json({
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

        // Sprawdź premium
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

        const isPasswordCorrect = await user.comparePassword(currentPassword);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Nieprawidłowe aktualne hasło'
            });
        }

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

        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        res.json({
            success: true,
            message: 'Link do resetowania hasła został wysłany na email',
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
