const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generowanie tokenu JWT
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// @desc    Rejestracja użytkownika
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // 1. Sprawdź czy email już istnieje
        const emailExists = await User.emailExists(email);
        
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: 'Użytkownik z tym adresem email już istnieje'
            });
        }

        // 2. Walidacja hasła
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Hasło musi mieć minimum 8 znaków'
            });
        }

        // 3. Utwórz użytkownika
        const user = await User.create({
            email,
            password,
            name: name || email.split('@')[0] // Jeśli nie podano imienia, użyj części email
        });

        // 4. Wygeneruj token
        const token = generateToken(user._id);

        // 5. Zwróć odpowiedź
        res.status(201).json({
            success: true,
            message: 'Rejestracja zakończona pomyślnie',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isPremium: user.isPremium
            }
        });

    } catch (error) {
        console.error('❌ Błąd rejestracji:', error);
        
        // Obsługa błędów walidacji Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Błąd serwera podczas rejestracji'
        });
    }
};

// @desc    Logowanie użytkownika
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Walidacja danych wejściowych
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Proszę podać email i hasło'
            });
        }

        // 2. 🔥 KLUCZOWE: Znajdź użytkownika i sprawdź credentials
        const user = await User.findByCredentials(email, password);

        // 3. 🔥 KLUCZOWE: Sprawdź czy użytkownik został znaleziony
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Nieprawidłowy email lub hasło'
            });
        }

        // 4. Sprawdź i zaktualizuj status premium (jeśli wygasł)
        await user.checkAndUpdatePremiumStatus();

        // 5. Aktualizuj ostatnie logowanie
        user.lastLogin = new Date();
        await user.save();

        // 6. Wygeneruj token
        const token = generateToken(user._id);

        // 7. Zwróć odpowiedź
        res.status(200).json({
            success: true,
            message: 'Zalogowano pomyślnie',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isPremium: user.hasPremium(),
                premiumExpiresAt: user.premiumExpiresAt,
                completedSections: user.completedSections,
                stats: user.getStats()
            }
        });

    } catch (error) {
        console.error('❌ Błąd logowania:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd serwera podczas logowania'
        });
    }
};

// @desc    Pobierz dane zalogowanego użytkownika
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // req.user jest ustawione przez middleware 'protect'
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        // Sprawdź i zaktualizuj status premium
        await user.checkAndUpdatePremiumStatus();

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isPremium: user.hasPremium(),
                premiumExpiresAt: user.premiumExpiresAt,
                completedSections: user.completedSections,
                stats: user.getStats(),
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Błąd pobierania danych użytkownika:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd serwera'
        });
    }
};

// @desc    Zmiana hasła
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // 1. Znajdź użytkownika z hasłem
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        // 2. Sprawdź obecne hasło
        const isPasswordCorrect = await user.comparePassword(currentPassword);
        
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Obecne hasło jest nieprawidłowe'
            });
        }

        // 3. Walidacja nowego hasła
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Nowe hasło musi mieć minimum 8 znaków'
            });
        }

        // 4. Ustaw nowe hasło (zostanie zahashowane przez middleware)
        user.password = newPassword;
        await user.save();

        // 5. Wygeneruj nowy token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Hasło zostało zmienione pomyślnie',
            token
        });

    } catch (error) {
        console.error('❌ Błąd zmiany hasła:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd serwera podczas zmiany hasła'
        });
    }
};

// @desc    Zapomniałem hasła - wyślij email z tokenem
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Znajdź użytkownika
        const user = await User.findOne({ email });

        // 2. ZAWSZE zwracamy sukces (bezpieczeństwo - nie ujawniaj czy email istnieje)
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'Jeśli konto z tym adresem email istnieje, link resetujący hasło został wysłany'
            });
        }

        // 3. Wygeneruj token resetujący
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // 4. Zahashuj token i zapisz w bazie
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 godzina
        await user.save();

        // 5. TODO: Wyślij email z linkiem resetującym
        // const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        // await sendEmail({ email: user.email, resetUrl });

        console.log(`🔐 Token resetujący dla ${email}: ${resetToken}`);
        console.log(`🔗 Link resetujący (DEV): http://localhost:3000/reset-password/${resetToken}`);

        res.status(200).json({
            success: true,
            message: 'Link resetujący hasło został wysłany na podany adres email'
        });

    } catch (error) {
        console.error('❌ Błąd resetowania hasła:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd serwera podczas resetowania hasła'
        });
    }
};

// @desc    Resetuj hasło
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // 1. Zahashuj token z URL
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // 2. Znajdź użytkownika z ważnym tokenem
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token resetujący jest nieprawidłowy lub wygasł'
            });
        }

        // 3. Walidacja nowego hasła
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Hasło musi mieć minimum 8 znaków'
            });
        }

        // 4. Ustaw nowe hasło
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // 5. Wygeneruj nowy token
        const jwtToken = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Hasło zostało zresetowane pomyślnie',
            token: jwtToken
        });

    } catch (error) {
        console.error('❌ Błąd resetowania hasła:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd serwera podczas resetowania hasła'
        });
    }
};
