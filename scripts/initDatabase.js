const db = require('../config/database');

console.log('🔧 Inicjalizacja bazy danych...');

// Tabela użytkowników
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_verified INTEGER DEFAULT 0,
  is_premium INTEGER DEFAULT 0,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

// Tabela postępów w nauce
const createProgressTable = `
CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  section_id INTEGER NOT NULL,
  completed INTEGER DEFAULT 0,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, section_id)
)`;

// Tabela wyników quizów
const createQuizResultsTable = `
CREATE TABLE IF NOT EXISTS quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  quiz_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers TEXT NOT NULL,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`;

// Tabela subskrypcji Premium
const createSubscriptionsTable = `
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_type TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_date DATETIME,
  payment_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`;

// Wykonanie wszystkich zapytań
db.serialize(() => {
  db.run(createUsersTable, (err) => {
    if (err) {
      console.error('❌ Błąd tworzenia tabeli users:', err.message);
    } else {
      console.log('✅ Tabela users utworzona');
    }
  });

  db.run(createProgressTable, (err) => {
    if (err) {
      console.error('❌ Błąd tworzenia tabeli progress:', err.message);
    } else {
      console.log('✅ Tabela progress utworzona');
    }
  });

  db.run(createQuizResultsTable, (err) => {
    if (err) {
      console.error('❌ Błąd tworzenia tabeli quiz_results:', err.message);
    } else {
      console.log('✅ Tabela quiz_results utworzona');
    }
  });

  db.run(createSubscriptionsTable, (err) => {
    if (err) {
      console.error('❌ Błąd tworzenia tabeli subscriptions:', err.message);
    } else {
      console.log('✅ Tabela subscriptions utworzona');
    }
  });

  // Utworzenie indeksów dla lepszej wydajności
  db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  db.run('CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_results(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id)');

  console.log('✅ Indeksy utworzone');
  console.log('🎉 Inicjalizacja bazy danych zakończona!');
  
  db.close((err) => {
    if (err) {
      console.error('❌ Błąd zamykania połączenia:', err.message);
    } else {
      console.log('✅ Połączenie z bazą zamknięte');
    }
  });
});
