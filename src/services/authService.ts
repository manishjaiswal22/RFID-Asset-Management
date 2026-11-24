import type { LoginRequest, LoginResponse, AuthUser } from '../types/auth'

const TOKEN_KEY = 'ham_pro_auth_token'
const USER_KEY = 'ham_pro_auth_user'

export const getLoginApiUrl = (): string => {
  const envUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    '/api'
  ).trim()

  if (envUrl.endsWith('/api/auth/login')) {
    return envUrl
  }
  if (envUrl.endsWith('/api')) {
    return `${envUrl}/auth/login`
  }
  if (!envUrl || envUrl === '/') {
    return '/api/auth/login'
  }
  return `${envUrl.replace(/\/+$/, '')}/api/auth/login`
}

export const parseJwt = (token: string): any => {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true
  const decoded = parseJwt(token)
  if (!decoded || typeof decoded.exp !== 'number') return false
  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 <= Date.now()
}

export const authService = {
  isTokenExpired(token: string | null): boolean {
    return isTokenExpired(token)
  },

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const url = getLoginApiUrl()
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          userName: credentials.userName,
          password: credentials.password,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const errorMsg =
          data?.message ||
          (response.status === 401
            ? 'Invalid username or password.'
            : `Authentication failed (Status ${response.status}).`)
        return {
          success: false,
          message: errorMsg,
        }
      }

      if (data && data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token)
        if (data.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user))
        }
        return data as LoginResponse
      }

      return {
        success: false,
        message: data?.message || 'Login failed. Invalid response from server.',
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const isConnectionError =
        error?.message?.includes('Failed to fetch') ||
        error?.name === 'TypeError'
      return {
        success: false,
        message: isConnectionError
          ? 'Unable to connect to the authentication server (172.20.204.134:5187). Please check connection.'
          : (error?.message || 'Network error occurred during login.'),
      }
    }
  },

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null
    if (isTokenExpired(token)) {
      this.logout()
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      return null
    }
    return token
  },

  getUser(): AuthUser | null {
    if (!this.isAuthenticated()) return null
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return false
    if (isTokenExpired(token)) {
      this.logout()
      return false
    }
    return true
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  startTokenExpirationWatcher(onExpired: () => void): () => void {
    const check = () => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token && isTokenExpired(token)) {
        this.logout()
        onExpired()
      }
    }

    // Check periodically every 3 seconds
    const interval = setInterval(check, 3000)

    // Also set a precise timeout for exact expiration moment
    let timeout: any = null
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      const decoded = parseJwt(token)
      if (decoded && typeof decoded.exp === 'number') {
        const msRemaining = decoded.exp * 1000 - Date.now()
        if (msRemaining > 0) {
          timeout = setTimeout(() => {
            this.logout()
            onExpired()
          }, msRemaining)
        } else {
          this.logout()
          onExpired()
        }
      }
    }

    return () => {
      clearInterval(interval)
      if (timeout) clearTimeout(timeout)
    }
  }
}
