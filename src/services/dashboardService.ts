import { authService } from './authService'
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

export const dashboardService = {
  async getStockrooms(): Promise<ApiStockroom[]> {
    const url = `${getApiBaseUrl()}/dashboard/stockrooms`
    const token = authService.getToken()

    const headers: Record<string, string> = {
      Accept: 'application/json',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
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
  },

  async getCentralDashboard(
    params?: CentralDashboardParams
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
    const token = authService.getToken()

    const headers: Record<string, string> = {
      Accept: 'application/json'
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
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
    params?: StockroomDashboardParams
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
    const token = authService.getToken()

    const headers: Record<string, string> = {
      Accept: 'application/json'
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
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
