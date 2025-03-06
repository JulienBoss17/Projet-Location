const jwt = require('jsonwebtoken');
const User = require("../MODELS/Users.js");

function verifySession2() {
    return async (req, res, next) => {
        if (!req.session.userId) {
            return res.redirect("/compte")
        }

        try {
            const user = await User.findById(req.params.userId);
            const user2 = await User.findById(req.session.userId)
            
            if (!user) {
                return res.status(403).json({ message: 'User not found' });
            }
            
            req.user = user;
            
            if (user._id.toString() !== user2._id.toString()) {
                return res.status(403).json({ message: 'User not connected' });
            }
            next();
            


        }   catch (error) {
            console.error('Error verifying session:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = verifySession2;