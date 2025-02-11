const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.session.token || req.headers['x-access-token'];
  
    if (!token) {
      return res.status(403).json({ message: 'Token is required' });
    }
  
    jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      req.user = decoded; 
      next(); 
    });
  }
  
  module.exports = verifyToken;