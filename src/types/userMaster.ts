export interface UserSummary {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
}

export interface UserPagination {
  page: number
  pageSize: number
  totalRecords: number
  totalPages: number
}

export interface ApiUserRecord {
  userId: number
  userName: string
  email: string | null
  contactNumber: string | null
  password?: string
  isStatus: number // 1 for Active, 0 for Inactive
  status: 'Active' | 'Inactive'
  userType: 'ADMIN' | 'STOCKROOM'
  stockroomId: number | null
  stockroomName: string | null
  createDate: string
  modifyDate: string | null
}

export type UserSortField =
  | 'USER_NAME'
  | 'EMAIL'
  | 'CONTACT_NUMBER'
  | 'STATUS'
  | 'CREATE_DATE'
  | 'USER_TYPE'

export interface GetUsersParams {
  page?: number
  pageSize?: number
  sortBy?: UserSortField
  sortDesc?: boolean
  search?: string
}

export interface GetUsersResponse {
  summary: UserSummary
  pagination: UserPagination
  rows: ApiUserRecord[]
}

export interface CreateUserPayload {
  userName: string
  password: string
  email: string
  contactNumber: string
  userType: 'ADMIN' | 'STOCKROOM'
  stockroomId?: number | null
}

export interface UpdateUserPayload {
  userName: string
  password: string // Leave empty "" to keep current password
  email: string
  contactNumber: string
  userType: 'ADMIN' | 'STOCKROOM'
  stockroomId?: number | null
}

export interface UserMutationResponse {
  success: boolean
  message: string
  userId?: number
  isStatus?: number | null
}
