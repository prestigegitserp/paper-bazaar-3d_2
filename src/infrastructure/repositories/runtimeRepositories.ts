import { fetchCatalog } from '../../data/catalog/catalogClient'
import { seedCatalog } from '../../data/catalog/seedCatalog'
import { buildVendorDocuments } from '../../data/documents/buildVendorDocuments'
import { demoWorld } from '../../world/demoWorld'
import type {
  CatalogLoadResult,
  CatalogRepository,
  DocumentRepository,
  RuntimeBundle,
  WorldRepository
} from './contracts'

class ApiFirstCatalogRepository implements CatalogRepository {
  constructor(private readonly staticMode: boolean) {}

  async load(signal?: AbortSignal): Promise<CatalogLoadResult> {
    if (this.staticMode) return { catalog: seedCatalog, mode: 'seed', error: null }

    try {
      const catalog = await fetchCatalog(signal)
      return { catalog, mode: 'api', error: null }
    } catch (error) {
      if (signal?.aborted) throw error
      const message = error instanceof Error ? error.message : 'Catalog API unavailable'
      return { catalog: seedCatalog, mode: 'seed', error: message }
    }
  }
}

class SeedWorldRepository implements WorldRepository {
  async load(_signal?: AbortSignal) {
    return demoWorld
  }
}

class GeneratedDocumentRepository implements DocumentRepository {
  async load(catalog: RuntimeBundle['catalog'], world: RuntimeBundle['world'], _signal?: AbortSignal) {
    return buildVendorDocuments(catalog, world)
  }
}

export async function loadRuntimeBundle(signal?: AbortSignal): Promise<RuntimeBundle> {
  const staticMode = import.meta.env.VITE_STATIC_DEMO === 'true'
  const catalogRepository = new ApiFirstCatalogRepository(staticMode)
  const worldRepository = new SeedWorldRepository()
  const documentRepository = new GeneratedDocumentRepository()

  const [catalogResult, world] = await Promise.all([
    catalogRepository.load(signal),
    worldRepository.load(signal)
  ])

  const documents = await documentRepository.load(catalogResult.catalog, world, signal)

  return {
    catalog: catalogResult.catalog,
    catalogMode: catalogResult.mode,
    catalogError: catalogResult.error,
    world,
    documents
  }
}
