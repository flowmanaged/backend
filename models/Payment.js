const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'PLN'
    },
    plan: {
        type: String,
        enum: ['3months', '6months', '12months'],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'paypal', 'p24', 'test'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    metadata: {
        type: Object,
        default: {}
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index dla szybszego wyszukiwania
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
