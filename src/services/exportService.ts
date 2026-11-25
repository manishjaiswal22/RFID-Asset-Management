import { authService } from './authService'

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

/**
 * Downloads an Excel export (.xlsx) from the backend API.
 *
 * @param status 1 for Central Dashboard (Admin only), 2 for Stock Room Dashboard
 * @param stockroomId Optional numeric stockroom ID (passed as query param so backend exports only that stockroom's data)
 * @param onProgress Optional callback receiving download progress percentage (0 - 100)
 * @param stockroomName Optional stockroom name used in the downloaded filename when a specific stockroom is selected
 */
export async function downloadExcelExport(
  status: 1 | 2,
  stockroomId?: number | null,
  onProgress?: (percent: number) => void,
  stockroomName?: string | null
): Promise<void> {
  const params = new URLSearchParams({ status: String(status) })
  if (stockroomId && stockroomId > 0) {
    params.set('stockroomId', String(stockroomId))
  }

  const token =
    authService.getToken() ||
    localStorage.getItem('token') ||
    localStorage.getItem('ham_pro_auth_token')

  const headers: Record<string, string> = {
    Accept:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream, */*'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  onProgress?.(10)

  // Smooth simulated progress while request is in flight
  let currentProgress = 10
  const progressInterval = setInterval(() => {
    if (currentProgress < 85) {
      currentProgress += Math.floor(Math.random() * 8) + 4
      onProgress?.(Math.min(currentProgress, 85))
    }
  }, 120)

  try {
    const url = `${getApiBaseUrl()}/export/excel?${params.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers
    })

    if (response.status === 401) {
      authService.logout()
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      throw new Error('Session expired. Please log in again.')
    }
    if (response.status === 403) {
      throw new Error('You are not authorized to export this data.')
    }
    if (!response.ok) {
      throw new Error(`Failed to export Excel file: ${response.status} ${response.statusText}`)
    }

    onProgress?.(90)

    const contentLength = response.headers.get('content-length')
    let blob: Blob

    if (contentLength && response.body) {
      const total = parseInt(contentLength, 10)
      let loaded = 0
      const reader = response.body.getReader()
      const chunks: BlobPart[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) {
          chunks.push(value.buffer as ArrayBuffer)
          loaded += value.length
          if (total > 0) {
            const percent = Math.min(98, Math.round((loaded / total) * 100))
            onProgress?.(percent)
          }
        }
      }
      blob = new Blob(chunks, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
    } else {
      blob = await response.blob()
    }

    clearInterval(progressInterval)
    onProgress?.(100)

    const disposition = response.headers.get('Content-Disposition')

    // Build a meaningful fallback filename using the stockroom name when available
    let fileName: string
    if (stockroomName && stockroomName.trim()) {
      // Sanitize stockroom name for use as a filename (replace special chars with underscores)
      const safeName = stockroomName.trim().replace(/[<>:"/\\|?*]+/g, '_').replace(/\s+/g, '_')
      fileName = status === 1
        ? `Central_Dashboard_${safeName}.xlsx`
        : `${safeName}_Dashboard_Export.xlsx`
    } else {
      fileName = status === 1 ? 'Central_Dashboard_Export.xlsx' : 'Stockroom_Dashboard_Export.xlsx'
    }

    if (disposition) {
      const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
      if (utf8Match && utf8Match[1]) {
        try {
          fileName = decodeURIComponent(utf8Match[1].trim())
        } catch {
          fileName = utf8Match[1].trim()
        }
      } else {
        const match = disposition.match(/filename="?([^";]+)"?/i)
        if (match && match[1]) {
          fileName = match[1].trim()
        }
      }
    }

    if (!fileName.toLowerCase().endsWith('.xlsx')) {
      fileName += '.xlsx'
    }

    const objectUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000)
  } finally {
    clearInterval(progressInterval)
  }
}

export const exportService = {
  downloadExcelExport
}

export default exportService
