import { authService } from './authService'
import type {
  GetStockroomsMasterParams,
  GetStockroomsMasterResponse,
  CreateStockroomPayload,
  UpdateStockroomPayload,
  StockroomMutationResponse
} from '../types/stockroomMaster'

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

export const stockroomService = {
  /**
   * 1. List Stock Rooms (GET /api/stockrooms)
   */
  async getStockrooms(
    params?: GetStockroomsMasterParams
  ): Promise<GetStockroomsMasterResponse> {
    const query = new URLSearchParams()
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.pageSize !== undefined) query.set('pageSize', String(params.pageSize))
    if (params?.sortBy) query.set('sortBy', params.sortBy)
    if (params?.sortDesc !== undefined) query.set('sortDesc', String(params.sortDesc))
    if (params?.search) query.set('search', params.search.trim())

    const queryString = query.toString()
    const url = `${getApiBaseUrl()}/stockrooms${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    checkResponseAuth(response)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        errorData?.message || `Failed to fetch stock rooms (Status ${response.status})`
      )
    }

    const data = await response.json()
    return data as GetStockroomsMasterResponse
  },

  /**
   * 2. Add Stock Room (POST /api/stockrooms)
   */
  async addStockroom(
    payload: CreateStockroomPayload
  ): Promise<StockroomMutationResponse> {
    const url = `${getApiBaseUrl()}/stockrooms`
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        stockroomName: payload.stockroomName.trim(),
        stockroomEngineer: payload.stockroomEngineer.trim(),
        stockroomLead: payload.stockroomLead.trim()
      })
    })

    checkResponseAuth(response)

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        data?.message || `Failed to create stock room (Status ${response.status})`
      )
    }

    return (data || {
      success: true,
      message: 'Stock room created successfully.'
    }) as StockroomMutationResponse
  },

  /**
   * 3. Edit Stock Room (PUT /api/stockrooms/{id})
   */
  async updateStockroom(
    id: number | string,
    payload: UpdateStockroomPayload
  ): Promise<StockroomMutationResponse> {
    const url = `${getApiBaseUrl()}/stockrooms/${id}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        stockroomName: payload.stockroomName.trim(),
        stockroomEngineer: payload.stockroomEngineer.trim(),
        stockroomLead: payload.stockroomLead.trim()
      })
    })

    checkResponseAuth(response)

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        data?.message || `Failed to update stock room (Status ${response.status})`
      )
    }

    return (data || {
      success: true,
      message: 'Stock room updated successfully.'
    }) as StockroomMutationResponse
  },

  /**
   * 4. Toggle Active / Inactive (PATCH /api/stockrooms/{id}/toggle-status)
   */
  async toggleStatus(id: number | string): Promise<StockroomMutationResponse> {
    const url = `${getApiBaseUrl()}/stockrooms/${id}/toggle-status`
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders()
    })

    checkResponseAuth(response)

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        data?.message || `Failed to toggle stock room status (Status ${response.status})`
      )
    }

    return (data || {
      success: true,
      message: 'Stock room status updated successfully.'
    }) as StockroomMutationResponse
  },

  /**
   * 5. Delete Stock Room (DELETE /api/stockrooms/{id})
   */
  async deleteStockroom(id: number | string): Promise<StockroomMutationResponse> {
    const url = `${getApiBaseUrl()}/stockrooms/${id}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    checkResponseAuth(response)

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        data?.message || `Failed to delete stock room (Status ${response.status})`
      )
    }

    return (data || {
      success: true,
      message: 'Stock room deleted successfully.'
    }) as StockroomMutationResponse
  }
}
