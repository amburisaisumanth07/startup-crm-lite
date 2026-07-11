/**
 * Global Express Error Handler Middleware.
 * Captures all unhandled errors and format them into a consistent JSON response.
 */
export const errorHandler = (err, req, res, next) => {
  // Create a copy of the error object and copy the message manually
  let error = { ...err };
  error.message = err.message;

  // Log to console for developer visibility
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new Error(message);
    error.statusCode = 404;
  }

  // Handle MongoDB duplicate key errors (code 11000)
  if (err.code === 11000) {
    // Extract the field that caused the duplication
    const field = Object.keys(err.keyValue)[0];
    // Create a user-friendly error message, e.g. "Email already exists"
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = new Error(message);
    error.statusCode = 409;
  }

  // Handle Mongoose Validation Error (field constraints failed)
  if (err.name === 'ValidationError') {
    const message = 'Validation Error';
    // Map over all validation errors and extract just the messages
    const errors = Object.values(err.errors).map((val) => val.message);
    error = new Error(message);
    error.statusCode = 400;
    error.errors = errors;
  }

  // Handle invalid JWT token
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Not authorized to access this route';
    error = new Error(message);
    error.statusCode = 401;
  }

  // Handle expired JWT token
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired, please login again';
    error = new Error(message);
    error.statusCode = 401;
  }

  // Set the final status code and message
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server error';

  // Construct the JSON response payload
  const responsePayload = {
    success: false,
    message,
    errors: error.errors || null,
  };

  // Only include the stack trace if running in development mode
  if (process.env.NODE_ENV === 'development') {
    responsePayload.stack = err.stack;
  }

  // Send the error response
  res.status(statusCode).json(responsePayload);
};
