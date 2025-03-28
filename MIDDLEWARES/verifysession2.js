const User = require('../MODELS/Users.js');

function verifySession2() {
    return async (req, res, next) => {
        if (!req.session.userId) {
            return res.redirect("/compte")
        }

        try {
            const user = await User.findById(req.params.userId);
            const user2 = await User.findById(req.session.userId)
            
            if (!user) {
                return res.redirect("/compte")
            }
            
            req.user = user;
            
            if (user._id.toString() !== user2._id.toString()) {
                return res.redirect("/compte")
            }
            next();
            


        }   catch (error) {
            console.error('Error verifying session:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = verifySession2;