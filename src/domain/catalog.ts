export type CrawlStatus = 'updated' | 'seed-fallback' | 'fetch-failed'

export type Product = {
  id: string
  name: string
  priceText: string
  numericPrice?: number
  unit: string
  sourceUrl: string
  observedAt: string
  note?: string
  crawlStatus?: CrawlStatus
  crawlError?: string
}

export type Vendor = {
  id: string
  name: string
  shortName: string
  tagline: string
  website: string
  sourceLabel: string
  products: Product[]
}

export type Catalog = {
  title: string
  generatedAt: string
  currency: 'IRR' | 'IRT'
  disclaimer: string
  vendors: Vendor[]
}
