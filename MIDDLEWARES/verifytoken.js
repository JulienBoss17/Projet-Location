const jwt = require('jsonwebtoken');

function verifyToken(requiredRole) {
    return (req, res, next) => {
        const token = req.session.token || req.headers['x-access-token'];

        if (!token) {
            return res.status(403).json({ message: 'Token is required' });
        }

        jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token' });
            }

            req.user = decoded; 

            if (requiredRole && decoded.role !== requiredRole) {
                return res.status(403).json({ message: 'Access denied: insufficient permissions' });
            }

            next();
        });
    };
}

module.exports = verifyToken;
