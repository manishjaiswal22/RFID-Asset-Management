import { authService } from './authService'

const DEFAULT_TIMEOUT_MS = 15000

/**
 * Shared fetch wrapper that attaches the JWT Bearer token, enforces a timeout
 * (merged with any caller AbortSignal), and automatically refreshes (single-flight)
 * + retries once on 401 Unauthorized.
 */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = authService.getToken() || localStorage.getItem('ham_pro_auth_token')
  const headers = new Headers(init.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const controller = new AbortController()
  const externalSignal = init.signal

  const onExternalAbort = () => controller.abort(externalSignal?.reason)
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason)
    } else {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true })
    }
  }

  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException('Request timed out', 'TimeoutError'))
  }, DEFAULT_TIMEOUT_MS)

  try {
    let response = await fetch(input, { ...init, headers, signal: controller.signal })

    if (response.status === 401) {
      const newToken = await authService.refreshAccessToken()
      if (!newToken) {
        authService.logout()
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
        return response
      }

      headers.set('Authorization', `Bearer ${newToken}`)
      response = await fetch(input, { ...init, headers, signal: controller.signal })
    }

    return response
  } finally {
    clearTimeout(timeoutId)
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort)
    }
  }
}
