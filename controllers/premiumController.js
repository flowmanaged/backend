const User = require('../models/User');

// @desc    Aktywuj konto premium
// @route   POST /api/premium/activate
// @access  Private
exports.activatePremium = async (req, res) => {
    try {
        const { duration } = req.body; // duration w miesiącach
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        // Oblicz datę wygaśnięcia
        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + (duration || 1));

        user.isPremium = true;
        user.premiumExpiresAt = expirationDate;
        await user.save();

        res.json({
            success: true,
            message: 'Konto premium zostało aktywowane',
            premium: {
                isPremium: user.isPremium,
                expiresAt: user.premiumExpiresAt
            }
        });
    } catch (error) {
        console.error('Activate premium error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas aktywacji konta premium',
            error: error.message
        });
    }
};

// @desc    Sprawdź status premium
// @route   GET /api/premium/status
// @access  Private
exports.checkPremiumStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        // Sprawdź i zaktualizuj status premium
        const isPremiumActive = user.checkPremiumStatus();

        res.json({
            success: true,
            premium: {
                isPremium: isPremiumActive,
                expiresAt: user.premiumExpiresAt,
                daysRemaining: isPremiumActive && user.premiumExpiresAt
                    ? Math.ceil((user.premiumExpiresAt - new Date()) / (1000 * 60 * 60 * 24))
                    : 0
            }
        });
    } catch (error) {
        console.error('Check premium status error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas sprawdzania statusu premium',
            error: error.message
        });
    }
};

// @desc    Anuluj premium (tylko dla testów, w produkcji integracja z bramką płatności)
// @route   POST /api/premium/cancel
// @access  Private
exports.cancelPremium = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        user.isPremium = false;
        user.premiumExpiresAt = null;
        await user.save();

        res.json({
            success: true,
            message: 'Subskrypcja premium została anulowana',
            premium: {
                isPremium: false,
                expiresAt: null
            }
        });
    } catch (error) {
        console.error('Cancel premium error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas anulowania premium',
            error: error.message
        });
    }
};

// @desc    Symulacja płatności premium (dla testów)
// @route   POST /api/premium/simulate-payment
// @access  Public (w produkcji powinno być zabezpieczone kluczem API)
exports.simulatePayment = async (req, res) => {
    try {
        const { email, plan } = req.body; // plan: 'monthly', 'yearly'

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        // Ustaw czas trwania w zależności od planu
        const duration = plan === 'yearly' ? 12 : 1;
        
        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + duration);

        user.isPremium = true;
        user.premiumExpiresAt = expirationDate;
        await user.save();

        res.json({
            success: true,
            message: 'Płatność została przetworzona pomyślnie (symulacja)',
            premium: {
                isPremium: user.isPremium,
                expiresAt: user.premiumExpiresAt,
                plan: plan
            }
        });
    } catch (error) {
        console.error('Simulate payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas symulacji płatności',
            error: error.message
        });
    }
};

// @desc    Pobierz dostępne plany premium
// @route   GET /api/premium/plans
// @access  Public
exports.getPremiumPlans = async (req, res) => {
    try {
        const plans = [
            {
                id: 'monthly',
                name: 'Plan Miesięczny',
                duration: '1 miesiąc',
                price: 29.99,
                currency: 'PLN',
                features: [
                    'Dostęp do wszystkich sekcji premium',
                    'Dodatkowe pytania w quizach',
                    'Certyfikaty ukończenia',
                    'Wsparcie priorytetowe'
                ]
            },
            {
                id: 'yearly',
                name: 'Plan Roczny',
                duration: '12 miesięcy',
                price: 299.99,
                currency: 'PLN',
                discount: '17%',
                features: [
                    'Dostęp do wszystkich sekcji premium',
                    'Dodatkowe pytania w quizach',
                    'Certyfikaty ukończenia',
                    'Wsparcie priorytetowe',
                    'Dostęp do nowych funkcji jako pierwszy',
                    'Zniżka 17% w porównaniu z planem miesięcznym'
                ]
            }
        ];

        res.json({
            success: true,
            plans
        });
    } catch (error) {
        console.error('Get premium plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas pobierania planów premium',
            error: error.message
        });
    }
};
