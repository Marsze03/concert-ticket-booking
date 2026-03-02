// Vercel serverless function handler for Express app
const app = require('../backend/server.js');

module.exports = (req, res) => {
  // Ensure request URL has /api prefix for Express routes
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  
  return app(req, res);
};
