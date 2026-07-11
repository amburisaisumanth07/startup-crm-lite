import { validationResult } from 'express-validator';

/**
 * Validation Middleware — runs a chain of express-validator checks
 * and returns a structured 400 error if any fail.
 *
 * @param {import('express-validator').ValidationChain[]} validations - Array of express-validator chains
 * @returns Express middleware function
 *
 * Usage:
 *   router.post('/register', validate([
 *     body('email').isEmail(),
 *     body('password').isLength({ min: 6 })
 *   ]), controller);
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validation chains in parallel
    await Promise.all(validations.map((validation) => validation.run(req)));

    const result = validationResult(req);

    // If no errors, proceed to the next middleware/controller
    if (result.isEmpty()) {
      return next();
    }

    // Map errors to a consistent { field, message } shape
    const errors = result.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      errors,
    });
  };
};
