import type { SurfacePresetId } from '../world/boothProfiles'
import type { RoomDefinition } from '../world/types'

export type MaterialBindingProfile = {
  surface: SurfacePresetId
  repeat: [number, number]
  normalScale: number
}

export type RoomLodProfile = {
  prefetchRadius: number
  revealRadius: number
  sleepRadius: number
  forceDetailRadius: number
  proceduralWakeRadius: number
  proceduralSleepRadius: number
  viewWakeDot: number
  viewSleepDot: number
}

export type HeroLightProfile = {
  key: { position: [number, number, number]; color: string; intensity: number; angle: number }
  fill: { position: [number, number, number]; color: string; intensity: number; distance: number }
  rim: { position: [number, number, number]; color: string; intensity: number; angle: number }
}

export type AtlasDressing = {
  tile: number
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number]
  emissive?: number
}

export type AssetPresentationProfile = {
  id: string
  lod: RoomLodProfile
  materialBindings: Partial<Record<string, MaterialBindingProfile>>
  hero?: {
    lighting: HeroLightProfile
    atlasDressing: AtlasDressing[]
    environmentIntensity: number
  }
  shadow: {
    tinyDecorationsCast: boolean
    transparentCast: boolean
  }
}

const DEFAULT_LOD: RoomLodProfile = {
  prefetchRadius: 24,
  revealRadius: 18,
  sleepRadius: 22,
  forceDetailRadius: 6.8,
  proceduralWakeRadius: 11.5,
  proceduralSleepRadius: 15.5,
  viewWakeDot: -0.18,
  viewSleepDot: -0.72
}

const authoredMaterials: AssetPresentationProfile['materialBindings'] = {
  floor: { surface: 'mall-porcelain', repeat: [2.8, 4.4], normalScale: 0.24 },
  plaster: { surface: 'mall-plaster', repeat: [3.4, 4.4], normalScale: 0.2 },
  wood: { surface: 'wood-walnut', repeat: [2.2, 2.2], normalScale: 0.22 }
}

const heroWholesale: AssetPresentationProfile = {
  id: 'hero-wholesale-v1',
  lod: { ...DEFAULT_LOD, prefetchRadius: 30, revealRadius: 21, sleepRadius: 25 },
  materialBindings: authoredMaterials,
  hero: {
    environmentIntensity: 0.98,
    lighting: {
      key: { position: [0.5, 3.72, -0.8], color: '#ffdcb0', intensity: 8.8, angle: 0.68 },
      fill: { position: [-1.5, 2.2, 1.8], color: '#b9d8e8', intensity: 2.6, distance: 6 },
      rim: { position: [1.9, 3.2, 2.35], color: '#ffe9c9', intensity: 5.2, angle: 0.62 }
    },
    atlasDressing: [
      { tile: 0, position: [2.48, 2.4, -1.7], rotation: [0, Math.PI / 2, 0], size: [0.52, 0.38] },
      { tile: 2, position: [2.48, 1.72, 1.7], rotation: [0, Math.PI / 2, 0], size: [0.62, 0.42] },
      { tile: 3, position: [-2.53, 2.82, 1.8], rotation: [0, Math.PI / 2, 0], size: [0.6, 0.42] },
      { tile: 9, position: [1.38, 1.26, -0.1], rotation: [-Math.PI / 2, 0, -0.08], size: [0.32, 0.22] }
    ]
  },
  shadow: { tinyDecorationsCast: false, transparentCast: false }
}

const heroPackaging: AssetPresentationProfile = {
  id: 'hero-packaging-v1',
  lod: { ...DEFAULT_LOD, prefetchRadius: 28, revealRadius: 20, sleepRadius: 24 },
  materialBindings: {
    ...authoredMaterials,
    wood: { surface: 'wood-oak', repeat: [2.5, 2.1], normalScale: 0.23 }
  },
  hero: {
    environmentIntensity: 0.9,
    lighting: {
      key: { position: [0.4, 3.65, -1.1], color: '#ffd09c', intensity: 9.3, angle: 0.72 },
      fill: { position: [-1.7, 2.0, 1.6], color: '#c4d7d8', intensity: 2.2, distance: 5.5 },
      rim: { position: [1.7, 3.0, 2.45], color: '#ffba6c', intensity: 5.8, angle: 0.58 }
    },
    atlasDressing: [
      { tile: 2, position: [2.48, 2.25, -1.4], rotation: [0, Math.PI / 2, 0], size: [0.68, 0.46] },
      { tile: 15, position: [2.48, 1.45, 1.55], rotation: [0, Math.PI / 2, 0], size: [0.5, 0.34] },
      { tile: 10, position: [-2.53, 2.55, 1.55], rotation: [0, Math.PI / 2, 0], size: [0.54, 0.38] },
      { tile: 5, position: [1.55, 1.22, -0.25], rotation: [-Math.PI / 2, 0, 0.12], size: [0.3, 0.22] }
    ]
  },
  shadow: { tinyDecorationsCast: false, transparentCast: false }
}

const heroStudio: AssetPresentationProfile = {
  id: 'hero-paper-studio-v1',
  lod: { ...DEFAULT_LOD, prefetchRadius: 28, revealRadius: 20, sleepRadius: 24 },
  materialBindings: {
    ...authoredMaterials,
    wood: { surface: 'wood-oak', repeat: [2.1, 2.4], normalScale: 0.2 }
  },
  hero: {
    environmentIntensity: 1.02,
    lighting: {
      key: { position: [0.2, 3.72, -0.6], color: '#fff0d7', intensity: 7.8, angle: 0.62 },
      fill: { position: [-1.6, 2.3, 1.7], color: '#b7d7ef', intensity: 2.8, distance: 6.5 },
      rim: { position: [1.8, 3.2, 2.2], color: '#c6e6ff', intensity: 4.9, angle: 0.6 }
    },
    atlasDressing: [
      { tile: 0, position: [2.48, 2.6, -1.55], rotation: [0, Math.PI / 2, 0], size: [0.52, 0.4] },
      { tile: 1, position: [2.48, 1.9, 1.5], rotation: [0, Math.PI / 2, 0], size: [0.52, 0.4] },
      { tile: 8, position: [-2.53, 2.8, 1.7], rotation: [0, Math.PI / 2, 0], size: [0.58, 0.42], emissive: 0.16 },
      { tile: 12, position: [1.4, 1.22, -0.18], rotation: [-Math.PI / 2, 0, -0.05], size: [0.31, 0.22] }
    ]
  },
  shadow: { tinyDecorationsCast: false, transparentCast: false }
}

const defaultProfile: AssetPresentationProfile = {
  id: 'default-room-v1',
  lod: DEFAULT_LOD,
  materialBindings: authoredMaterials,
  shadow: { tinyDecorationsCast: false, transparentCast: false }
}

export const assetPresentationRegistry: Record<string, AssetPresentationProfile> = {
  [defaultProfile.id]: defaultProfile,
  [heroWholesale.id]: heroWholesale,
  [heroPackaging.id]: heroPackaging,
  [heroStudio.id]: heroStudio
}

export function getAssetPresentationProfile(room: RoomDefinition): AssetPresentationProfile {
  const id = room.experience?.presentationProfileId
  return id ? assetPresentationRegistry[id] ?? defaultProfile : defaultProfile
}
