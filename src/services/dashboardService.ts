import { authService } from './authService'
import { apiFetch } from './apiClient'
import type { ApiStockroom } from '../types/stockroom'
import type {
  CentralDashboardParams,
  CentralDashboardResponse
} from '../types/centralDashboard'
import type {
  StockroomDashboardParams,
  StockroomDashboardResponse
} from '../types/stockroomDashboard'

const getApiBaseUrl = (): string => {
  const envUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    '/api'
  ).trim()

  if (envUrl.endsWith('/api')) {
    return envUrl
  }
  if (!envUrl || envUrl === '/') {
    return '/api'
  }
  return `${envUrl.replace(/\/+$/, '')}/api`
}

const checkResponseAuth = (response: Response) => {
  if (response.status === 401) {
    authService.logout()
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    throw new Error('Session expired. Please log in again.')
  }
  if (response.status === 403) {
    throw new Error('Access denied: You do not have permission to view this section.')
  }
}

let inFlightStockroomsPromise: Promise<ApiStockroom[]> | null = null

export const dashboardService = {
  async getStockrooms(): Promise<ApiStockroom[]> {
    if (inFlightStockroomsPromise) {
      return inFlightStockroomsPromise
    }

    const url = `${getApiBaseUrl()}/dashboard/stockrooms`

    inFlightStockroomsPromise = (async () => {
      const response = await apiFetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      })

      checkResponseAuth(response)

      if (!response.ok) {
        throw new Error(`Failed to fetch stockrooms: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (!Array.isArray(data)) {
        throw new Error('Invalid format for stockrooms response')
      }

      return data as ApiStockroom[]
    })().finally(() => {
      inFlightStockroomsPromise = null
    })

    return inFlightStockroomsPromise
  },

  async getCentralDashboard(
    params?: CentralDashboardParams,
    signal?: AbortSignal
  ): Promise<CentralDashboardResponse> {
    const query = new URLSearchParams()
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.pageSize !== undefined) query.set('pageSize', String(params.pageSize))
    if (params?.sortBy) query.set('sortBy', params.sortBy)
    if (params?.sortDesc !== undefined) query.set('sortDesc', String(params.sortDesc))
    if (params?.stockroomId !== undefined) query.set('stockroomId', String(params.stockroomId))
    if (params?.search) query.set('search', params.search)
    if (params?.fromDate) query.set('fromDate', params.fromDate)
    if (params?.toDate) query.set('toDate', params.toDate)

    const queryString = query.toString()
    const url = `${getApiBaseUrl()}/dashboard/central${queryString ? `?${queryString}` : ''}`

    const response = await apiFetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      signal
    })

    checkResponseAuth(response)

    if (!response.ok) {
      throw new Error(
        `Failed to fetch central dashboard data: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    return data as CentralDashboardResponse
  },

  async getStockroomDashboard(
    params?: StockroomDashboardParams,
    signal?: AbortSignal
  ): Promise<StockroomDashboardResponse> {
    const query = new URLSearchParams()
    if (params?.stockroomId !== undefined)
      query.set('stockroomId', String(params.stockroomId))
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.pageSize !== undefined)
      query.set('pageSize', String(params.pageSize))
    if (params?.search) query.set('search', params.search)
    if (params?.sortBy) query.set('sortBy', params.sortBy)
    if (params?.sortDesc !== undefined)
      query.set('sortDesc', String(params.sortDesc))
    if (params?.fromDate) query.set('fromDate', params.fromDate)
    if (params?.toDate) query.set('toDate', params.toDate)

    const queryString = query.toString()
    const url = `${getApiBaseUrl()}/dashboard/stockroom${queryString ? `?${queryString}` : ''}`

    const response = await apiFetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      signal
    })

    checkResponseAuth(response)

    if (!response.ok) {
      throw new Error(
        `Failed to fetch stockroom dashboard data: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    return data as StockroomDashboardResponse
  }
}
