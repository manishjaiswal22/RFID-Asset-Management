import * as signalR from '@microsoft/signalr'
import { authService } from './authService'

export interface GlobalSummaryPayload {
  totalStockRooms: number
  totalTaggedAssets: number
  assetIssuance: number
  availableAssets: number
  serverTime: string
}

export interface StockroomUpdatePayload {
  eventType: string
  stockroomId: number
  stockroomName: string
  totalTaggedAssets: number
  assetIssuance: number
  availableAssets: number
  lastActivityTime: string
  globalSummary: GlobalSummaryPayload
  move?: 'IN' | 'OUT' | string
  lastMove?: 'IN' | 'OUT' | string
  action?: string
}

export interface AssetDetailPayload {
  assetId: number
  assetTag: string
  serialNumber: string
  makeModel: string
  assetType?: string
  subAssetType?: string
  assetState?: string
  serviceRequest?: string
  assetDescription: string
  rfidEpc: string
  move: 'IN' | 'OUT'
  movementDateTime: string
  antenna: string
  readerMac: string
}

export interface StockroomSummaryPayload {
  totalTaggedAssets: number
  assetIssuance: number
  availableAssets: number
}

export interface AssetScannedPayload {
  eventType: string
  stockroomId: number
  stockroomName: string
  asset: AssetDetailPayload
  stockroomSummary: StockroomSummaryPayload
  globalSummary?: GlobalSummaryPayload
  move?: 'IN' | 'OUT' | string
  lastMove?: 'IN' | 'OUT' | string
  action?: string
}

class SignalRService {
  private connection: signalR.HubConnection | null = null
  private isConnecting = false
  private statusListeners: Set<(isConnected: boolean) => void> = new Set()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.info('SignalR: Browser came online, attempting reconnect...')
        if (!this.isConnected()) {
          this.connect().catch(() => {})
        }
      })

      window.addEventListener('offline', () => {
        console.warn('SignalR: Browser went offline.')
        this.notifyStatusChange()
      })
    }
  }

  private notifyStatusChange(): void {
    const connected = this.isConnected()
    this.statusListeners.forEach((cb) => {
      try {
        cb(connected)
      } catch (err) {
        console.error('Error in SignalR status listener', err)
      }
    })
  }

  public isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }

  public onConnectionChange(callback: (isConnected: boolean) => void): () => void {
    this.statusListeners.add(callback)
    callback(this.isConnected())
    return () => {
      this.statusListeners.delete(callback)
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (!this.isConnected() && authService.getToken()) {
        console.info('SignalR: Attempting to reconnect...')
        this.connect().catch(() => {})
      }
    }, 5000)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private getHubUrl(): string {
    const envUrl = (
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      ''
    ).trim()

    if (!envUrl || envUrl === '/' || envUrl === '/api') {
      return '/hubs/dashboard'
    }

    const base = envUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '')
    return `${base}/hubs/dashboard`
  }

  public async connect(): Promise<signalR.HubConnection | null> {
    const token = authService.getToken()
    if (!token) {
      console.warn('SignalR: No auth token found. Skipping connection.')
      this.notifyStatusChange()
      return null
    }

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      this.notifyStatusChange()
      return this.connection
    }

    if (this.isConnecting) {
      return this.connection
    }

    this.isConnecting = true
    this.notifyStatusChange()

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.getHubUrl(), {
          accessTokenFactory: () => authService.getToken() || '',
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.None)
        .build()

      this.connection.onreconnecting((error) => {
        console.warn('SignalR: Reconnecting...', error)
        this.notifyStatusChange()
      })

      this.connection.onreconnected((connectionId) => {
        console.info('SignalR: Reconnected successfully. ConnectionId:', connectionId)
        this.notifyStatusChange()
      })

      this.connection.onclose((error) => {
        console.warn('SignalR: Connection closed.', error)
        this.notifyStatusChange()
        this.scheduleReconnect()
      })

      await this.connection.start()
      this.clearReconnectTimer()
      this.notifyStatusChange()
      return this.connection
    } catch (err) {
      console.error('SignalR: Connection failed to start', err)
      this.notifyStatusChange()
      this.scheduleReconnect()
      return null
    } finally {
      this.isConnecting = false
    }
  }

  public async disconnect(): Promise<void> {
    this.clearReconnectTimer()
    if (this.connection) {
      try {
        await this.connection.stop()
        console.info('SignalR: Disconnected cleanly.')
      } catch (err) {
        console.warn('SignalR: Error during disconnect', err)
      } finally {
        this.connection = null
        this.notifyStatusChange()
      }
    }
  }

  public onStockroomUpdated(callback: (data: StockroomUpdatePayload) => void): () => void {
    if (!this.connection) {
      this.connect().then((conn) => {
        conn?.on('StockroomUpdated', callback)
      })
    } else {
      this.connection.on('StockroomUpdated', callback)
    }

    return () => {
      this.connection?.off('StockroomUpdated', callback)
    }
  }

  public onAssetScanned(callback: (data: AssetScannedPayload) => void): () => void {
    if (!this.connection) {
      this.connect().then((conn) => {
        conn?.on('AssetScanned', callback)
      })
    } else {
      this.connection.on('AssetScanned', callback)
    }

    return () => {
      this.connection?.off('AssetScanned', callback)
    }
  }

  public onDashboardRefreshed(callback: (data: { globalSummary: GlobalSummaryPayload }) => void): () => void {
    if (!this.connection) {
      this.connect().then((conn) => {
        conn?.on('DashboardRefreshed', callback)
      })
    } else {
      this.connection.on('DashboardRefreshed', callback)
    }

    return () => {
      this.connection?.off('DashboardRefreshed', callback)
    }
  }

  public async joinStockroom(stockroomId: number): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinStockroom', stockroomId)
      } catch (err) {
        console.warn(`SignalR: Could not join stockroom_${stockroomId} group`, err)
      }
    }
  }

  public async leaveStockroom(stockroomId: number): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('LeaveStockroom', stockroomId)
      } catch (err) {
        console.warn(`SignalR: Could not leave stockroom_${stockroomId} group`, err)
      }
    }
  }

  public getConnectionState(): signalR.HubConnectionState | 'Disconnected' {
    return this.connection?.state || 'Disconnected'
  }
}

export const signalrService = new SignalRService()
