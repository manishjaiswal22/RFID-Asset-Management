import { DUMMY_STORE_RECORDS } from '../data/storesData'

// Pre-index dummy store keywords for fast lookup
const dummyKeywordsMap = new Map<string, string>()
DUMMY_STORE_RECORDS.forEach((d) => {
  if (d.keywords) {
    dummyKeywordsMap.set(d.storeName.toLowerCase(), d.keywords)
    dummyKeywordsMap.set(d.id.toLowerCase(), d.keywords)
    if (d.storeCode) {
      dummyKeywordsMap.set(d.storeCode.toLowerCase(), d.keywords)
    }
  }
})

/**
 * Returns rich search keywords and city/state aliases for any stock room name.
 */
export function getStockroomKeywords(name: string, id?: number | string): string {
  const parts: string[] = []
  const nameLower = (name || '').toLowerCase()

  // 1. Direct keywords from predefined store records
  const existing =
    dummyKeywordsMap.get(nameLower) ||
    (id !== undefined ? dummyKeywordsMap.get(String(id).toLowerCase()) : undefined) ||
    (id !== undefined ? dummyKeywordsMap.get(`stock-${id}`.toLowerCase()) : undefined)
  if (existing) {
    parts.push(existing)
  }

  // 2. City, State & Building Aliases
  if (nameLower.includes('blr') || nameLower.includes('kar')) {
    parts.push('karnataka bangalore bengaluru blr')
  }
  if (nameLower.includes('del') || nameLower.includes('gdc') || nameLower.includes('ncr')) {
    parts.push('delhi new delhi ncr gdc')
  }
  if (nameLower.includes('gurg') || nameLower.includes('ggn') || nameLower.includes('har')) {
    parts.push('gurgaon gurugram haryana ggn gurg')
  }
  if (nameLower.includes('vizag') || nameLower.includes('and')) {
    parts.push('visakhapatnam vizag andhra pradesh ap')
  }
  if (nameLower.includes('ahm') || nameLower.includes('guj') || nameLower.includes('gift')) {
    parts.push('ahmedabad gujarat gandhinagar gift city ahm')
  }
  if (nameLower.includes('pun') || nameLower.includes('mah')) {
    parts.push('pune maharashtra pun')
  }
  if (nameLower.includes('hyd') || nameLower.includes('tel')) {
    parts.push('hyderabad telangana hyd')
  }
  if (nameLower.includes('chn') || nameLower.includes('che') || nameLower.includes('tn')) {
    parts.push('chennai tamil nadu chn')
  }
  if (nameLower.includes('kol') || nameLower.includes('wb')) {
    parts.push('kolkata calcutta west bengal kol')
  }
  if (nameLower.includes('mum')) {
    parts.push('mumbai bombay maharashtra mum')
  }
  if (nameLower.includes('sjp')) {
    parts.push('sarjapur sjp')
  }
  if (nameLower.includes('kod')) {
    parts.push('kodathi')
  }
  if (nameLower.includes('candor')) {
    parts.push('candor techspace')
  }
  if (nameLower.includes('podium')) {
    parts.push('podium')
  }
  if (nameLower.includes('wing')) {
    parts.push('wing')
  }

  return parts.join(' ')
}

/**
 * Robust tokenized, normalized, and alias-aware search match
 * Exactly matches Central Dashboard's StoreFilter search behavior.
 */
export function matchStockroomSearch(
  name: string,
  searchQuery: string,
  extraKeywords?: string,
  codeOrId?: string
): boolean {
  if (!searchQuery.trim()) return true

  const rawQuery = searchQuery.trim().toLowerCase()
  const cleanQuery = rawQuery.replace(/[^a-z0-9]/g, '')
  const nameLower = (name || '').toLowerCase()
  const cleanName = nameLower.replace(/[^a-z0-9]/g, '')
  const codeLower = (codeOrId || '').toLowerCase()
  const keywordsLower = (extraKeywords || getStockroomKeywords(name, codeOrId)).toLowerCase()

  // 1. Direct full match (name, cleanName, code, or keywords)
  if (
    nameLower.includes(rawQuery) ||
    (cleanQuery && cleanName.includes(cleanQuery)) ||
    (codeLower && codeLower.includes(rawQuery)) ||
    keywordsLower.includes(rawQuery)
  ) {
    return true
  }

  // 2. Tokenized match: every word/token in the query must match something in the stock room
  const tokens = rawQuery.split(/[\s-]+/).filter(Boolean)
  if (
    tokens.length > 1 &&
    tokens.every((t) => {
      const cleanT = t.replace(/[^a-z0-9]/g, '')
      return (
        nameLower.includes(t) ||
        (cleanT && cleanName.includes(cleanT)) ||
        (codeLower && codeLower.includes(t)) ||
        keywordsLower.includes(t)
      )
    })
  ) {
    return true
  }

  return false
}

/**
 * Filter any list of stock rooms using Central Dashboard's matching logic.
 */
export function filterStockrooms<
  T extends {
    stockroomName?: string
    name?: string
    stockroomId?: number | string
    id?: string
    storeCode?: string
    keywords?: string
  }
>(items: T[], query: string): T[] {
  if (!query.trim()) return items

  return items.filter((item) => {
    const name = item.stockroomName || item.name || ''
    const id = item.stockroomId !== undefined ? item.stockroomId : item.id
    const code = item.storeCode || (id !== undefined ? `SR-${id}` : '')
    const keywords = item.keywords || getStockroomKeywords(name, id)

    return matchStockroomSearch(name, query, keywords, code)
  })
}
