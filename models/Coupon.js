const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    maxUses: {
        type: Number,
        default: null // null = unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: true
    },
    applicablePlans: [{
        type: String,
        enum: ['3months', '6months', '12months']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    usedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Metoda do walidacji kuponu
couponSchema.methods.isValid = function() {
    const now = new Date();
    
    // Sprawdź czy aktywny
    if (!this.isActive) return false;
    
    // Sprawdź daty
    if (now < this.validFrom || now > this.validUntil) return false;
    
    // Sprawdź limit użyć
    if (this.maxUses !== null && this.usedCount >= this.maxUses) return false;
    
    return true;
};

// Metoda do obliczenia zniżki
couponSchema.methods.calculateDiscount = function(originalPrice) {
    if (this.discountType === 'percentage') {
        return originalPrice * (this.discountValue / 100);
    } else {
        return Math.min(this.discountValue, originalPrice);
    }
};

module.exports = mongoose.model('Coupon', couponSchema);
