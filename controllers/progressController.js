const User = require('../models/User');

// @desc    Zapisz ukończoną sekcję
// @route   POST /api/progress/complete-section
// @access  Private
exports.completeSection = async (req, res) => {
    try {
        const { sectionId } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        // Dodaj sekcję do ukończonych, jeśli nie została już dodana
        if (!user.completedSections.includes(sectionId)) {
            user.completedSections.push(sectionId);
            await user.save();
        }

        res.json({
            success: true,
            message: 'Sekcja została oznaczona jako ukończona',
            completedSections: user.completedSections
        });
    } catch (error) {
        console.error('Complete section error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas zapisywania postępu',
            error: error.message
        });
    }
};

// @desc    Pobierz postępy użytkownika
// @route   GET /api/progress
// @access  Private
exports.getProgress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        res.json({
            success: true,
            progress: {
                completedSections: user.completedSections,
                quizResults: user.quizResults,
                isPremium: user.isPremium,
                premiumExpiresAt: user.premiumExpiresAt
            }
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas pobierania postępów',
            error: error.message
        });
    }
};

// @desc    Zapisz wynik quizu
// @route   POST /api/progress/quiz-result
// @access  Private
exports.saveQuizResult = async (req, res) => {
    try {
        const { quizId, score, totalQuestions, answers } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        // Dodaj nowy wynik quizu
        user.quizResults.push({
            quizId,
            score,
            totalQuestions,
            answers,
            completedAt: new Date()
        });

        await user.save();

        res.json({
            success: true,
            message: 'Wynik quizu został zapisany',
            quizResults: user.quizResults
        });
    } catch (error) {
        console.error('Save quiz result error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas zapisywania wyniku quizu',
            error: error.message
        });
    }
};

// @desc    Pobierz wyniki quizów
// @route   GET /api/progress/quiz-results
// @access  Private
exports.getQuizResults = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        res.json({
            success: true,
            quizResults: user.quizResults
        });
    } catch (error) {
        console.error('Get quiz results error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas pobierania wyników quizów',
            error: error.message
        });
    }
};

// @desc    Resetuj postępy użytkownika
// @route   DELETE /api/progress/reset
// @access  Private
exports.resetProgress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        user.completedSections = [];
        user.quizResults = [];
        await user.save();

        res.json({
            success: true,
            message: 'Postępy zostały zresetowane'
        });
    } catch (error) {
        console.error('Reset progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas resetowania postępów',
            error: error.message
        });
    }
};

// @desc    Pobierz statystyki postępów
// @route   GET /api/progress/stats
// @access  Private
exports.getStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        // Oblicz statystyki
        const totalQuizzes = user.quizResults.length;
        const averageScore = totalQuizzes > 0
            ? user.quizResults.reduce((sum, result) => {
                return sum + (result.score / result.totalQuestions);
            }, 0) / totalQuizzes * 100
            : 0;

        const bestScore = totalQuizzes > 0
            ? Math.max(...user.quizResults.map(r => (r.score / r.totalQuestions) * 100))
            : 0;

        res.json({
            success: true,
            stats: {
                completedSections: user.completedSections.length,
                totalQuizzes,
                averageScore: Math.round(averageScore),
                bestScore: Math.round(bestScore),
                isPremium: user.isPremium,
                memberSince: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas pobierania statystyk',
            error: error.message
        });
    }
};
