const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// Wszystkie endpointy wymagają autoryzacji
router.use(protect);

// Postępy
router.get('/', progressController.getProgress);
router.get('/stats', progressController.getStats);
router.delete('/reset', progressController.resetProgress);

// Sekcje
router.post('/complete-section', progressController.completeSection);

// Quizy
router.post('/quiz-result', progressController.saveQuizResult);
router.get('/quiz-results', progressController.getQuizResults);

module.exports = router;
