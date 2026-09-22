import { create } from 'zustand'
import type { Catalog } from './domain/catalog'
import type { CatalogDocument } from './domain/document'
import type { Interaction } from './domain/interaction'
import { seedCatalog } from './data/catalog/seedCatalog'
import { buildVendorDocuments } from './data/documents/buildVendorDocuments'
import type { RuntimeBundle } from './infrastructure/repositories/contracts'
import { demoWorld } from './world/demoWorld'
import type { Vec3, WorldDefinition } from './world/types'

export type RenderQuality = 'cinematic' | 'balanced'
export type InteractionQuickAction = 'primary' | 'sample' | 'quote'

export type NavigationRequest = {
  target: Vec3
  yaw: number
  label: string
}

export type QuoteItem = {
  vendorId: string
  productId: string
}

export type ActionFeedback = {
  id: number
  text: string
  tone: 'info' | 'success'
}

export type Diagnostics = {
  calls: number
  triangles: number
  geometries: number
  textures: number
  fps: number
  frameMs: number
  raycastsPerSecond: number
  occlusionRaycastsPerSecond: number
  interactionTargets: number
  pixelRatio: number
  proxyRooms: number
  detailedRooms: number
  fileRooms: number
}

function preferredQuality(): RenderQuality {
  if (typeof window === 'undefined') return 'cinematic'
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  return coarse || window.innerWidth < 900 || (typeof memory === 'number' && memory <= 4) ? 'balanced' : 'cinematic'
}

function progressKey(interaction: Interaction) {
  if (interaction.kind === 'product') return `product:${interaction.vendorId}:${interaction.productId}`
  if (interaction.kind === 'document') return `document:${interaction.vendorId}:${interaction.documentId}`
  return `${interaction.kind}:${interaction.vendorId}`
}

function interactionScore(interaction: Interaction) {
  if (interaction.kind === 'product') return 15
  if (interaction.kind === 'document') return 20
  return 8
}

let feedbackSequence = 0

function feedback(text: string, tone: ActionFeedback['tone'] = 'success'): ActionFeedback {
  feedbackSequence += 1
  return { id: feedbackSequence, text, tone }
}

type AppState = {
  catalog: Catalog
  catalogMode: 'seed' | 'api'
  catalogError: string | null
  world: WorldDefinition
  documents: CatalogDocument[]
  selected: Interaction | null
  nearby: Interaction | null
  started: boolean
  player: { x: number; z: number }
  quality: RenderQuality
  navigationRequest: NavigationRequest | null
  activeRoomId: string | null
  visitedRoomIds: string[]
  diagnostics: Diagnostics
  diagnosticsEnabled: boolean
  assetErrors: Record<string, string>
  marketScore: number
  exploredInteractionKeys: string[]
  discoveredProductIds: string[]
  sampledProductIds: string[]
  favoriteProductIds: string[]
  quoteItems: QuoteItem[]
  actionFeedback: ActionFeedback | null
  setRuntimeBundle: (bundle: RuntimeBundle) => void
  setCatalog: (catalog: Catalog, mode: 'seed' | 'api') => void
  setCatalogError: (message: string | null) => void
  setSelected: (selected: Interaction | null) => void
  setNearby: (nearby: Interaction | null) => void
  setStarted: (started: boolean) => void
  setPlayer: (x: number, z: number) => void
  setQuality: (quality: RenderQuality) => void
  requestNavigation: (request: NavigationRequest) => void
  clearNavigationRequest: () => void
  setActiveRoom: (roomId: string | null) => void
  setDiagnostics: (diagnostics: Diagnostics) => void
  setDiagnosticsEnabled: (enabled: boolean) => void
  collectSample: (productId: string) => void
  toggleFavoriteProduct: (productId: string) => void
  toggleQuoteProduct: (vendorId: string, productId: string) => void
  clearQuote: () => void
  performQuickAction: (interaction: Interaction, action: InteractionQuickAction) => void
  clearActionFeedback: (id: number) => void
  reportAssetError: (roomId: string, message: string) => void
  clearAssetError: (roomId: string) => void
}

function selectionPatch(state: AppState, selected: Interaction): Partial<AppState> {
  const key = progressKey(selected)
  const newlyExplored = !state.exploredInteractionKeys.includes(key)
  const discoveredProductIds = selected.kind === 'product' && !state.discoveredProductIds.includes(selected.productId)
    ? [...state.discoveredProductIds, selected.productId]
    : state.discoveredProductIds

  return {
    selected,
    exploredInteractionKeys: newlyExplored
      ? [...state.exploredInteractionKeys, key]
      : state.exploredInteractionKeys,
    discoveredProductIds,
    marketScore: state.marketScore + (newlyExplored ? interactionScore(selected) : 0)
  }
}

const initialDocuments = buildVendorDocuments(seedCatalog, demoWorld)

