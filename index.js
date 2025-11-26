const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
const result = dotenv.config();

// Debug: Check if .env loaded
// console.log('📝 .env loading result:', result);
// console.log('🔍 MONGODB_URI:', process.env.MONGODB_URI);
console.log('🔍 PORT:', process.env.PORT);
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);

// Connect to database
connectDB();


const app = express();

// ✅ Updated CORS for production
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000', 
    'https://ac-lead-magnet-production.up.railway.app' // Add this after deploying frontend
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/leads', require('./routes/leads'));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});