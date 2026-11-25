import { authService } from './authService'
import type { ApiStockroom } from '../types/stockroom'

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
    throw new Error('Access denied: You do not have permission to view suggestions.')
  }
}

/**
 * Normalizes any suggestions response (array of objects, array of strings, or wrapped object)
 * into a uniform ApiStockroom[] array.
 */
export const normalizeSuggestions = (
  raw: any,
  existingStockrooms: ApiStockroom[] = []
): ApiStockroom[] => {
  if (!raw) return []

  let list: any[] = []
  if (Array.isArray(raw)) {
    list = raw
  } else if (Array.isArray(raw.suggestions)) {
    list = raw.suggestions
  } else if (Array.isArray(raw.data)) {
    list = raw.data
  } else if (Array.isArray(raw.result)) {
    list = raw.result
  } else if (Array.isArray(raw.results)) {
    list = raw.results
  } else if (Array.isArray(raw.stockrooms)) {
    list = raw.stockrooms
  } else if (Array.isArray(raw.rows)) {
    list = raw.rows
  } else if (Array.isArray(raw.items)) {
    list = raw.items
  } else if (Array.isArray(raw.payload)) {
    list = raw.payload
  } else if (Array.isArray(raw.response)) {
    list = raw.response
  } else if (raw.data && typeof raw.data === 'object') {
    if (Array.isArray(raw.data.suggestions)) list = raw.data.suggestions
    else if (Array.isArray(raw.data.stockrooms)) list = raw.data.stockrooms
    else if (Array.isArray(raw.data.rows)) list = raw.data.rows
    else if (Array.isArray(raw.data.items)) list = raw.data.items
    else if (Array.isArray(raw.data.results)) list = raw.data.results
  } else if (raw.result && typeof raw.result === 'object') {
    if (Array.isArray(raw.result.suggestions)) list = raw.result.suggestions
    else if (Array.isArray(raw.result.stockrooms)) list = raw.result.stockrooms
    else if (Array.isArray(raw.result.rows)) list = raw.result.rows
    else if (Array.isArray(raw.result.items)) list = raw.result.items
  }

  const result: ApiStockroom[] = []

  list.forEach((item, index) => {
    if (typeof item === 'string') {
      const name = item.trim()
      if (!name) return
      // Match against existing stockrooms by exact or normalized name
      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
      const match = existingStockrooms.find((s) => {
        const sClean = s.stockroomName.toLowerCase().replace(/[^a-z0-9]/g, '')
        return s.stockroomName.toLowerCase() === name.toLowerCase() || (cleanName && sClean === cleanName)
      })
      result.push({
        stockroomId: match ? match.stockroomId : index + 1,
        stockroomName: name
      })
    } else if (item && typeof item === 'object') {
      const id =
        item.stockroomId ??
        item.stockRoomId ??
        item.stockroom_id ??
        item.storeId ??
        item.store_id ??
        item.id ??
        item.value ??
        item.key ??
        item.code ??
        index + 1

      const name =
        item.stockroomName ??
        item.stockRoomName ??
        item.stockroom_name ??
        item.storeName ??
        item.store_name ??
        item.name ??
        item.text ??
        item.label ??
        item.suggestion ??
        item.title ??
        item.displayName ??
        item.display_name ??
        item.description ??
        (typeof item.toString === 'function' ? item.toString() : String(item))

      if (name && typeof name === 'string' && name.trim()) {
        result.push({
          stockroomId: Number(id) || index + 1,
          stockroomName: name.trim()
        })
      }
    }
  })

  return result
}

export const searchService = {
  /**
   * 1. Search Suggestions API
   * GET {{baseUrl}}/api/search/suggestions?q={q}&limit={limit}
   * Header: Authorization: Bearer {{access_token}}
   */
  async getSuggestions(
    q: string,
    limit = 10,
    existingStockrooms: ApiStockroom[] = [],
    signal?: AbortSignal
  ): Promise<ApiStockroom[]> {
    const trimmed = q.trim()
    const query = new URLSearchParams()
    if (trimmed) {
      query.set('q', trimmed)
    }
    query.set('limit', String(limit))

    const url = `${getApiBaseUrl()}/search/suggestions?${query.toString()}`
    const token = authService.getToken()

    const headers: Record<string, string> = {
      Accept: 'application/json'
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal
    })

    checkResponseAuth(response)

    if (!response.ok) {
      throw new Error(`Failed to fetch suggestions: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return normalizeSuggestions(data, existingStockrooms)
  }
}
