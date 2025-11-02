const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireVerified } = require('../middleware/auth');

// GET /api/progress/sections - Pobierz postępy w sekcjach
router.get('/sections', authenticateToken, requireVerified, async (req, res) => {
  try {
    const progress = await db.allAsync(
      `SELECT section_id, completed, completed_at 
       FROM progress 
       WHERE user_id = ?`,
      [req.user.id]
    );

    // Zwróć w formacie obiektu dla łatwiejszego użycia
    const progressMap = {};
    progress.forEach(item => {
      progressMap[item.section_id] = {
        completed: item.completed === 1,
        completedAt: item.completed_at
      };
    });

    res.json({
      success: true,
      progress: progressMap,
      totalCompleted: progress.filter(p => p.completed === 1).length
    });

  } catch (error) {
    console.error('Get sections progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania postępów'
    });
  }
});

// POST /api/progress/sections/:sectionId/complete - Oznacz sekcję jako ukończoną
router.post('/sections/:sectionId/complete', authenticateToken, requireVerified, async (req, res) => {
  try {
    const { sectionId } = req.params;

    // Sprawdź czy już istnieje wpis
    const existing = await db.getAsync(
      'SELECT id FROM progress WHERE user_id = ? AND section_id = ?',
      [req.user.id, sectionId]
    );

    if (existing) {
      // Aktualizuj istniejący
      await db.runAsync(
        `UPDATE progress 
         SET completed = 1, completed_at = CURRENT_TIMESTAMP 
         WHERE user_id = ? AND section_id = ?`,
        [req.user.id, sectionId]
      );
    } else {
      // Utwórz nowy
      await db.runAsync(
        `INSERT INTO progress (user_id, section_id, completed, completed_at) 
         VALUES (?, ?, 1, CURRENT_TIMESTAMP)`,
        [req.user.id, sectionId]
      );
    }

    res.json({
      success: true,
      message: 'Sekcja oznaczona jako ukończona'
    });

  } catch (error) {
    console.error('Complete section error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas zapisywania postępu'
    });
  }
});

// POST /api/progress/quiz - Zapisz wynik quizu
router.post('/quiz', authenticateToken, requireVerified, async (req, res) => {
  try {
    const { quizId, score, totalQuestions, answers } = req.body;

    if (!quizId || score === undefined || !totalQuestions || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Brak wymaganych danych'
      });
    }

    // Zapisz wynik
    await db.runAsync(
      `INSERT INTO quiz_results (user_id, quiz_id, score, total_questions, answers) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, quizId, score, totalQuestions, JSON.stringify(answers)]
    );

    res.json({
      success: true,
      message: 'Wynik quizu zapisany',
      result: {
        score,
        totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100)
      }
    });

  } catch (error) {
    console.error('Save quiz result error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas zapisywania wyniku quizu'
    });
  }
});

// GET /api/progress/quiz/history - Pobierz historię quizów
router.get('/quiz/history', authenticateToken, requireVerified, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const history = await db.allAsync(
      `SELECT quiz_id, score, total_questions, completed_at 
       FROM quiz_results 
       WHERE user_id = ? 
       ORDER BY completed_at DESC 
       LIMIT ?`,
      [req.user.id, parseInt(limit)]
    );

    const stats = await db.getAsync(
      `SELECT 
        COUNT(*) as total_attempts,
        AVG(CAST(score AS FLOAT) / total_questions * 100) as average_percentage,
        MAX(CAST(score AS FLOAT) / total_questions * 100) as best_percentage
       FROM quiz_results 
       WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      history: history.map(h => ({
        quizId: h.quiz_id,
        score: h.score,
        totalQuestions: h.total_questions,
        percentage: Math.round((h.score / h.total_questions) * 100),
        completedAt: h.completed_at
      })),
      stats: {
        totalAttempts: stats?.total_attempts || 0,
        averagePercentage: Math.round(stats?.average_percentage || 0),
        bestPercentage: Math.round(stats?.best_percentage || 0)
      }
    });

  } catch (error) {
    console.error('Get quiz history error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania historii quizów'
    });
  }
});

// GET /api/progress/stats - Pobierz statystyki ogólne
router.get('/stats', authenticateToken, requireVerified, async (req, res) => {
  try {
    const stats = await db.getAsync(
      `SELECT 
        (SELECT COUNT(*) FROM progress WHERE user_id = ? AND completed = 1) as completed_sections,
        (SELECT COUNT(*) FROM quiz_results WHERE user_id = ?) as total_quiz_attempts,
        (SELECT AVG(CAST(score AS FLOAT) / total_questions * 100) 
         FROM quiz_results WHERE user_id = ?) as average_quiz_score
       FROM users WHERE id = ?`,
      [req.user.id, req.user.id, req.user.id, req.user.id]
    );

    // Ostatnia aktywność
    const lastActivity = await db.getAsync(
      `SELECT MAX(datetime) as last_activity FROM (
        SELECT completed_at as datetime FROM progress WHERE user_id = ?
        UNION ALL
        SELECT completed_at as datetime FROM quiz_results WHERE user_id = ?
      )`,
      [req.user.id, req.user.id]
    );

    res.json({
      success: true,
      stats: {
        completedSections: stats?.completed_sections || 0,
        totalQuizAttempts: stats?.total_quiz_attempts || 0,
        averageQuizScore: Math.round(stats?.average_quiz_score || 0),
        lastActivity: lastActivity?.last_activity || null
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania statystyk'
    });
  }
});

module.exports = router;
