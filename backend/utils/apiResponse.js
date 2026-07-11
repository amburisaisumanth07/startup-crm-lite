/**
 * Helper functions to standardise API responses across the application.
 */

/**
 * Sends a consistent success response.
 * @param {Object} res - Express response object
 * @param {*} data - The payload to send back
 * @param {String} message - A descriptive success message
 * @param {Number} statusCode - HTTP status code (default 200)
 */
export const successResponse = (res, data, message, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends a consistent error response.
 * @param {Object} res - Express response object
 * @param {String} message - Error description
 * @param {Number} statusCode - HTTP error status code (default 500)
 * @param {*} errors - Additional error details, like validation arrays
 */
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Sends a standard paginated response for lists of data.
 * @param {Object} res - Express response object
 * @param {Array} data - The page of data to return
 * @param {Number} total - Total number of items across all pages
 * @param {Number} page - Current page number
 * @param {Number} limit - Number of items per page
 */
export const paginatedResponse = (res, data, total, page, limit) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};
