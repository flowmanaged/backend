// Middleware sprawdzający czy użytkownik ma rolę admin

exports.adminOnly = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Najpierw musisz być zalogowany'
            });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Dostęp tylko dla administratorów'
            });
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Błąd sprawdzania uprawnień',
            error: error.message
        });
    }
};
