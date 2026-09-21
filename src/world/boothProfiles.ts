import type { Vec3 } from './types'

export type SurfacePresetId =
  | 'plaster-ivory'
  | 'plaster-cool'
  | 'brick-aged'
  | 'wood-walnut'
  | 'wood-oak'
  | 'metal-charcoal'
  | 'metal-brass'
  | 'terrazzo-warm'
  | 'terrazzo-cool'
  | 'paper-cream'
  | 'paper-white'
  | 'fabric-canvas'
  | 'bazaar-brick'
  | 'bazaar-plaster'
  | 'bazaar-floor'
  | 'bazaar-shutter'
  | 'bazaar-plywood'
  | 'mall-porcelain'
  | 'mall-plaster'
  | 'mall-metal'

export type BoothTemplateId =
  | 'market-counter'
  | 'market-stockroom'
  | 'market-library'
  | 'market-bright'
  | 'market-heritage'
  | 'scan-lab'

export type ShutterMode = 'rolled' | 'half-open' | 'open'

export type BoothProfile = {
  id: string
  template: BoothTemplateId
  surfaces: {
    floor: SurfacePresetId
    wall: SurfacePresetId
    wood: SurfacePresetId
    counter: SurfacePresetId
    metal: SurfacePresetId
  }
  lighting: {
    color: string
    intensity: number
    warmth: 'warm' | 'neutral' | 'cool'
  }
  shopfront: {
    shutter: ShutterMode
    frameColor: string
    signColor: string
    signText: string
    labelColor: string
  }
  layout: {
    desk: Vec3
    board: Vec3
    catalog: Vec3
    products: [Vec3, Vec3]
  }
  features: {
    denseShelves?: boolean
    glassCounter?: boolean
    sampleWall?: boolean
    rollRack?: boolean
    palletStack?: boolean
    bookWall?: boolean
    pegboard?: boolean
    swatchFan?: boolean
    printFrames?: boolean
    cardboardStacks?: boolean
    handwrittenLabels?: boolean
    ceilingFan?: boolean
    calculator?: boolean
    sideDisplay?: boolean
  }
}

