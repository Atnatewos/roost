// apps/api/src/utils/ApiResponse.js

/**
 * Standardized API response builder.
 * Every response from the API follows this consistent format:
 * { success: boolean, message: string, data: any, meta?: object }
 */
class ApiResponse {
  /**
   * Success response
   * @param {*} data - Response payload
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default 200)
   * @param {object} meta - Optional metadata (pagination, etc.)
   */
  static success(data, message = 'Success', statusCode = 200, meta = {}) {
    return {
      success: true,
      statusCode,
      message,
      data,
      ...(Object.keys(meta).length > 0 && { meta }),
    };
  }

  /**
   * Error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  static error(message, statusCode = 500) {
    return {
      success: false,
      statusCode,
      message,
      data: null,
    };
  }

  /**
   * Paginated response
   * @param {Array} data - Array of items
   * @param {number} page - Current page number
   * @param {number} limit - Items per page
   * @param {number} total - Total number of items
   */
  static paginated(data, page, limit, total) {
    return {
      success: true,
      statusCode: 200,
      message: 'Success',
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }
}

export default ApiResponse;