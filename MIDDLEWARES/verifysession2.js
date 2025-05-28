const User = require('../MODELS/Users.js');

function verifySession2() {
    return async (req, res, next) => {
        if (!req.session.userId) {
            return res.redirect("/compte");
        }

        try {
            const user = await User.findById(req.params.userId);  
            const user2 = await User.findById(req.session.userId); 

            if (!user2) {
                return res.redirect("/compte");
            }

            if (user2.role === "admin") {
                return next();
            }

            if (!user || user._id.toString() !== user2._id.toString()) {
                return res.redirect("/compte");
            }

            req.user = user;
            next();

        } catch (error) {
            console.error('Error verifying session:', error);
            res.status(500).json({ message: 'Server error' });
        }
    };
}


module.exports = verifySession2;