import { authService } from './authService'
import type {
  GetUsersParams,
  GetUsersResponse,
  CreateUserPayload,
  UpdateUserPayload,
  UserMutationResponse
} from '../types/userMaster'

const getApiBaseUrl = (): string => {
  const envUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://172.20.204.134:5187'
  ).trim()

  if (envUrl.endsWith('/api')) {
    return envUrl
  }
  return `${envUrl.replace(/\/+$/, '')}/api`
}

const checkResponseAuth = (response: Response) => {
  if (response.status === 401 || response.status === 403) {
    authService.logout()
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    throw new Error('Session expired. Please log in again.')
  }
}

const getAuthHeaders = (isJson = false): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: 'application/json'
  }
  if (isJson) {
    headers['Content-Type'] = 'application/json'
  }
  const token = authService.getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export const userService = {
  /**
   * 1. List Users (GET /api/users)
   */
  async getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
    const query = new URLSearchParams()
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.pageSize !== undefined) query.set('pageSize', String(params.pageSize))
    if (params?.sortBy) query.set('sortBy', params.sortBy)
    if (params?.sortDesc !== undefined) query.set('sortDesc', String(params.sortDesc))
    if (params?.search) query.set('search', params.search.trim())

    const queryString = query.toString()
    const url = `${getApiBaseUrl()}/users${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    checkResponseAuth(response)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || `Failed to fetch users (Status ${response.status})`)
    }

    const data = await response.json()
    return data as GetUsersResponse
  },

  /**
   * 2. Create User (POST /api/users)
   */
  async createUser(payload: CreateUserPayload): Promise<UserMutationResponse> {
    const url = `${getApiBaseUrl()}/users`
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        userName: payload.userName.trim(),
        password: payload.password,
        email: payload.email.trim(),
        contactNumber: payload.contactNumber.trim(),
        userType: payload.userType,
        stockroomId: payload.userType === 'STOCKROOM' ? payload.stockroomId ?? null : null
      })
    })

    checkResponseAuth(response)

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.message || `Failed to create user (Status ${response.status})`)
    }

    return (data || { success: true, message: 'User created successfully.' }) as UserMutationResponse
  },

  /**
   * 3. Update User (PUT /api/users/{id})
   */
  async updateUser(id: number | string, payload: UpdateUserPayload): Promise<UserMutationResponse> {
    const url = `${getApiBaseUrl()}/users/${id}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        userName: payload.userName.trim(),
        password: payload.password || '',
        email: payload.email.trim(),
        contactNumber: payload.contactNumber.trim(),
        userType: payload.userType,
        stockroomId: payload.userType === 'STOCKROOM' ? payload.stockroomId ?? null : null
      })
    })

    checkResponseAuth(response)

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.message || `Failed to update user (Status ${response.status})`)
    }

    return (data || { success: true, message: 'User updated successfully.' }) as UserMutationResponse
  },

  /**
   * 4. Toggle Active / Inactive (PATCH /api/users/{id}/toggle-status)
   */
  async toggleStatus(id: number | string): Promise<UserMutationResponse> {
    const url = `${getApiBaseUrl()}/users/${id}/toggle-status`
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders()
    })

    checkResponseAuth(response)

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.message || `Failed to toggle user status (Status ${response.status})`)
    }

    return (data || { success: true, message: 'User status updated successfully.' }) as UserMutationResponse
  },

  /**
   * 5. Delete User (DELETE /api/users/{id})
   */
  async deleteUser(id: number | string): Promise<UserMutationResponse> {
    const url = `${getApiBaseUrl()}/users/${id}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    checkResponseAuth(response)

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.message || `Failed to delete user (Status ${response.status})`)
    }

    return (data || { success: true, message: 'User deleted successfully.' }) as UserMutationResponse
  }
}
