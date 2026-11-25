import { authService } from './authService'

/**
 * Shared fetch wrapper that attaches the JWT Bearer token and automatically
 * refreshes it (single-flight) + retries once on 401 Unauthorized.
 */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = authService.getToken()
  const headers = new Headers(init.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response = await fetch(input, { ...init, headers })

  if (response.status === 401) {
    const newToken = await authService.refreshAccessToken()
    if (!newToken) {
      authService.logout()
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      return response
    }

    headers.set('Authorization', `Bearer ${newToken}`)
    response = await fetch(input, { ...init, headers })
  }

  return response
}
