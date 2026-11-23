export interface StockroomMasterSummary {
  totalStockRooms: number
  activeStockRooms: number
  inactiveStockRooms: number
}

export interface StockroomMasterPagination {
  page: number
  pageSize: number
  totalRecords: number
  totalPages: number
}

export interface ApiStockroomMasterRecord {
  stockroomId: number
  stockroomName: string
  stockroomEngineer: string
  stockroomLead: string
  isStatus: number // 1 for Active, 0 for Inactive
  status: 'Active' | 'Inactive'
  createdDate?: string
}

export type StockroomSortField = 'STOCKROOM' | 'ENGINEER' | 'LEAD' | 'STATUS'

export interface GetStockroomsMasterParams {
  page?: number
  pageSize?: number
  sortBy?: StockroomSortField
  sortDesc?: boolean
  search?: string
}

export interface GetStockroomsMasterResponse {
  summary: StockroomMasterSummary
  pagination: StockroomMasterPagination
  rows: ApiStockroomMasterRecord[]
}

export interface CreateStockroomPayload {
  stockroomName: string
  stockroomEngineer: string
  stockroomLead: string
}

export interface UpdateStockroomPayload {
  stockroomName: string
  stockroomEngineer: string
  stockroomLead: string
}

export interface StockroomMutationResponse {
  success: boolean
  message: string
  stockroomId?: number
  isStatus?: number | null
}
