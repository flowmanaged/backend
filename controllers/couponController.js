const Coupon = require('../models/Coupon');

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res) => {
    try {
        const { code, plan } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Kupon nie znaleziony'
            });
        }

        if (!coupon.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Kupon jest nieważny lub wygasł'
            });
        }

        // Sprawdź czy użytkownik już użył tego kuponu
        const alreadyUsed = coupon.usedBy.some(usage => 
            usage.user.toString() === req.user._id.toString()
        );

        if (alreadyUsed) {
            return res.status(400).json({
                success: false,
                message: 'Ten kupon został już przez Ciebie wykorzystany'
            });
        }

        // Sprawdź czy kupon dotyczy wybranego planu
        if (coupon.applicablePlans.length > 0 && !coupon.applicablePlans.includes(plan)) {
            return res.status(400).json({
                success: false,
                message: 'Ten kupon nie dotyczy wybranego planu'
            });
        }

        res.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                validUntil: coupon.validUntil
            }
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas walidacji kuponu',
            error: error.message
        });
    }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            coupons
        });
    } catch (error) {
        console.error('Get coupons error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas pobierania kuponów',
            error: error.message
        });
    }
};

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
    try {
        const {
            code,
            discountType,
            discountValue,
            maxUses,
            validUntil,
            applicablePlans
        } = req.body;

        // Sprawdź czy kupon już istnieje
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: 'Kupon o tym kodzie już istnieje'
            });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            maxUses,
            validUntil,
            applicablePlans: applicablePlans || [],
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Kupon utworzony',
            coupon
        });
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas tworzenia kuponu',
            error: error.message
        });
    }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:code
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
    try {
        const { code } = req.params;
        const updates = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Kupon nie znaleziony'
            });
        }

        // Aktualizuj pola
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                coupon[key] = updates[key];
            }
        });

        await coupon.save();

        res.json({
            success: true,
            message: 'Kupon zaktualizowany',
            coupon
        });
    } catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas aktualizacji kuponu',
            error: error.message
        });
    }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:code
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
    try {
        const { code } = req.params;

        const coupon = await Coupon.findOneAndDelete({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Kupon nie znaleziony'
            });
        }

        res.json({
            success: true,
            message: 'Kupon usunięty'
        });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas usuwania kuponu',
            error: error.message
        });
    }
};

// @desc    Toggle coupon active status
// @route   POST /api/coupons/:code/toggle
// @access  Private/Admin
exports.toggleCoupon = async (req, res) => {
    try {
        const { code } = req.params;

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Kupon nie znaleziony'
            });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.json({
            success: true,
            message: coupon.isActive ? 'Kupon aktywowany' : 'Kupon dezaktywowany',
            coupon
        });
    } catch (error) {
        console.error('Toggle coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas zmiany statusu kuponu',
            error: error.message
        });
    }
};