const profiles: Record<string, BoothProfile> = {
  'iran-paper-modern': {
    id: 'iran-paper-modern',
    template: 'market-counter',
    surfaces: { floor: 'mall-porcelain', wall: 'mall-plaster', wood: 'bazaar-plywood', counter: 'bazaar-plywood', metal: 'mall-metal' },
    lighting: { color: '#f3f7ef', intensity: 10.5, warmth: 'neutral' },
    shopfront: { shutter: 'rolled', frameColor: '#3d443f', signColor: '#254c49', signText: '#f5eee0', labelColor: '#f0d451' },
    layout: { desk: [0.78, 0, -1.25], board: [-2.5, 2.06, 0.2], catalog: [0.6, 1.18, -1.04], products: [[-0.35, 0, 1.7], [1.55, 0, 1.55]] },
    features: { denseShelves: true, glassCounter: true, sampleWall: true, swatchFan: true, printFrames: true, handwrittenLabels: true, calculator: true, sideDisplay: true }
  },
  'kaghazforoush-stockroom': {
    id: 'kaghazforoush-stockroom',
    template: 'market-stockroom',
    surfaces: { floor: 'mall-porcelain', wall: 'mall-plaster', wood: 'wood-walnut', counter: 'bazaar-plywood', metal: 'mall-metal' },
    lighting: { color: '#fff1cf', intensity: 9.5, warmth: 'warm' },
    shopfront: { shutter: 'half-open', frameColor: '#4b4a43', signColor: '#6b3e2d', signText: '#f5e4c7', labelColor: '#ffd24f' },
    layout: { desk: [0.95, 0, -1.55], board: [-2.5, 2.0, 1.0], catalog: [0.78, 1.18, -1.34], products: [[-0.25, 0, 1.65], [1.4, 0, 1.6]] },
    features: { denseShelves: true, glassCounter: true, palletStack: true, rollRack: true, swatchFan: true, cardboardStacks: true, handwrittenLabels: true, ceilingFan: true, calculator: true }
  },
  'mellat-editorial': {
    id: 'mellat-editorial',
    template: 'market-library',
    surfaces: { floor: 'mall-porcelain', wall: 'mall-plaster', wood: 'wood-walnut', counter: 'bazaar-plywood', metal: 'mall-metal' },
    lighting: { color: '#ffe7c2', intensity: 9.8, warmth: 'warm' },
    shopfront: { shutter: 'rolled', frameColor: '#554a43', signColor: '#61343a', signText: '#f8e9d5', labelColor: '#f3ce56' },
    layout: { desk: [0.42, 0, -1.0], board: [-2.5, 2.05, -1.1], catalog: [0.2, 1.18, -0.82], products: [[-0.55, 0, 1.72], [1.5, 0, 1.72]] },
    features: { denseShelves: true, glassCounter: true, bookWall: true, printFrames: true, swatchFan: true, handwrittenLabels: true, calculator: true, sideDisplay: true }
  },
  'kaghaz20-retail': {
    id: 'kaghaz20-retail',
    template: 'market-bright',
    surfaces: { floor: 'mall-porcelain', wall: 'mall-plaster', wood: 'bazaar-plywood', counter: 'bazaar-plywood', metal: 'mall-metal' },
    lighting: { color: '#edf4ff', intensity: 11.5, warmth: 'cool' },
    shopfront: { shutter: 'open', frameColor: '#444c52', signColor: '#385c78', signText: '#f6f8f9', labelColor: '#f6dc5d' },
    layout: { desk: [0.85, 0, -1.2], board: [-2.5, 2.05, 0.8], catalog: [0.72, 1.18, -1.02], products: [[-0.5, 0, 1.62], [1.55, 0, 1.7]] },
    features: { denseShelves: true, glassCounter: true, pegboard: true, sampleWall: true, swatchFan: true, handwrittenLabels: true, calculator: true, sideDisplay: true }
  },
  'seraj-heritage': {
    id: 'seraj-heritage',
    template: 'market-heritage',
    surfaces: { floor: 'mall-porcelain', wall: 'mall-plaster', wood: 'wood-walnut', counter: 'bazaar-plywood', metal: 'mall-metal' },
    lighting: { color: '#ffd7a3', intensity: 8.8, warmth: 'warm' },
    shopfront: { shutter: 'half-open', frameColor: '#4b433c', signColor: '#705127', signText: '#f5e8cd', labelColor: '#e7c441' },
    layout: { desk: [0.72, 0, -1.48], board: [-2.5, 1.98, 0.65], catalog: [0.58, 1.18, -1.28], products: [[-0.3, 0, 1.67], [1.48, 0, 1.62]] },
    features: { denseShelves: true, glassCounter: true, rollRack: true, palletStack: true, printFrames: true, swatchFan: true, cardboardStacks: true, handwrittenLabels: true, ceilingFan: true, calculator: true }
  },
  'scan-lab': {
    id: 'scan-lab',
    template: 'scan-lab',
    surfaces: { floor: 'mall-porcelain', wall: 'mall-plaster', wood: 'bazaar-plywood', counter: 'bazaar-plywood', metal: 'mall-metal' },
    lighting: { color: '#dff7ff', intensity: 10.5, warmth: 'cool' },
    shopfront: { shutter: 'open', frameColor: '#384447', signColor: '#28484c', signText: '#e6f7f7', labelColor: '#dbe65e' },
    layout: { desk: [0.8, 0, -1.4], board: [-2.5, 2.0, 0], catalog: [0.65, 1.18, -1.2], products: [[-0.4, 0, 1.6], [1.5, 0, 1.6]] },
    features: { glassCounter: true, sideDisplay: true }
  }
}

export function getBoothProfile(profileId?: string) {
  return profiles[profileId ?? ''] ?? profiles['iran-paper-modern']
}

export function hasBoothProfile(profileId: string) {
  return Boolean(profiles[profileId])
}

export const boothProfiles = profiles
