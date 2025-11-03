const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { protect } = require('../middleware/auth');
const {
    validateCompleteSection,
    validateQuizResult,
    handleValidationErrors
} = require('../middleware/validation');

// Wszystkie endpointy wymagają autoryzacji
router.use(protect);

// Postępy
router.get('/', progressController.getProgress);
router.get('/stats', progressController.getStats);
router.delete('/reset', progressController.resetProgress);

// Sekcje
router.post('/complete-section',
    validateCompleteSection,
    handleValidationErrors,
    progressController.completeSection
);

// Quizy
router.post('/quiz-result',
    validateQuizResult,
    handleValidationErrors,
    progressController.saveQuizResult
);

router.get('/quiz-results', progressController.getQuizResults);

module.exports = router;
