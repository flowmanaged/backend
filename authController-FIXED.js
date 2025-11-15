const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // ✅ WALIDACJA - sprawdź czy wszystkie pola są wypełnione
        if (!email || !password || !name) {
            return res.status(400).json({
                message: 'Proszę wypełnić wszystkie pola'
            });
        }

        // ✅ WALIDACJA EMAIL - sprawdź format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'Nieprawidłowy format adresu email'
            });
        }

        // ✅ WALIDACJA HASŁA - minimalna długość
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Hasło musi mieć co najmniej 6 znaków'
            });
        }

        // ✅ SPRAWDŹ CZY UŻYTKOWNIK JUŻ ISTNIEJE
        const userExists = await User.findOne({ email: email.toLowerCase() });
        
        if (userExists) {
            return res.status(400).json({
                message: 'Użytkownik o podanym adresie email już istnieje'
            });
        }

        // ✅ UTWÓRZ NOWEGO UŻYTKOWNIKA
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password, // Hasło zostanie automatycznie zahashowane przez middleware w modelu User
            role: 'user', // Domyślna rola
            isPremium: false
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isPremium: user.isPremium,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({
                message: 'Nieprawidłowe dane użytkownika'
            });
        }

    } catch (error) {
        console.error('Błąd rejestracji:', error);
        res.status(500).json({
            message: 'Błąd serwera podczas rejestracji',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ✅ WALIDACJA - sprawdź czy pola są wypełnione
        if (!email || !password) {
            return res.status(400).json({
                message: 'Proszę podać email i hasło'
            });
        }

        // ✅ ZNAJDŹ UŻYTKOWNIKA W BAZIE DANYCH
        const user = await User.findOne({ email: email.toLowerCase() });

        // ✅ SPRAWDŹ CZY UŻYTKOWNIK ISTNIEJE
        if (!user) {
            return res.status(401).json({
                message: 'Nieprawidłowy email lub hasło'
            });
        }

        // ✅ SPRAWDŹ CZY HASŁO JEST POPRAWNE
        const isPasswordCorrect = await user.matchPassword(password);
        
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Nieprawidłowy email lub hasło'
            });
        }

        // ✅ LOGOWANIE UDANE - zwróć dane użytkownika i token
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isPremium: user.isPremium,
            premiumUntil: user.premiumUntil,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('Błąd logowania:', error);
        res.status(500).json({
            message: 'Błąd serwera podczas logowania',
            error: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        // req.user jest ustawiane przez middleware auth
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                message: 'Użytkownik nie znaleziony'
            });
        }

        res.json(user);
    } catch (error) {
        console.error('Błąd pobierania użytkownika:', error);
        res.status(500).json({
            message: 'Błąd serwera',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getMe
};