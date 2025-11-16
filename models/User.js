const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email jest wymagany'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Podaj prawidłowy adres email']
    },
    password: {
        type: String,
        required: [true, 'Hasło jest wymagane'],
        minlength: [8, 'Hasło musi mieć minimum 8 znaków'],
        select: false // Nie zwracaj hasła domyślnie w zapytaniach
    },
    name: {
        type: String,
        required: [true, 'Imię jest wymagane'],
        trim: true,
        minlength: [2, 'Imię musi mieć minimum 2 znaki'],
        maxlength: [50, 'Imię może mieć maksymalnie 50 znaków']
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
        type: String
    }],
    quizResults: [{
        quizId: {
            type: String,
            required: true
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Date,
        select: false
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Automatycznie dodaje createdAt i updatedAt
});

// Indeksy dla lepszej wydajności
userSchema.index({ email: 1 });
userSchema.index({ isPremium: 1, premiumExpiresAt: 1 });

// Middleware: Hashowanie hasła przed zapisem
userSchema.pre('save', async function(next) {
    // Tylko jeśli hasło zostało zmodyfikowane
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

// Metoda: Porównywanie hasła
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) {
        return false;
    }
    
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

// Metoda: Sprawdzanie i aktualizowanie statusu premium
userSchema.methods.checkAndUpdatePremiumStatus = async function() {
    if (this.isPremium && this.premiumExpiresAt && this.premiumExpiresAt < new Date()) {
        this.isPremium = false;
        this.premiumExpiresAt = null;
        await this.save();
    }
    return this;
};

// Metoda: Sprawdzanie czy użytkownik ma aktywny premium (bez zapisu)
userSchema.methods.hasPremium = function() {
    if (!this.isPremium) {
        return false;
    }
    
    // Premium bez daty wygaśnięcia (lifetime)
    if (!this.premiumExpiresAt) {
        return true;
    }
    
    // Premium z datą wygaśnięcia
    return this.premiumExpiresAt > new Date();
};

// Metoda: Dodawanie ukończonej sekcji
userSchema.methods.addCompletedSection = async function(sectionId) {
    if (!this.completedSections.includes(sectionId)) {
        this.completedSections.push(sectionId);
        await this.save();
    }
    return this;
};

// Metoda: Dodawanie wyniku quizu
userSchema.methods.addQuizResult = async function(quizId, score) {
    this.quizResults.push({
        quizId,
        score,
        completedAt: new Date()
    });
    await this.save();
    return this;
};

// Metoda: Pobieranie statystyk użytkownika
userSchema.methods.getStats = function() {
    const quizScores = this.quizResults.map(r => r.score);
    
    return {
        totalQuizzes: this.quizResults.length,
        averageScore: quizScores.length > 0 
            ? (quizScores.reduce((a, b) => a + b, 0) / quizScores.length).toFixed(2)
            : 0,
        completedSections: this.completedSections.length,
        isPremium: this.hasPremium(),
        memberSince: this.createdAt
    };
};

// Virtual: Pełne informacje o użytkowniku (bez hasła)
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    delete user.__v;
    return user;
};

// Static: Znajdź użytkownika po email (z hasłem)
userSchema.statics.findByCredentials = async function(email, password) {
    const user = await this.findOne({ email }).select('+password');
    
    if (!user) {
        return null;
    }
    
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
        return null;
    }
    
    return user;
};

// Static: Sprawdź czy email już istnieje
userSchema.statics.emailExists = async function(email) {
    const user = await this.findOne({ email });
    return !!user;
};

module.exports = mongoose.model('User', userSchema);