const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Proszę podać imię']
    },
    email: {
        type: String,
        required: [true, 'Proszę podać email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Proszę podać prawidłowy email']
    },
    password: {
        type: String,
        required: [true, 'Proszę podać hasło'],
        minlength: [6, 'Hasło musi mieć co najmniej 6 znaków']
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
    premiumUntil: {
        type: Date,
        default: null
    },
    progress: [{
        sectionId: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    quizResults: [{
        quizId: {
            type: String,
            required: true
        },
        score: {
            type: Number,
            required: true
        },
        totalQuestions: {
            type: Number,
            required: true
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// ✅ MIDDLEWARE - Hashuj hasło PRZED zapisaniem do bazy danych
userSchema.pre('save', async function(next) {
    // Hashuj hasło tylko jeśli zostało zmodyfikowane
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generuj salt (losowe dane)
        const salt = await bcrypt.genSalt(10);
        
        // Hashuj hasło z salt
        this.password = await bcrypt.hash(this.password, salt);
        
        next();
    } catch (error) {
        next(error);
    }
});

// ✅ METODA - Porównaj wprowadzone hasło z zahashowanym hasłem w bazie
userSchema.methods.matchPassword = async function(enteredPassword) {
    try {
        // bcrypt.compare() automatycznie obsługuje salt
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        console.error('Błąd porównywania hasła:', error);
        return false;
    }
};

// ✅ METODA - Sprawdź czy premium jest aktywne
userSchema.methods.isPremiumActive = function() {
    if (!this.isPremium) {
        return false;
    }
    
    if (!this.premiumUntil) {
        return true; // Premium bezterminowe
    }
    
    return new Date() < this.premiumUntil;
};

// ✅ MIDDLEWARE - Sprawdź status premium przed zapisem
userSchema.pre('save', function(next) {
    // Jeśli premium wygasło, ustaw isPremium na false
    if (this.premiumUntil && new Date() > this.premiumUntil) {
        this.isPremium = false;
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
