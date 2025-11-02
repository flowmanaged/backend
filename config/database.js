const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ścieżka do pliku bazy danych
const DB_PATH = path.join(__dirname, '..', 'database.db');

// Utworzenie/otwarcie połączenia z bazą
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Błąd połączenia z bazą danych:', err.message);
  } else {
    console.log('✅ Połączono z bazą danych SQLite');
  }
});

// Helper function do wykonywania zapytań z Promise
db.runAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

db.getAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = db;
