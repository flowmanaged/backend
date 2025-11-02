const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// OBSŁUGA BŁĘDÓW GLOBALNYCH
// ============================================
// Zapobiega zamknięciu serwera przez nieobsłużone błędy
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection at:', promise);
  console.error('⚠️  Reason:', reason?.message || reason);
  // NIE zamykamy serwera - kontynuujemy działanie
});

process.on('uncaughtException', (error) => {
  console.error('⚠️  Uncaught Exception:', error.message);
  console.error('⚠️  Stack:', error.stack);
  // NIE zamykamy serwera - kontynuujemy działanie
});

// ============================================
// MIDDLEWARE BEZPIECZEŃSTWA
// ============================================
app.use(helmet());

// CORS - zezwól na zapytania z frontendu
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5500',
    'http://localhost:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5500',
    'http://[::1]:8080',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - ochrona przed atakami
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100, // max 100 requestów na IP
  message: 'Zbyt wiele zapytań z tego IP, spróbuj ponownie później.'
});
app.use('/api/', limiter);

// Parser JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logowanie requestów w trybie deweloperskim
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================
// Wrap routes w try-catch aby obsłużyć błędy inicjalizacji
try {
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes załadowane');
} catch (error) {
  console.error('❌ Błąd ładowania auth routes:', error.message);
}

try {
  app.use('/api/user', userRoutes);
  console.log('✅ User routes załadowane');
} catch (error) {
  console.error('❌ Błąd ładowania user routes:', error.message);
}

try {
  app.use('/api/progress', progressRoutes);
  console.log('✅ Progress routes załadowane');
} catch (error) {
  console.error('❌ Błąd ładowania progress routes:', error.message);
}

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend działa poprawnie!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Akademia Business Analysis API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      user: '/api/user/*',
      progress: '/api/progress/*'
    }
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
// Obsługa błędów z async/await
app.use((err, req, res, next) => {
  console.error('❌ Error caught by middleware:');
  console.error('   Message:', err.message);
  
  // Nie pokazuj stack trace w produkcji
  if (process.env.NODE_ENV === 'development') {
    console.error('   Stack:', err.stack);
  }
  
  // Określ status code
  const statusCode = err.statusCode || err.status || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Coś poszło nie tak!',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

// 404 handler - musi być na końcu
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint nie istnieje: ${req.method} ${req.path}`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/*',
      'GET /api/user/*',
      'GET /api/progress/*'
    ]
  });
});

// ============================================
// START SERWERA
// ============================================
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SERWER URUCHOMIONY POMYŚLNIE!');
  console.log('='.repeat(60));
  console.log(`📍 Port:              ${PORT}`);
  console.log(`🌍 Environment:       ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check:      http://localhost:${PORT}/api/health`);
  console.log(`🏠 API Root:          http://localhost:${PORT}/`);
  console.log(`🔗 Frontend URL:      ${process.env.FRONTEND_URL || 'nie ustawione'}`);
  console.log('='.repeat(60) + '\n');
  
  // Informacja o email
  if (process.env.EMAIL_HOST) {
    console.log('📧 Email skonfigurowany');
  } else {
    console.log('⚠️  Email nie skonfigurowany (opcjonalny w dev)');
  }
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, zamykanie serwera...');
  server.close(() => {
    console.log('✅ Serwer zamknięty poprawnie');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received (Ctrl+C), zamykanie serwera...');
  server.close(() => {
    console.log('✅ Serwer zamknięty poprawnie');
    process.exit(0);
  });
});

module.exports = app;
