const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware weryfikujący JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Pobierz token z headera
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Brak tokenu autoryzacji'
      });
    }

    // Weryfikuj token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Token jest nieprawidłowy lub wygasł'
        });
      }

      // Sprawdź czy użytkownik nadal istnieje w bazie
      const user = await db.getAsync(
        'SELECT id, email, is_verified, is_premium FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Użytkownik nie istnieje'
        });
      }

      // Dodaj dane użytkownika do request
      req.user = {
        id: user.id,
        email: user.email,
        isVerified: user.is_verified,
        isPremium: user.is_premium
      };

      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd autoryzacji'
    });
  }
};

// Middleware sprawdzający czy użytkownik jest zweryfikowany
const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Konto nie zostało zweryfikowane. Sprawdź email.'
    });
  }
  next();
};

// Middleware sprawdzający czy użytkownik ma Premium
const requirePremium = (req, res, next) => {
  if (!req.user.isPremium) {
    return res.status(403).json({
      success: false,
      message: 'Ta funkcja wymaga konta Premium'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireVerified,
  requirePremium
};
