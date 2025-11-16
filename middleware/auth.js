const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware do weryfikacji tokena JWT
exports.protect = async (req, res, next) => {
    try {
        let token;

        // 1. Sprawdź czy token jest w headerze Authorization
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // 2. Sprawdź czy token istnieje
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Brak autoryzacji. Zaloguj się ponownie.'
            });
        }

        try {
            // 3. Zweryfikuj token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Znajdź użytkownika
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Użytkownik przypisany do tokena nie istnieje'
                });
            }

            // 5. Sprawdź i zaktualizuj status premium
            await user.checkAndUpdatePremiumStatus();

            // 6. Dodaj użytkownika do req
            req.user = user;
            next();

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token wygasł. Zaloguj się ponownie.'
                });
            }
            
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Nieprawidłowy token. Zaloguj się ponownie.'
                });
            }

            throw error;
        }

    } catch (error) {
        console.error('❌ Błąd middleware autoryzacji:', error);
        return res.status(500).json({
            success: false,
            message: 'Błąd serwera podczas autoryzacji'
        });
    }
};

// Middleware do sprawdzania roli użytkownika
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Rola ${req.user.role} nie ma dostępu do tego zasobu`
            });
        }
        next();
    };
};

// Middleware do sprawdzania statusu premium
exports.requirePremium = (req, res, next) => {
    if (!req.user.hasPremium()) {
        return res.status(403).json({
            success: false,
            message: 'Ta funkcja jest dostępna tylko dla użytkowników Premium'
        });
    }
    next();
};
