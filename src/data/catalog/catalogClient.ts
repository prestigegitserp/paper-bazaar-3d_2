import type { Catalog } from '../../domain/catalog'

function looksLikeCatalog(value: unknown): value is Catalog {
  if (!value || typeof value !== 'object') return false
  const catalog = value as Partial<Catalog>
  return typeof catalog.title === 'string' && typeof catalog.generatedAt === 'string' && Array.isArray(catalog.vendors)
}

export async function fetchCatalog(signal?: AbortSignal): Promise<Catalog> {
  const response = await fetch('/api/catalog', { signal, headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`Catalog API returned ${response.status}`)
  const payload: unknown = await response.json()
  if (!looksLikeCatalog(payload)) throw new Error('Catalog API returned an invalid payload')
  return payload
}
