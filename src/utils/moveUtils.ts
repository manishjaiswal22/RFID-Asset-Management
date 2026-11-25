/**
 * Utility functions for normalizing and extracting movement directions ('IN' | 'OUT')
 * from API responses and real-time WebSocket / SignalR JSON payloads.
 */

/**
 * Normalizes any value (string, event, status, action) into 'IN' | 'OUT' | undefined.
 */
export const normalizeMove = (val: unknown): 'IN' | 'OUT' | undefined => {
  if (val === null || val === undefined) return undefined
  if (typeof val === 'string') {
    const s = val.trim().toUpperCase()
    if (
      s === 'OUT' ||
      s.startsWith('OUT') ||
      s === 'ISSUANCE' ||
      s === 'DISPATCH' ||
      s === 'CHECKOUT' ||
      s === 'EXIT'
    ) {
      return 'OUT'
    }
    if (
      s === 'IN' ||
      s.startsWith('IN') ||
      s === 'RECEIVE' ||
      s === 'RECEIPT' ||
      s === 'CHECKIN' ||
      s === 'ENTRY' ||
      s === 'STOCK'
    ) {
      return 'IN'
    }
  }
  return undefined
}

/**
 * Robustly extracts movement direction ('IN' | 'OUT') from any incoming JSON payload,
 * checking root-level properties, nested asset properties, event types, and counter deltas.
 */
export const extractMoveFromJson = (
  data: any,
  existingRow?: { totalOut?: number; totalIn?: number }
): 'IN' | 'OUT' | undefined => {
  if (!data || typeof data !== 'object') return undefined

  // 1. Direct candidate fields on the payload
  const candidates = [
    data.move,
    data.moveType,
    data.movementType,
    data.action,
    data.lastMove,
    data.direction,
    data.status,
    data.asset?.move,
    data.asset?.moveType,
    data.asset?.movementType,
    data.asset?.action,
    data.asset?.direction,
    data.assetDetail?.move,
    data.assetDetail?.moveType,
    data.assetDetail?.action
  ]

  for (const c of candidates) {
    const norm = normalizeMove(c)
    if (norm) return norm
  }

  // 2. Specific eventType inspection (avoid generic matching like 'STOCK' since 'StockroomUpdated' contains 'stock')
  if (typeof data.eventType === 'string') {
    const ev = data.eventType.trim().toUpperCase()
    if (
      ev.includes('OUT') ||
      ev.includes('ISSUANCE') ||
      ev.includes('DISPATCH') ||
      ev.includes('CHECKOUT')
    ) {
      return 'OUT'
    }
    if (
      ev.includes('ASSETIN') ||
      ev.includes('RECEIVE') ||
      ev.includes('RETURN') ||
      ev.includes('CHECKIN')
    ) {
      return 'IN'
    }
  }

  // 3. Counter delta heuristic against previous existing values if available
  if (existingRow) {
    if (typeof data.assetIssuance === 'number' && typeof existingRow.totalOut === 'number') {
      if (data.assetIssuance > existingRow.totalOut) return 'OUT'
      if (data.assetIssuance < existingRow.totalOut) return 'IN'
    }
    if (typeof data.availableAssets === 'number' && typeof existingRow.totalIn === 'number') {
      if (data.availableAssets < existingRow.totalIn) return 'OUT'
      if (data.availableAssets > existingRow.totalIn) return 'IN'
    }
  }

  return undefined
}
