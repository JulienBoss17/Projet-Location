const jwt = require('jsonwebtoken');

function generateToken(user) {
    return jwt.sign({ id: user._id }, process.env.SECRETKEY);
  }

  module.exports = generateToken;