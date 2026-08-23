const jwt = require("jsonwebtoken");


// ==========================================
// VERIFY JWT
// ==========================================

function authenticateToken(req, res, next) {

    const authHeader =
        req.headers["authorization"];


    // No Authorization header

    if (!authHeader) {

        return res.status(401).json({
            message: "Access token required"
        });

    }


    // Expected format:
    // Bearer TOKEN

    const token =
        authHeader.split(" ")[1];


    if (!token) {

        return res.status(401).json({
            message: "Invalid authorization format"
        });

    }


    try {

        const decoded =
            jwt.verify(
                token,
                 process.env.JWT_SECRET,
            );


        // Store decoded user
        // inside request

        req.user = decoded;


        next();


    } catch (error) {

        return res.status(403).json({
            message: "Invalid or expired token"
        });

    }

}


// ==========================================
// CHECK ADMIN
// ==========================================

function requireAdmin(req, res, next) {

    if (req.user.role !== "ADMIN") {

        return res.status(403).json({
            message: "Admin access required"
        });

    }


    next();

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    authenticateToken,
    requireAdmin
};