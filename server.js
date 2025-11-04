const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Załaduj zmienne środowiskowe
dotenv.config();

// Połącz z bazą danych
connectDB();

// Zainicjuj aplikację Express
const app = express();

// Middleware bezpieczeństwa
app.use(helmet());

// CORS - dozwól żądania z frontendu
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://frontend-xxx.vercel.app'  // Dodaj URL z Vercel
    ],
    credentials: true
}));

// Rate limiting - ogranicz liczbę żądań
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minut
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // max 100 żądań na okno
    message: {
        success: false,
        message: 'Zbyt wiele żądań z tego IP, spróbuj ponownie za chwilę'
    }
});

app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Importuj routes
const authRoutes = require('./routes/authRoutes');
const progressRoutes = require('./routes/progressRoutes');
const premiumRoutes = require('./routes/premiumRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const couponRoutes = require('./routes/couponRoutes');

// Endpoint testowy
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Akademia Biznesowa API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            progress: '/api/progress',
            premium: '/api/premium',
            admin: '/api/admin',
            payments: '/api/payments',
            coupons: '/api/coupons'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint nie znaleziony'
    });
});

// Globalny error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Wewnętrzny błąd serwera',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start serwera
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('===========================================');
  console.log('   🚀 Akademia Biznesowa API');
  console.log('===========================================');
  console.log(`   📍 Port: ${PORT}`);
  console.log(`   🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   🔗 URL: http://localhost:${PORT}`);
  console.log('===========================================');
});


// Obsługa nieobsłużonych obietnic
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    // W produkcji: zamknij serwer i zgłoś błąd
    // server.close(() => process.exit(1));
});

module.exports = app;
