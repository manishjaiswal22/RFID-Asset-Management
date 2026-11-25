export interface StoreAssetRecord {
  id: string
  storeCode: string
  storeName: string
  location: string
  keywords?: string
  totalAssets: number
  totalIn: number // Available Assets: (totalAssets - totalOut)
  totalOut: number // Asset Issuance
  move?: 'IN' | 'OUT' | string
  lastMove?: 'IN' | 'OUT' | string
}

export const DUMMY_STORE_RECORDS: StoreAssetRecord[] = [
  {
    id: 'stock-1',
    storeCode: 'VIZAG-S1',
    storeName: 'IND-AND-VIZAG-S1-1F-NO WING-UI',
    location: '',
    keywords: 'Visakhapatnam Vizag Andhra Pradesh AP UI 1F S1',
    totalAssets: 8420,
    totalOut: 480,
    totalIn: 7940 // 8420 - 480
  },
  {
    id: 'stock-2',
    storeCode: 'DEL-GDC',
    storeName: 'IND-DEL-GDC- NO Tower-3F-AW-U',
    location: '',
    keywords: 'Delhi NCR New Delhi GDC Tower 3F AW U',
    totalAssets: 12850,
    totalOut: 610,
    totalIn: 12240 // 12850 - 610
  },
  {
    id: 'stock-3',
    storeCode: 'DEL-GURG',
    storeName: 'IND-DEL-GURG-CANDOR-6F-NO Wing',
    location: '',
    keywords: 'Gurugram Gurgaon Haryana Delhi NCR Candor TechSpace 6F',
    totalAssets: 9640,
    totalOut: 390,
    totalIn: 9250 // 9640 - 390
  },
  {
    id: 'stock-4',
    storeCode: 'GUJ-AHM',
    storeName: 'IND-Gujarat-Ahmedabad-GIFT City',
    location: '',
    keywords: 'Gujarat Ahmedabad Gandhinagar GIFT City',
    totalAssets: 6780,
    totalOut: 290,
    totalIn: 6490 // 6780 - 290
  },
  {
    id: 'stock-5',
    storeCode: 'HAR-GGN',
    storeName: 'IND-HAR-GGN-Alight Gurugram-T2-GF',
    location: '',
    keywords: 'Haryana Har GGN Gurgaon Gurugram Alight T2 GF',
    totalAssets: 5320,
    totalOut: 210,
    totalIn: 5110 // 5320 - 210
  },
  {
    id: 'stock-6',
    storeCode: 'HAR-BLK',
    storeName: 'IND-HAR-Gurugram- Blackstone -ONYX-2F-NO WING',
    location: '',
    keywords: 'Haryana Har Gurugram Gurgaon Blackstone Onyx 2F',
    totalAssets: 7120,
    totalOut: 310,
    totalIn: 6810 // 7120 - 310
  },
  {
    id: 'stock-7',
    storeCode: 'BLR-KOD-S1',
    storeName: 'IND-KAR-BLR-KOD-S1-GF-NO WING-IV',
    location: '',
    keywords: 'Karnataka Bangalore Bengaluru BLR KOD S1 GF IV',
    totalAssets: 11300,
    totalOut: 530,
    totalIn: 10770 // 11300 - 530
  },
  {
    id: 'stock-8',
    storeCode: 'BLR-KOD-S3',
    storeName: 'IND-KAR-BLR-KOD-S3-GF-NO WING-VI-VS',
    location: '',
    keywords: 'Karnataka Bangalore Bengaluru BLR KOD S3 GF VI VS',
    totalAssets: 4910,
    totalOut: 190,
    totalIn: 4720 // 4910 - 190
  },
  {
    id: 'stock-9',
    storeCode: 'BLR-KOD-S4',
    storeName: 'IND-KAR-BLR-KOD-S4-GF-NO WING-II',
    location: '',
    keywords: 'Karnataka Bangalore Bengaluru BLR KOD S4 GF II',
    totalAssets: 4450,
    totalOut: 180,
    totalIn: 4270 // 4450 - 180
  },
  {
    id: 'stock-10',
    storeCode: 'BLR-KOD-S4-I',
    storeName: 'IND-KAR-BLR-KOD-S4-I-VS',
    location: '',
    keywords: 'Karnataka Bangalore Bengaluru BLR KOD S4 I VS',
    totalAssets: 3850,
    totalOut: 160,
    totalIn: 3690 // 3850 - 160
  }
]
