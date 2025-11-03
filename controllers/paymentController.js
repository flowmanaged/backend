const Payment = require('../models/Payment');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

// Ceny planów w PLN (w groszach dla Stripe)
const PLAN_PRICES = {
    '3months': 9900,   // 99 PLN
    '6months': 19900,  // 199 PLN
    '12months': 29900  // 299 PLN
};

// Helper do konwersji czasu planu na miesiące
const getPlanDuration = (plan) => {
    const durations = {
        '3months': 3,
        '6months': 6,
        '12months': 12
    };
    return durations[plan] || 1;
};

// @desc    Create Stripe checkout session
// @route   POST /api/payments/stripe/create-session
// @access  Private
exports.createStripeSession = async (req, res) => {
    try {
        const { plan, couponCode } = req.body;
        const user = req.user;

        if (!PLAN_PRICES[plan]) {
            return res.status(400).json({
                success: false,
                message: 'Nieprawidłowy plan'
            });
        }

        let finalPrice = PLAN_PRICES[plan];
        let appliedCoupon = null;

        // Sprawdź kupon jeśli podany
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            
            if (coupon && coupon.isValid()) {
                // Sprawdź czy kupon dotyczy tego planu
                if (coupon.applicablePlans.length === 0 || coupon.applicablePlans.includes(plan)) {
                    const discount = coupon.calculateDiscount(finalPrice / 100);
                    finalPrice = Math.max(finalPrice - (discount * 100), 0);
                    appliedCoupon = {
                        code: coupon.code,
                        discount: discount
                    };
                }
            }
        }

        // W PRODUKCJI - użyj prawdziwego Stripe
        // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        // const session = await stripe.checkout.sessions.create({...});

        // DLA TESTÓW - symuluj płatność
        const mockSessionId = `mock_session_${Date.now()}_${user._id}`;
        const mockCheckoutUrl = `${process.env.CLIENT_URL}/payment/checkout?session=${mockSessionId}`;

        // Zapisz płatność jako pending
        const payment = await Payment.create({
            user: user._id,
            amount: finalPrice / 100,
            currency: 'PLN',
            plan: plan,
            paymentMethod: 'stripe',
            status: 'pending',
            transactionId: mockSessionId,
            metadata: {
                originalPrice: PLAN_PRICES[plan] / 100,
                coupon: appliedCoupon
            }
        });

        res.json({
            success: true,
            sessionId: mockSessionId,
            url: mockCheckoutUrl,
            payment: {
                id: payment._id,
                amount: payment.amount,
                plan: plan,
                coupon: appliedCoupon
            }
        });

    } catch (error) {
        console.error('Stripe session error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas tworzenia sesji płatności',
            error: error.message
        });
    }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payments/stripe/webhook
