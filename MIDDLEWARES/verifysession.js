const jwt = require('jsonwebtoken');
const User = require("../MODELS/Users.js");

function verifySession(requiredRole) {
    return async (req, res, next) => {
        if (!req.session.userId) {
            return res.redirect("/compte")
        }

        try {
            const user = await User.findById(req.session.userId);

            if (!user) {
                return res.redirect("/compte")
            }

            req.user = user;

            if (requiredRole && user.role !== requiredRole) {
                return res.redirect("/compte")
            }

            next();
        } catch (error) {
            console.error('Error verifying session:', error);
            res.status(500).json({ message: 'Server error' });
        }
    };
}

module.exports = verifySession;


