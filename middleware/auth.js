const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware used for validate authentication on all routes
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodeToken = jwt.verify(token, process.env.SESSION_KEY);
    const userId = decodeToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    }
    else {
      next();
    }
  } catch (error) {
    res.status(401).json({ error:error | 'Invalid Request'})
  }
}