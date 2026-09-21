export type CatalogPageKind = 'cover' | 'story' | 'products' | 'samples' | 'contact'

export type CatalogSwatch = {
  id: string
  name: string
  color: string
  description: string
}

export type CatalogPage = {
  id: string
  kind: CatalogPageKind
  eyebrow?: string
  title: string
  body?: string
  callout?: string
  bullets?: string[]
  productIds?: string[]
  swatches?: CatalogSwatch[]
}

export type CatalogDocument = {
  id: string
  vendorId: string
  title: string
  subtitle: string
  edition: string
  accent: string
  secondary: string
  pages: CatalogPage[]
}
