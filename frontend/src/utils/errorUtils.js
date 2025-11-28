// src/utils/errorUtils.js
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'An error occurred'
    return new AppError(message, error.response.status, error.response.data)
  } else if (error.request) {
    // Request made but no response received
    return new AppError('Network error. Please check your connection.', 0)
  } else {
    // Something else happened
    return new AppError(error.message || 'An unexpected error occurred', 500)
  }
}

export const isAppError = (error) => {
  return error instanceof AppError
}

export const getErrorMessage = (error) => {
  if (isAppError(error)) {
    return error.message
  } else if (error.response?.data?.message) {
    return error.response.data.message
  } else if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}