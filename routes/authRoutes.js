const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
    validateRegister,
    validateLogin,
    validateChangePassword,
    validateForgotPassword,
    validateResetPassword,
    handleValidationErrors
} = require('../middleware/validation');

// Rate limitery dla endpointów wrażliwych
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: 5, // maksymalnie 5 prób
    message: {
        success: false,
        message: 'Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 godzina
    max: 3, // maksymalnie 3 próby
    message: {
        success: false,
        message: 'Zbyt wiele prób resetowania hasła. Spróbuj ponownie za godzinę'
    }
});

// Publiczne endpointy
router.post('/register',
    validateRegister,
    handleValidationErrors,
    authController.register
);

router.post('/login',
    authLimiter,           // ← DODANE
    validateLogin,
    handleValidationErrors,
    authController.login
);

router.post('/forgot-password',
    forgotPasswordLimiter,  // ← DODANE
    validateForgotPassword,
    handleValidationErrors,
    authController.forgotPassword
);

router.post('/reset-password/:token',
    validateResetPassword,
    handleValidationErrors,
    authController.resetPassword
);

// Chronione endpointy (wymagają autoryzacji)
router.get('/me', protect, authController.getMe);

router.put('/change-password',
    protect,
    validateChangePassword,
    handleValidationErrors,
    authController.changePassword
);

module.exports = router;