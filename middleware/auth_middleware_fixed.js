const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware do weryfikacji tokena JWT
exports.protect = async (req, res, next) => {
    let token;

    // Sprawdź czy token znajduje się w headerze Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Sprawdź czy token istnieje
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Brak autoryzacji. Zaloguj się, aby uzyskać dostęp'
        });
    }

    try {
        // Weryfikuj token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Znajdź użytkownika (hasło jest automatycznie wykluczane przez select: false w modelu)
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Token jest nieprawidłowy lub wygasł'
        });
    }
};

// Middleware do sprawdzania czy użytkownik ma premium
exports.premiumRequired = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Najpierw musisz być zalogowany'
            });
        }

        // Sprawdź i zaktualizuj status premium jeśli wygasł
        if (req.user.isPremium && req.user.premiumExpiresAt && req.user.premiumExpiresAt < new Date()) {
            req.user.isPremium = false;
            req.user.premiumExpiresAt = null;
            await req.user.save();
        }

        if (!req.user.isPremium) {
            return res.status(403).json({
                success: false,
                message: 'Ta funkcja wymaga konta premium',
                isPremium: false
            });
        }

        next();
    } catch (error) {
        console.error('Premium middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Błąd podczas sprawdzania statusu premium',
            error: error.message
        });
    }
};
