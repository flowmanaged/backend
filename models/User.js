const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email jest wymagany'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Nieprawidłowy format email']
    },
    password: {
        type: String,
        required: [true, 'Hasło jest wymagane'],
        minlength: [6, 'Hasło musi mieć minimum 6 znaków']
    },
    name: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    premiumExpiresAt: {
        type: Date,
        default: null
    },
    completedSections: [{
        type: Number
    }],
    quizResults: [{
        quizId: String,
        score: Number,
        totalQuestions: Number,
        answers: Object,
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash hasła przed zapisem
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Metoda do porównywania haseł
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Metoda do sprawdzania statusu premium
userSchema.methods.checkPremiumStatus = function() {
    if (!this.isPremium) {
        return false;
    }
    
    if (this.premiumExpiresAt && this.premiumExpiresAt < new Date()) {
        this.isPremium = false;
        this.save();
        return false;
    }
    
    return true;
};

// Metoda do zwracania bezpiecznych danych użytkownika
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    delete user.__v;
    return user;
};

module.exports = mongoose.model('User', userSchema);
