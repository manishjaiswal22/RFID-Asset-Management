export interface StockroomDashboardParams {
  stockroomId?: number
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDesc?: boolean
  fromDate?: string
  toDate?: string
}

export interface StockroomSummary {
  stockroomId: number | null
  stockroomName: string
  totalTaggedAssets: number
  assetIssuance: number
  availableAssets: number
  serverTime?: string
}

export interface LatestAssetRead {
  assetId: number
  assetTag: string
  serialNumber: string
  makeModel: string
  assetType: string
  subAssetType: string
  assetDescription: string
  stockroomName: string
  assetState: string
  serviceRequest: string
  rfidEpc: string
  move: string
  movementDateTime: string
}

export interface StockroomPagination {
  page: number
  pageSize: number
  totalRecords: number
  totalPages: number
}

export interface StockroomMovementRow {
  assetId: number
  movementDateTime: string
  assetTag: string
  serialNumber: string
  makeModel: string
  assetDescription: string
  assetType: string
  subAssetType: string
  assetState: string
  rfidEpc: string
  move: string
  stockroomName?: string
  serviceRequest?: string
}

export interface StockroomDashboardResponse {
  summary: StockroomSummary
  latestAssetRead: LatestAssetRead | null
  pagination: StockroomPagination
  rows: StockroomMovementRow[]
}
