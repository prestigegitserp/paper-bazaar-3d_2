import type { Catalog } from '../../domain/catalog'
import type { CatalogDocument } from '../../domain/document'
import type { WorldDefinition } from '../../world/types'

export type CatalogLoadResult = {
  catalog: Catalog
  mode: 'seed' | 'api'
  error: string | null
}

export interface CatalogRepository {
  load(signal?: AbortSignal): Promise<CatalogLoadResult>
}

export interface WorldRepository {
  load(signal?: AbortSignal): Promise<WorldDefinition>
}

export interface DocumentRepository {
  load(catalog: Catalog, world: WorldDefinition, signal?: AbortSignal): Promise<CatalogDocument[]>
}

export type RuntimeBundle = {
  catalog: Catalog
  catalogMode: 'seed' | 'api'
  catalogError: string | null
  world: WorldDefinition
  documents: CatalogDocument[]
}
