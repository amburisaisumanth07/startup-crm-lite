import { Router } from 'express';
import { body, param } from 'express-validator';

import { protect }  from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getMonthlyStats,
  getLeadsSearch,
} from '../controllers/leadController.js';

const router = Router();

// ---------------------------------------------------------------------------
// Global guard — every route in this file requires a valid JWT
// Production note: Add express-rate-limit here for write operations
// ---------------------------------------------------------------------------
router.use(protect);

// ---------------------------------------------------------------------------
// Validation rule sets (mirrored from Lead schema)
// ---------------------------------------------------------------------------

const VALID_STATUSES = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];
const VALID_SOURCES  = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'];

/** Rules applied when creating a new lead */
const createLeadValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

  body('company')
    .trim()
    .notEmpty().withMessage('Company is required'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('source')
    .optional()
    .isIn(VALID_SOURCES).withMessage(`Source must be one of: ${VALID_SOURCES.join(', ')}`),

  body('notes')
    .optional()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),

  body('value')
    .optional()
    .isNumeric().withMessage('Value must be a number')
    .toFloat()
    .custom((val) => val >= 0).withMessage('Value cannot be negative'),
];

/** Rules applied when doing a full update (all fields optional) */
const updateLeadValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

  body('company')
    .optional()
    .trim()
    .notEmpty().withMessage('Company cannot be empty'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('source')
    .optional()
    .isIn(VALID_SOURCES).withMessage(`Source must be one of: ${VALID_SOURCES.join(', ')}`),

  body('notes')
    .optional()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),

  body('value')
    .optional()
    .isNumeric().withMessage('Value must be a number')
    .toFloat()
    .custom((val) => val >= 0).withMessage('Value cannot be negative'),
];

/** Rules applied when patching only the status */
const updateStatusValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
];

/** Validates that :id is a valid MongoDB ObjectId */
const idParamValidation = [
  param('id').isMongoId().withMessage('Invalid lead ID'),
];

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET  /api/leads/stats          — aggregated stats for Dashboard StatsCards
// NOTE: must be declared BEFORE /:id to avoid Express matching 'stats' as an id
router.get('/stats', getLeadStats);
router.get('/stats/summary', getLeadStats); // Alias for stats summary

// GET  /api/leads/monthly-stats  — last-6-month bar chart data
router.get('/monthly-stats', getMonthlyStats);
router.get('/stats/monthly', getMonthlyStats); // Alias for monthly stats

// GET  /api/leads/search         — quick autocomplete search
router.get('/search', getLeadsSearch);

// GET  /api/leads                — list leads (with filtering, sorting, pagination)
router.get('/', getLeads);

// POST /api/leads                — create a new lead
router.post('/', validate(createLeadValidation), createLead);

// GET  /api/leads/:id            — get a single lead by ID
router.get('/:id', validate(idParamValidation), getLeadById);

// PUT  /api/leads/:id            — full update of a lead
router.put('/:id', validate([...idParamValidation, ...updateLeadValidation]), updateLead);

// PATCH /api/leads/:id/status   — quick status-only update
router.patch('/:id/status', validate([...idParamValidation, ...updateStatusValidation]), updateLeadStatus);

// DELETE /api/leads/:id          — delete a lead permanently
router.delete('/:id', validate(idParamValidation), deleteLead);

export default router;
