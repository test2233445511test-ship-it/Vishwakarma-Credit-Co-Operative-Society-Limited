import { ApiError } from './api'

const defaultMessages = {
  400: 'Invalid request. Please check your input.',
  401: 'Please sign in to continue.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This resource already exists.',
  422: 'Please check your input and try again.',
  429: 'Too many requests. Please wait a moment.',
  500: 'Something went wrong. Please try again later.',
  0: 'Unable to connect to the server. Please check your connection.',
}

export function getErrorMessage(error) {
  if (error instanceof ApiError) {
    if (error.message && !error.message.startsWith('Request failed')) {
      return error.message
    }
    return defaultMessages[error.status] || 'An unexpected error occurred.'
  }

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return defaultMessages[0]
  }

  return error?.message || 'An unexpected error occurred.'
}

export function handleApiError(error, fallback = null) {
  console.error('[API Error]', error)
  return fallback
}
