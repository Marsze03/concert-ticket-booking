// Vercel serverless function that wraps the Express app
const app = require('../backend/server.js');

// Export handler that rewrites paths for Vercel
module.exports = (req, res) => {
  // Vercel strips /api from the path, so we need to add it back
  req.url = '/api' + req.url;
  return app(req, res);
};
