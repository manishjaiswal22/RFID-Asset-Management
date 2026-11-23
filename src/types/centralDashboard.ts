export interface CentralDashboardParams {
  page?: number
  pageSize?: number
  sortBy?: 'TOTAL_TAGGED' | 'ASSET_ISSUANCE' | 'AVAILABLE_ASSETS' | 'STOCKROOM_NAME' | string
  sortDesc?: boolean
  stockroomId?: number
  search?: string
  fromDate?: string
  toDate?: string
}

export interface CentralDashboardSummary {
  totalStockRooms: number
  totalTaggedAssets: number
  assetIssuance: number
  availableAssets: number
  serverTime?: string
}

export interface CentralDashboardPagination {
  page: number
  pageSize: number
  totalRecords: number
  totalPages: number
}

export interface CentralDashboardRow {
  stockroomId: number
  stockroomName: string
  totalTaggedAssets: number
  assetIssuance: number
  availableAssets: number
}

export interface CentralDashboardResponse {
  summary: CentralDashboardSummary
  pagination: CentralDashboardPagination
  rows: CentralDashboardRow[]
}
