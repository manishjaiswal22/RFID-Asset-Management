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
}

export interface AssetDetailPayload {
  assetId: number
  assetTag: string
  serialNumber: string
  makeModel: string
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
}

class SignalRService {
  private connection: signalR.HubConnection | null = null
  private isConnecting = false

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
      return null
    }

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return this.connection
    }

    if (this.isConnecting) {
      return this.connection
    }

    this.isConnecting = true

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.getHubUrl(), {
          accessTokenFactory: () => authService.getToken() || '',
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build()

      this.connection.onreconnecting((error) => {
        console.warn('SignalR: Reconnecting...', error)
      })

      this.connection.onreconnected((connectionId) => {
        console.info('SignalR: Reconnected successfully. ConnectionId:', connectionId)
      })

      this.connection.onclose((error) => {
        console.warn('SignalR: Connection closed.', error)
      })

      await this.connection.start()
      console.info('SignalR: Connected to Dashboard Hub successfully.')
      return this.connection
    } catch (err) {
      console.error('SignalR: Connection failed to start', err)
      return null
    } finally {
      this.isConnecting = false
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop()
        console.info('SignalR: Disconnected cleanly.')
      } catch (err) {
        console.warn('SignalR: Error during disconnect', err)
      } finally {
        this.connection = null
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
