const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Załaduj zmienne środowiskowe
dotenv.config();

// Dane testowe
const testUsers = [
    {
        email: 'test@akademia.pl',
        password: 'test123',
        name: 'Jan Testowy',
        role: 'user',
        isPremium: false,
        completedSections: [1, 2],
        quizResults: [
            {
                quizId: 'quiz-basics',
                score: 8,
                totalQuestions: 10,
                answers: { 1: 0, 2: 1, 3: 2 },
                completedAt: new Date()
            }
        ]
    },
    {
        email: 'premium@akademia.pl',
        password: 'premium123',
        name: 'Anna Premium',
        role: 'user',
        isPremium: true,
        premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dni
        completedSections: [1, 2, 3, 4, 5, 6],
        quizResults: [
            {
                quizId: 'quiz-basics',
                score: 10,
                totalQuestions: 10,
                answers: { 1: 0, 2: 1, 3: 2 },
                completedAt: new Date()
            },
            {
                quizId: 'quiz-advanced',
                score: 9,
                totalQuestions: 10,
                answers: { 1: 1, 2: 2, 3: 0 },
                completedAt: new Date()
            }
        ]
    },
    {
        email: 'admin@akademia.pl',
        password: 'admin123',
        name: 'Admin Użytkownik',
        role: 'admin',
        isPremium: true,
        premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 rok
        completedSections: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        quizResults: []
    }
];

// Połącz z bazą danych
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Połączono z MongoDB');
    } catch (error) {
        console.error('❌ Błąd połączenia:', error.message);
        process.exit(1);
    }
};

// Funkcja seed
const seedDatabase = async () => {
    try {
        // Usuń wszystkich użytkowników
        await User.deleteMany();
        console.log('🗑️  Usunięto wszystkich użytkowników');

        // Dodaj testowych użytkowników
        const users = await User.create(testUsers);
        console.log(`✅ Utworzono ${users.length} użytkowników testowych:`);
        
        users.forEach(user => {
            console.log(`   - ${user.email} (Premium: ${user.isPremium})`);
        });

        console.log('\n📝 Dane logowania:');
        console.log('   Użytkownik testowy:');
        console.log('   Email: test@akademia.pl');
        console.log('   Hasło: test123');
        console.log('');
        console.log('   Użytkownik premium:');
        console.log('   Email: premium@akademia.pl');
        console.log('   Hasło: premium123');
        console.log('');
        console.log('   Administrator:');
        console.log('   Email: admin@akademia.pl');
        console.log('   Hasło: admin123');

    } catch (error) {
        console.error('❌ Błąd podczas seedowania:', error.message);
    }
};

// Uruchom seed
const run = async () => {
    await connectDB();
    await seedDatabase();
    
    console.log('\n✨ Seeding zakończony!');
    process.exit(0);
};

// Obsługa błędów
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    process.exit(1);
});

run();
