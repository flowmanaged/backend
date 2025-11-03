const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const { protect, premiumRequired } = require('../middleware/auth');
const {
    validateActivatePremium,
    validateSimulatePayment,
    handleValidationErrors
} = require('../middleware/validation');

// Publiczne endpointy
router.get('/plans', premiumController.getPremiumPlans);

// Endpoint symulacji (w produkcji powinien być zabezpieczony)
router.post('/simulate-payment',
    validateSimulatePayment,
    handleValidationErrors,
    premiumController.simulatePayment
);

// Chronione endpointy (wymagają autoryzacji)
router.use(protect);

router.get('/status', premiumController.checkPremiumStatus);

router.post('/activate',
    validateActivatePremium,
    handleValidationErrors,
    premiumController.activatePremium
);

router.post('/cancel', premiumController.cancelPremium);

module.exports = router;
