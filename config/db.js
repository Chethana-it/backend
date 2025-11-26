const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    // Debug: Check if URI exists
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in .env file');
      console.log('💡 Create a .env file with: MONGODB_URI=mongodb://localhost:27017/ac-leads');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    // console.log('📍 URI:', mongoURI);

    // ✅ FIXED: Remove deprecated options
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log('📦 Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    
    // Additional error info
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 MongoDB server is not running. Start it with:');
      console.log('   - Linux: sudo systemctl start mongod');
      console.log('   - Mac: brew services start mongodb-community');
      console.log('   - Or use MongoDB Atlas (cloud)');
    }
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Check your username and password in MongoDB Atlas');
      console.log('   - Verify credentials in Security > Database Access');
      console.log('   - Special characters in password need URL encoding');
    }
    
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('💡 Add your IP address in MongoDB Atlas');
      console.log('   - Go to Security > Network Access');
      console.log('   - Add 0.0.0.0/0 for testing (allow all)');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;