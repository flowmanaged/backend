const User = require('../models/User');
const Payment = require('../models/Payment');

// @desc    Dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        // Podstawowe statystyki
        const totalUsers = await User.countDocuments();
        const premiumUsers = await User.countDocuments({ isPremium: true });
        const freeUsers = totalUsers - premiumUsers;
        
        const todayRegistrations = await User.countDocuments({
            createdAt: { $gte: today }
        });
        
        const weekRegistrations = await User.countDocuments({
            createdAt: { $gte: weekAgo }
        });
        
        const monthRegistrations = await User.countDocuments({
            createdAt: { $gte: monthAgo }
        });

        // Statystyki płatności
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const todayRevenue = await Payment.aggregate([
            { 
                $match: { 
                    status: 'completed',
                    completedAt: { $gte: today }
                } 
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const weekRevenue = await Payment.aggregate([
            { 
                $match: { 
                    status: 'completed',
                    completedAt: { $gte: weekAgo }
                } 
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Statystyki postępów
        const allUsers = await User.find().select('completedSections quizResults');
        
        const totalCompletedSections = allUsers.reduce((sum, user) => 
            sum + user.completedSections.length, 0);
        
        const totalQuizzes = allUsers.reduce((sum, user) => 
            sum + user.quizResults.length, 0);

        // Średni wynik quizów
        let avgQuizScore = 0;
        let totalQuizPoints = 0;
        let totalPossiblePoints = 0;
        
        allUsers.forEach(user => {
            user.quizResults.forEach(result => {
                totalQuizPoints += result.score;
                totalPossiblePoints += result.totalQuestions;
            });
        });
        
        if (totalPossiblePoints > 0) {
            avgQuizScore = Math.round((totalQuizPoints / totalPossiblePoints) * 100);
        }

        // Trend rejestracji (ostatnie 30 dni)
        const registrationTrend = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    premium: premiumUsers,
                    free: freeUsers,
                    todayRegistrations,
                    weekRegistrations,
                    monthRegistrations,
                    premiumPercentage: totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0
                },
                revenue: {
                    total: totalRevenue[0]?.total || 0,
                    today: todayRevenue[0]?.total || 0,
                    week: weekRevenue[0]?.total || 0
                },
                progress: {
                    totalCompletedSections,
                    totalQuizzes,
                    avgQuizScore
                },
                trends: {
                    registrations: registrationTrend
                }
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas pobierania statystyk',
            error: error.message
        });
    }
};

// @desc    Get all users with pagination and search
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            filter = 'all',
            sort = 'newest'
        } = req.query;

        // Build query
        let query = {};
        
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (filter === 'premium') {
            query.isPremium = true;
        } else if (filter === 'free') {
            query.isPremium = false;
        } else if (filter === 'admin') {
            query.role = 'admin';
        }

        // Sort
        let sortOption = {};
        if (sort === 'newest') {
            sortOption.createdAt = -1;
        } else if (sort === 'oldest') {
            sortOption.createdAt = 1;
        } else if (sort === 'name') {
            sortOption.name = 1;
        }

        const users = await User.find(query)
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sortOption);

        const count = await User.countDocuments(query);

        res.json({
            success: true,
            users,
            pagination: {
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                perPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas pobierania użytkowników',
            error: error.message
        });
    }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        // Pobierz historię płatności
        const payments = await Payment.find({ user: user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            user,
            payments
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas pobierania danych użytkownika',
            error: error.message
        });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const { name, email, role, isPremium, premiumExpiresAt } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        // Nie pozwól usunąć ostatniego admina
        if (user.role === 'admin' && role !== 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Nie można usunąć ostatniego administratora'
                });
            }
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (typeof isPremium !== 'undefined') {
            user.isPremium = isPremium;
        }
        if (premiumExpiresAt) {
            user.premiumExpiresAt = premiumExpiresAt;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Użytkownik zaktualizowany',
            user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas aktualizacji użytkownika',
            error: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        // Nie pozwól usunąć samego siebie
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Nie możesz usunąć swojego konta admina'
            });
        }

        // Nie pozwól usunąć ostatniego admina
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Nie można usunąć ostatniego administratora'
                });
            }
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Użytkownik usunięty'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas usuwania użytkownika',
            error: error.message
        });
    }
};

// @desc    Toggle user premium status
// @route   POST /api/admin/users/:id/toggle-premium
// @access  Private/Admin
exports.toggleUserPremium = async (req, res) => {
    try {
        const { duration = 30 } = req.body; // duration in days, default 30
        
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Użytkownik nie znaleziony'
            });
        }

        user.isPremium = !user.isPremium;

        if (user.isPremium) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + duration);
            user.premiumExpiresAt = expiresAt;
        } else {
            user.premiumExpiresAt = null;
        }

        await user.save();

        res.json({
            success: true,
            message: user.isPremium ? 'Premium aktywowane' : 'Premium dezaktywowane',
            user: {
                id: user._id,
                email: user.email,
                isPremium: user.isPremium,
                premiumExpiresAt: user.premiumExpiresAt
            }
        });
    } catch (error) {
        console.error('Toggle premium error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas zmiany statusu premium',
            error: error.message
        });
    }
};

// @desc    Get payment history
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getPayments = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status = 'all'
        } = req.query;

        let query = {};
        if (status !== 'all') {
            query.status = status;
        }

        const payments = await Payment.find(query)
            .populate('user', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Payment.countDocuments(query);

        res.json({
            success: true,
            payments,
            pagination: {
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                perPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd podczas pobierania płatności',
            error: error.message
        });
    }
};
