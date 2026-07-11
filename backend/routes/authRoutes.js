import { Router } from 'express';
import { body } from 'express-validator';

import {
  register,
  login,
  getProfile,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ---------------------------------------------------------------------------
// Validation rule sets
// ---------------------------------------------------------------------------

/**
 * Rules for POST /register
 * Production note: Place express-rate-limit middleware BEFORE these routes
 * e.g. router.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }))
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

/**
 * Rules for POST /login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

/**
 * Rules for PUT /me (profile update)
 */
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('newPassword')
    .optional()
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// POST /api/auth/register
router.post('/register', validate(registerValidation), register);

// POST /api/auth/login
router.post('/login', validate(loginValidation), login);

// GET /api/auth/me  — protected
router.get('/me', protect, getProfile);

// GET /api/auth/profile  — protected (alias)
router.get('/profile', protect, getProfile);

// PUT /api/auth/me  — protected
router.put('/me', protect, validate(updateProfileValidation), updateProfile);

// PUT /api/auth/profile  — protected (alias)
router.put('/profile', protect, validate(updateProfileValidation), updateProfile);

export default router;