// @access  Public (secured by Stripe signature)
exports.stripeWebhook = async (req, res) => {
    try {
        // W PRODUKCJI - weryfikuj podpis Stripe
        // const sig = req.headers['stripe-signature'];
        // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        // DLA TESTÓW - symuluj webhook
        const event = req.body;

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const paymentId = session.client_reference_id;

            const payment = await Payment.findById(paymentId);
            if (payment) {
                payment.status = 'completed';
                payment.completedAt = new Date();
                await payment.save();

                // Aktywuj premium dla użytkownika
                const user = await User.findById(payment.user);
                if (user) {
                    const duration = getPlanDuration(payment.plan);
                    const expiresAt = new Date();
                    expiresAt.setMonth(expiresAt.getMonth() + duration);

                    user.isPremium = true;
                    user.premiumExpiresAt = expiresAt;
                    await user.save();

                    // Jeśli użyto kuponu, zwiększ licznik
                    if (payment.metadata?.coupon) {
                        await Coupon.findOneAndUpdate(
                            { code: payment.metadata.coupon.code },
                            { 
                                $inc: { usedCount: 1 },
                                $push: { 
                                    usedBy: { 
                                        user: user._id,
                                        usedAt: new Date()
                                    }
                                }
                            }
                        );
                    }
                }
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({
            success: false,
            message: 'Błąd webhook',
            error: error.message
        });
    }
};

// @desc    Create PayPal order
// @route   POST /api/payments/paypal/create-order
// @access  Private
exports.createPayPalOrder = async (req, res) => {
    try {
        const { plan, couponCode } = req.body;
        const user = req.user;

        if (!PLAN_PRICES[plan]) {
            return res.status(400).json({
                success: false,
                message: 'Nieprawidłowy plan'
            });
        }

        let finalPrice = PLAN_PRICES[plan] / 100; // PayPal w złotych, nie groszach
        let appliedCoupon = null;

        // Sprawdź kupon
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (coupon && coupon.isValid()) {
                if (coupon.applicablePlans.length === 0 || coupon.applicablePlans.includes(plan)) {
                    const discount = coupon.calculateDiscount(finalPrice);
                    finalPrice = Math.max(finalPrice - discount, 0);
                    appliedCoupon = {
                        code: coupon.code,
                        discount: discount
                    };
                }
            }
        }

        // W PRODUKCJI - użyj PayPal SDK
        // const paypal = require('@paypal/checkout-server-sdk');
        // const order = await paypalClient.execute(...);

        // DLA TESTÓW - symuluj
        const mockOrderId = `paypal_order_${Date.now()}_${user._id}`;

        const payment = await Payment.create({
            user: user._id,
            amount: finalPrice,
            currency: 'PLN',
            plan: plan,
            paymentMethod: 'paypal',
            status: 'pending',
            transactionId: mockOrderId,
            metadata: {
                originalPrice: PLAN_PRICES[plan] / 100,
                coupon: appliedCoupon
            }
        });

        res.json({
            success: true,
            orderId: mockOrderId,
            payment: {
                id: payment._id,
                amount: payment.amount,
                plan: plan
            }
        });
    } catch (error) {
        console.error('PayPal order error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas tworzenia zamówienia PayPal',
            error: error.message
        });
    }
};

// @desc    Capture PayPal payment
// @route   POST /api/payments/paypal/capture
// @access  Private
exports.capturePayPalPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        const payment = await Payment.findOne({ transactionId: orderId });
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Płatność nie znaleziona'
            });
        }

        // W PRODUKCJI - capture payment przez PayPal SDK
        
        // Oznacz jako completed
        payment.status = 'completed';
        payment.completedAt = new Date();
        await payment.save();

        // Aktywuj premium
        const user = await User.findById(payment.user);
        if (user) {
            const duration = getPlanDuration(payment.plan);
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + duration);

            user.isPremium = true;
            user.premiumExpiresAt = expiresAt;
            await user.save();

            // Użycie kuponu
            if (payment.metadata?.coupon) {
                await Coupon.findOneAndUpdate(
                    { code: payment.metadata.coupon.code },
                    { 
                        $inc: { usedCount: 1 },
                        $push: { usedBy: { user: user._id } }
                    }
                );
            }
        }

        res.json({
            success: true,
            message: 'Płatność zakończona sukcesem',
            payment
        });
    } catch (error) {
        console.error('PayPal capture error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas przetwarzania płatności',
            error: error.message
        });
    }
};

// @desc    Get payment history for user
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas pobierania historii płatności',
            error: error.message
        });
    }
};

// @desc    Complete test payment (for development)
// @route   POST /api/payments/complete-test
// @access  Private
exports.completeTestPayment = async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                success: false,
                message: 'Endpoint dostępny tylko w trybie development'
            });
        }

        const { paymentId } = req.body;

        const payment = await Payment.findById(paymentId);
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Płatność nie znaleziona'
            });
        }

        if (payment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Brak dostępu'
            });
        }

        // Symuluj sukces
        payment.status = 'completed';
        payment.completedAt = new Date();
        await payment.save();

        // Aktywuj premium
        const user = await User.findById(payment.user);
        const duration = getPlanDuration(payment.plan);
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + duration);

        user.isPremium = true;
        user.premiumExpiresAt = expiresAt;
        await user.save();

        res.json({
            success: true,
            message: 'Premium aktywowane (test)',
            payment,
            user: {
                isPremium: user.isPremium,
                premiumExpiresAt: user.premiumExpiresAt
            }
        });
    } catch (error) {
        console.error('Complete test payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd',
            error: error.message
        });
    }
};
