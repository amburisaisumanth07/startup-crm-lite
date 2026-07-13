/**
 * mongoSanitize — Express 5-compatible MongoDB Operator Injection Sanitizer.
 *
 * Why a custom implementation?
 *   `express-mongo-sanitize@2.2.0` internally accesses `req._body`, a private
 *   property that was removed in Express 5. This causes the sanitizer to silently
 *   do nothing on Express 5, leaving the app open to operator injection attacks
 *   (e.g., { "$where": "...", "$gt": "" }).
 *
 * This middleware replicates the same sanitization logic without relying on any
 * removed Express internals. It strips all keys that begin with `$` or contain `.`
 *   from req.body, req.query, and req.params recursively.
 *
 * Attack examples blocked:
 *   POST /login  body: { "email": { "$gt": "" }, "password": { "$gt": "" } }
 *   GET  /leads  query: { "status": { "$ne": null } }
 */

/**
 * Recursively removes keys starting with `$` or containing `.` from an object in-place.
 * Handles nested objects and arrays.
 *
 * @param {*} obj - The object or array to sanitize in-place
 * @returns {*} The sanitized input
 */
function sanitizeInPlace(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'object' && obj[i] !== null) {
        sanitizeInPlace(obj[i]);
      }
    }
    return obj;
  }

  for (const key of Object.keys(obj)) {
    // Drop keys starting with MongoDB operator prefix `$` or containing `.`
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeInPlace(obj[key]);
    }
  }
  return obj;
}

/**
 * Express middleware that sanitizes req.body, req.query, and req.params
 * in-place, removing any keys that start with `$` or contain `.`.
 *
 * Usage:
 *   import { mongoSanitize } from './middleware/mongoSanitize.js';
 *   app.use(mongoSanitize());
 *
 * @returns {Function} Express middleware function
 */
export const mongoSanitize = () => (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    sanitizeInPlace(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    sanitizeInPlace(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    sanitizeInPlace(req.params);
  }

  next();
};
