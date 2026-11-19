export type NavMenu = 'central' | 'store' | 'reader-master' | 'store-master' | 'report'

export interface KPICardData {
  title: string
  value: string | number
  unit?: string
  description: string
  change?: string
  isPositive?: boolean
}

export interface RFIDReader {
  id: string
  name: string
  model: string
  ipAddress: string
  zone: string
  antennaCount: number
  status: 'online' | 'offline' | 'calibrating'
  lastSync: string
}

export interface StoreLocation {
  id: string
  code: string
  name: string
  city: string
  totalAssets: number
  activeReaders: number
  manager: string
  status: 'active' | 'maintenance'
}

export interface AuditLog {
  id: string
  time: string
  date: string
  tagId: string
  assetName: string
  storeName: string
  zone: string
  status: 'Verified' | 'Moved' | 'Flagged'
  rssi: string
}

export interface ReportItem {
  id: string
  epc: string
  assetName: string
  category: string
  store: string
  location: string
  lastScanned: string
  status: 'In Stock' | 'Transferred' | 'Audited' | 'Missing'
}
