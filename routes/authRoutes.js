const express = require('express');
const router = express.Router();
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

// Publiczne endpointy
router.post('/register',
    validateRegister,
    handleValidationErrors,
    authController.register
);

router.post('/login',
    validateLogin,
    handleValidationErrors,
    authController.login
);

router.post('/forgot-password',
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