export const useAppStore = create<AppState>((set) => ({
  catalog: seedCatalog,
  catalogMode: 'seed',
  catalogError: null,
  world: demoWorld,
  documents: initialDocuments,
  selected: null,
  nearby: null,
  started: false,
  player: { x: 0, z: 20 },
  quality: preferredQuality(),
  navigationRequest: null,
  activeRoomId: null,
  visitedRoomIds: [],
  diagnostics: {
    calls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    fps: 0,
    frameMs: 0,
    raycastsPerSecond: 0,
    occlusionRaycastsPerSecond: 0,
    interactionTargets: 0,
    pixelRatio: 1,
    proxyRooms: 0,
    detailedRooms: 0,
    fileRooms: 0
  },
  diagnosticsEnabled: false,
  assetErrors: {},
  marketScore: 0,
  exploredInteractionKeys: [],
  discoveredProductIds: [],
  sampledProductIds: [],
  favoriteProductIds: [],
  quoteItems: [],
  actionFeedback: null,
  setRuntimeBundle: (bundle) => set({
    catalog: bundle.catalog,
    catalogMode: bundle.catalogMode,
    catalogError: bundle.catalogError,
    world: bundle.world,
    documents: bundle.documents
  }),
  setCatalog: (catalog, catalogMode) => set((state) => ({
    catalog,
    catalogMode,
    catalogError: null,
    documents: buildVendorDocuments(catalog, state.world)
  })),
  setCatalogError: (catalogError) => set({ catalogError }),
  setSelected: (selected) => set((state) => selected ? selectionPatch(state, selected) : { selected: null }),
  setNearby: (nearby) => set({ nearby }),
  setStarted: (started) => set({ started }),
  setPlayer: (x, z) => set({ player: { x, z } }),
  setQuality: (quality) => set({ quality }),
  requestNavigation: (navigationRequest) => set({ navigationRequest }),
  clearNavigationRequest: () => set({ navigationRequest: null }),
  setActiveRoom: (activeRoomId) => set((state) => {
    const newlyVisited = Boolean(activeRoomId && !state.visitedRoomIds.includes(activeRoomId))
    return {
      activeRoomId,
      visitedRoomIds: newlyVisited && activeRoomId
        ? [...state.visitedRoomIds, activeRoomId]
        : state.visitedRoomIds,
      marketScore: state.marketScore + (newlyVisited ? 10 : 0)
    }
  }),
  setDiagnostics: (diagnostics) => set({ diagnostics }),
  setDiagnosticsEnabled: (diagnosticsEnabled) => set({ diagnosticsEnabled }),
  collectSample: (productId) => set((state) => {
    if (state.sampledProductIds.includes(productId)) {
      return { actionFeedback: feedback('این نمونه قبلاً داخل کیف نمونه است.', 'info') }
    }
    return {
      sampledProductIds: [...state.sampledProductIds, productId],
      marketScore: state.marketScore + 25,
      actionFeedback: feedback('نمونه کاغذ به کیف نمونه اضافه شد.')
    }
  }),
  toggleFavoriteProduct: (productId) => set((state) => {
    const exists = state.favoriteProductIds.includes(productId)
    return {
      favoriteProductIds: exists
        ? state.favoriteProductIds.filter((id) => id !== productId)
        : [...state.favoriteProductIds, productId],
      actionFeedback: feedback(exists ? 'از فهرست مقایسه سریع حذف شد.' : 'برای مقایسه سریع ذخیره شد.', exists ? 'info' : 'success')
    }
  }),
  toggleQuoteProduct: (vendorId, productId) => set((state) => {
    const exists = state.quoteItems.some((item) => item.vendorId === vendorId && item.productId === productId)
    return {
      quoteItems: exists
        ? state.quoteItems.filter((item) => item.vendorId !== vendorId || item.productId !== productId)
        : [...state.quoteItems, { vendorId, productId }],
      marketScore: state.marketScore + (exists ? 0 : 5),
      actionFeedback: feedback(exists ? 'از سبد استعلام حذف شد.' : 'به سبد استعلام قیمت اضافه شد.', exists ? 'info' : 'success')
    }
  }),
  clearQuote: () => set((state) => state.quoteItems.length
    ? { quoteItems: [], actionFeedback: feedback('سبد استعلام پاک شد.', 'info') }
    : {}),
  performQuickAction: (interaction, action) => set((state) => {
    if (action === 'primary' || interaction.kind !== 'product') return selectionPatch(state, interaction)

    if (action === 'sample') {
      if (state.sampledProductIds.includes(interaction.productId)) {
        return { actionFeedback: feedback('این نمونه قبلاً داخل کیف نمونه است.', 'info') }
      }
      return {
        sampledProductIds: [...state.sampledProductIds, interaction.productId],
        marketScore: state.marketScore + 25,
        actionFeedback: feedback(`نمونه «${interaction.label}» برداشته شد.`)
      }
    }

    const exists = state.quoteItems.some((item) => (
      item.vendorId === interaction.vendorId && item.productId === interaction.productId
    ))
    return {
      quoteItems: exists
        ? state.quoteItems.filter((item) => (
            item.vendorId !== interaction.vendorId || item.productId !== interaction.productId
          ))
        : [...state.quoteItems, { vendorId: interaction.vendorId, productId: interaction.productId }],
      marketScore: state.marketScore + (exists ? 0 : 5),
      actionFeedback: feedback(exists ? 'از سبد استعلام حذف شد.' : `«${interaction.label}» به استعلام اضافه شد.`, exists ? 'info' : 'success')
    }
  }),
  clearActionFeedback: (id) => set((state) => state.actionFeedback?.id === id ? { actionFeedback: null } : {}),
  reportAssetError: (roomId, message) => set((state) => ({ assetErrors: { ...state.assetErrors, [roomId]: message } })),
  clearAssetError: (roomId) => set((state) => {
    const next = { ...state.assetErrors }
    delete next[roomId]
    return { assetErrors: next }
  })
}))
