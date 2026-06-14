const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

async function request(endpoint, options = {}) {
  const token = options.token || null

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers,
  }

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body)
  }

  if (config.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const url = `${API_BASE}${endpoint}`

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.text().catch(() => null)
      let message
      try {
        const parsed = JSON.parse(errorData)
        message = parsed.message || parsed.error || errorData
      } catch {
        message = errorData || `Request failed with status ${response.status}`
      }
      throw new ApiError(message, response.status)
    }

    if (response.status === 204) return null

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(error.message || 'Network error', 0)
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function api(url, options = {}) {
  return request(url, { ...options, method: 'GET' })
}

api.get = (url, options) => request(url, { ...options, method: 'GET' })
api.post = (url, body, options) => request(url, { ...options, method: 'POST', body })
api.put = (url, body, options) => request(url, { ...options, method: 'PUT', body })
api.delete = (url, options) => request(url, { ...options, method: 'DELETE' })

export default api
