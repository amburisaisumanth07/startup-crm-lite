import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ---------------------------------------------------------------------------
// Helper: generate a signed JWT for a given user ID
// ---------------------------------------------------------------------------

/**
 * Generates a signed JWT token.
 * @param {string} userId - The MongoDB ObjectId of the user.
 * @returns {string} Signed JWT string.
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------

/**
 * Register a new user.
 * Production note: Apply express-rate-limit here to prevent abuse.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Reject if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Create user — password will be hashed by the pre-save hook in User.js
    const user = await User.create({ name, email, password });

    // Generate token
    const token = generateToken(user._id);

    // toJSON() on the User model strips the password field automatically
    return res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

/**
 * Log in an existing user.
 * Production note: Apply express-rate-limit here to prevent brute-force attacks.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (excluded by default via schema select: false pattern)
    const user = await User.findOne({ email }).select('+password');

    // Use a single generic message — never reveal whether email or password is wrong
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Reject deactivated accounts
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    const token = generateToken(user._id);

    // toJSON() strips the password before it reaches the response
    return res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------

/**
 * Return the currently authenticated user (already attached by protect middleware).
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware — password is already excluded
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// PUT /api/auth/me
// ---------------------------------------------------------------------------

/**
 * Update the authenticated user's profile.
 * - Allows name update.
 * - Email changes require a separate verification flow (not implemented here).
 * - If a new password is supplied, the old password must be verified first.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    // Fetch the full user document (including password for potential comparison)
    const user = await User.findById(req.user._id).select('+password');

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Handle password change
    if (newPassword) {
      // currentPassword is required to change to a new one
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password',
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Assign new plain-text password — the pre-save hook will hash it
      user.password = newPassword;
    }

    await user.save();

    // toJSON() on the model removes the password before responding
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
