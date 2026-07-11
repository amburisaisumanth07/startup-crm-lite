import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect Middleware — verifies JWT and attaches user to req.user.
 *
 * Production note: Add express-rate-limit before this middleware on
 * authenticated routes to prevent brute-force token stuffing attacks.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Reject if no token present
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, access denied',
      });
    }

    // 3. Verify the token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired, please login again',
        });
      }
      // Catches JsonWebTokenError (bad signature, malformed, etc.)
      return res.status(401).json({
        success: false,
        message: 'Token is invalid',
      });
    }

    // 4. Confirm the user still exists in the database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists',
      });
    }

    // 5. Attach the user to the request object for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
