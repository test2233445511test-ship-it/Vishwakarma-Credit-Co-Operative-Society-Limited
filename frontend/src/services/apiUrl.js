const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export function apiUrl(path) {
  return `${BASE}${path}`
}
