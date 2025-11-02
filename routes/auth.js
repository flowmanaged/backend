const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const db = require('../config/database');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

// Helper do generowania JWT tokena
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/auth/register - Rejestracja użytkownika
router.post('/register',
  [
    body('email').isEmail().withMessage('Podaj prawidłowy email'),
    body('password').isLength({ min: 6 }).withMessage('Hasło musi mieć min. 6 znaków')
  ],
  async (req, res) => {
    try {
      // Walidacja
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg
        });
      }

      const { email, password } = req.body;

      // Sprawdź czy email już istnieje
      const existingUser = await db.getAsync(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email już jest zarejestrowany'
        });
      }

      // Hash hasła
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generuj token weryfikacyjny
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Zapisz użytkownika do bazy
      const result = await db.runAsync(
        `INSERT INTO users (email, password, verification_token) 
         VALUES (?, ?, ?)`,
        [email, hashedPassword, verificationToken]
      );

      // Wyślij email weryfikacyjny
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (emailError) {
        console.error('Błąd wysyłania emaila:', emailError);
        // Kontynuuj mimo błędu email
      }

      res.status(201).json({
        success: true,
        message: 'Konto utworzone! Sprawdź email aby potwierdzić rejestrację.',
        userId: result.lastID
      });

    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Błąd podczas rejestracji'
      });
    }
  }
);

// POST /api/auth/login - Logowanie
router.post('/login',
  [
    body('email').isEmail().withMessage('Podaj prawidłowy email'),
    body('password').notEmpty().withMessage('Podaj hasło')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg
        });
      }

      const { email, password } = req.body;

      // Znajdź użytkownika
      const user = await db.getAsync(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Nieprawidłowy email lub hasło'
        });
      }

      // Sprawdź hasło
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Nieprawidłowy email lub hasło'
        });
      }

      // Generuj JWT token
      const token = generateToken(user.id);

      res.json({
        success: true,
        message: 'Zalogowano pomyślnie',
        token,
        user: {
          id: user.id,
          email: user.email,
          isVerified: user.is_verified === 1,
          isPremium: user.is_premium === 1
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Błąd podczas logowania'
      });
    }
  }
);

// GET /api/auth/verify/:token - Weryfikacja emaila
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Znajdź użytkownika z tym tokenem
    const user = await db.getAsync(
      'SELECT id FROM users WHERE verification_token = ?',
      [token]
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token weryfikacyjny jest nieprawidłowy lub wygasł'
      });
    }

    // Zaktualizuj status weryfikacji
    await db.runAsync(
      'UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?',
      [user.id]
    );

    res.json({
      success: true,
      message: 'Email został zweryfikowany! Możesz się teraz zalogować.'
    });

  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas weryfikacji'
    });
  }
});

// POST /api/auth/forgot-password - Prośba o reset hasła
router.post('/forgot-password',
  [
    body('email').isEmail().withMessage('Podaj prawidłowy email')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg
        });
      }

      const { email } = req.body;

      // Znajdź użytkownika
      const user = await db.getAsync(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      // Zawsze zwracaj sukces (security - nie ujawniaj czy email istnieje)
      if (!user) {
        return res.json({
          success: true,
          message: 'Jeśli email istnieje w systemie, wysłaliśmy link do resetowania hasła.'
        });
      }

      // Generuj reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = Date.now() + 3600000; // 1 godzina

      // Zapisz token
      await db.runAsync(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [resetToken, resetExpires, user.id]
      );

      // Wyślij email
      try {
        await sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        console.error('Błąd wysyłania emaila:', emailError);
      }

      res.json({
        success: true,
        message: 'Jeśli email istnieje w systemie, wysłaliśmy link do resetowania hasła.'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Błąd podczas wysyłania linku resetującego'
      });
    }
  }
);

// POST /api/auth/reset-password - Reset hasła
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Token jest wymagany'),
    body('password').isLength({ min: 6 }).withMessage('Hasło musi mieć min. 6 znaków')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg
        });
      }

      const { token, password } = req.body;

      // Znajdź użytkownika z tokenem
      const user = await db.getAsync(
        'SELECT id, reset_token_expires FROM users WHERE reset_token = ?',
        [token]
      );

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Token resetujący jest nieprawidłowy'
        });
      }

      // Sprawdź czy token nie wygasł
      if (user.reset_token_expires < Date.now()) {
        return res.status(400).json({
          success: false,
          message: 'Token resetujący wygasł. Poproś o nowy link.'
        });
      }

      // Hash nowego hasła
      const hashedPassword = await bcrypt.hash(password, 10);

      // Zaktualizuj hasło i wyczyść token
      await db.runAsync(
        `UPDATE users 
         SET password = ?, reset_token = NULL, reset_token_expires = NULL 
         WHERE id = ?`,
        [hashedPassword, user.id]
      );

      res.json({
        success: true,
        message: 'Hasło zostało zmienione! Możesz się teraz zalogować.'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Błąd podczas resetowania hasła'
      });
    }
  }
);

module.exports = router;
