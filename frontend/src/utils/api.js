/**
 * API utility with automatic token expiry / auth error handling.
 * Wraps the native fetch() and intercepts 401/403 responses to
 * clear auth state and redirect to the login page.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8082/api'

function getAuthHeaders() {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken')
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

function clearAuthState() {
  const keys = ['token', 'authToken', 'role', 'authRole', 'authApproved', 'username', 'authLoginType', 'authAvatarUrl', 'authEmail']
  keys.forEach((key) => localStorage.removeItem(key))
}

/**
 * Check if the stored JWT token is expired by decoding its payload.
 * Returns true if expired or invalid.
 */
export function isTokenExpired() {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken')
  if (!token) return true

  try {
    const payloadBase64 = token.split('.')[1]
    if (!payloadBase64) return true

    const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')))
    const expMs = (payload.exp ?? 0) * 1000
    return Date.now() >= expMs
  } catch {
    return true
  }
}

/**
 * Perform an authenticated API request.
 * Automatically handles 401/403 by logging out and redirecting.
 */
export async function apiFetch(path, options = {}) {
  // Only redirect for expired sessions when a token exists and is expired.
  const token = localStorage.getItem('token') || localStorage.getItem('authToken')
  if (token && isTokenExpired()) {
    clearAuthState()
    window.location.href = '/login?expired=true'
    throw new Error('Session expired. Please log in again.')
  }

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  })

  if (response.status === 401) {
    clearAuthState()
    window.location.href = '/login?expired=true'
    throw new Error('Session expired. Please log in again.')
  }

  if (response.status === 403) {
    let serverMessage = 'Access denied.'
    try {
      const data = await response.clone().json()
      if (typeof data?.message === 'string' && data.message.trim()) {
        serverMessage = data.message.trim()
      }
    } catch {
      // Keep fallback message when response is not JSON.
    }
    throw new Error(serverMessage)
  }

  return response
}

export { API_BASE_URL, getAuthHeaders, clearAuthState }
export default apiFetch

// ── Resource API ──────────────────────────────────────────────
export const resourceAPI = {
  getAll: (params) => apiFetch('/resources' + (params ? '?' + new URLSearchParams(params).toString() : '')),
  getById: (id) => apiFetch(`/resources/${id}`),
  create: (data) => apiFetch('/resources', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  patchStatus: (id, status) => apiFetch(`/resources/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id) => apiFetch(`/resources/${id}`, { method: 'DELETE' }),
}
