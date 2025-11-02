const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireVerified } = require('../middleware/auth');

// GET /api/user/profile - Pobierz profil użytkownika
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.getAsync(
      `SELECT 
        id, email, is_verified, is_premium, created_at,
        (SELECT COUNT(*) FROM progress WHERE user_id = users.id AND completed = 1) as completed_sections,
        (SELECT COUNT(*) FROM quiz_results WHERE user_id = users.id) as quiz_attempts
       FROM users 
       WHERE id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Użytkownik nie znaleziony'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.is_verified === 1,
        isPremium: user.is_premium === 1,
        createdAt: user.created_at,
        stats: {
          completedSections: user.completed_sections,
          quizAttempts: user.quiz_attempts
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania profilu'
    });
  }
});

// POST /api/user/upgrade-premium - Aktywuj Premium (demo)
router.post('/upgrade-premium', authenticateToken, requireVerified, async (req, res) => {
  try {
    // W prawdziwej aplikacji tu byłaby integracja z systemem płatności (Stripe, PayPal)
    // To jest wersja demo - aktywuje Premium bez płatności

    // Sprawdź czy użytkownik już ma Premium
    const user = await db.getAsync(
      'SELECT is_premium FROM users WHERE id = ?',
      [req.user.id]
    );

    if (user.is_premium) {
      return res.status(400).json({
        success: false,
        message: 'Już posiadasz aktywne konto Premium'
      });
    }

    // Aktywuj Premium
    await db.runAsync(
      'UPDATE users SET is_premium = 1 WHERE id = ?',
      [req.user.id]
    );

    // Dodaj subskrypcję
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 rok

    await db.runAsync(
      `INSERT INTO subscriptions (user_id, plan_type, status, end_date, payment_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, 'premium_annual', 'active', endDate.toISOString(), 'DEMO_PAYMENT']
    );

    res.json({
      success: true,
      message: 'Konto Premium aktywowane! (Wersja demo)',
      subscription: {
        planType: 'premium_annual',
        status: 'active',
        endDate: endDate.toISOString()
      }
    });

  } catch (error) {
    console.error('Upgrade premium error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas aktywacji Premium'
    });
  }
});

// GET /api/user/subscription - Sprawdź status subskrypcji
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const subscription = await db.getAsync(
      `SELECT * FROM subscriptions 
       WHERE user_id = ? AND status = 'active' 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [req.user.id]
    );

    if (!subscription) {
      return res.json({
        success: true,
        subscription: null,
        message: 'Brak aktywnej subskrypcji'
      });
    }

    res.json({
      success: true,
      subscription: {
        planType: subscription.plan_type,
        status: subscription.status,
        startDate: subscription.start_date,
        endDate: subscription.end_date
      }
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania subskrypcji'
    });
  }
});

// DELETE /api/user/account - Usuń konto
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    // Usuń użytkownika (CASCADE usunie też powiązane dane)
    await db.runAsync('DELETE FROM users WHERE id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'Konto zostało usunięte'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas usuwania konta'
    });
  }
});

module.exports = router;
