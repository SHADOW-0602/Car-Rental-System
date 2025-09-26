// Vercel serverless function entry point
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Import the Express app
const app = require('../backend/server');

// Export for Vercel
module.exports = app;