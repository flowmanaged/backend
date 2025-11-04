require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Połączenie z MongoDB Atlas działa!');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Błąd połączenia z MongoDB:', error.message);
  }
};

testConnection();
