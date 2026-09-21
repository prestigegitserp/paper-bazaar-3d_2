import type { SurfacePresetId } from '../../world/boothProfiles'

export type SurfacePhysicalProfile = {
  clearcoat: number
  clearcoatRoughness: number
  envMapIntensity: number
  anisotropy: number
  normalScaleMultiplier: number
}

const defaultProfile: SurfacePhysicalProfile = {
  clearcoat: 0,
  clearcoatRoughness: 0.45,
  envMapIntensity: 0.75,
  anisotropy: 0,
  normalScaleMultiplier: 1
}

const profiles: Partial<Record<SurfacePresetId, Partial<SurfacePhysicalProfile>>> = {
  'mall-porcelain': {
    clearcoat: 0.32,
    clearcoatRoughness: 0.22,
    envMapIntensity: 1.35,
    normalScaleMultiplier: 0.82
  },
  'mall-plaster': {
    clearcoat: 0.03,
    clearcoatRoughness: 0.72,
    envMapIntensity: 0.58,
    normalScaleMultiplier: 0.68
  },
  'mall-metal': {
    clearcoat: 0.16,
    clearcoatRoughness: 0.26,
    envMapIntensity: 1.55,
    anisotropy: 0.42,
    normalScaleMultiplier: 0.8
  },
  'bazaar-plywood': {
    clearcoat: 0.08,
    clearcoatRoughness: 0.58,
    envMapIntensity: 0.82,
    anisotropy: 0.12
  },
  'wood-walnut': {
    clearcoat: 0.1,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.86,
    anisotropy: 0.16
  },
  'wood-oak': {
    clearcoat: 0.1,
    clearcoatRoughness: 0.48,
    envMapIntensity: 0.88,
    anisotropy: 0.16
  },
  'paper-white': {
    envMapIntensity: 0.42,
    normalScaleMultiplier: 0.55
  },
  'paper-cream': {
    envMapIntensity: 0.42,
    normalScaleMultiplier: 0.55
  },
  'bazaar-shutter': {
    clearcoat: 0.08,
    clearcoatRoughness: 0.5,
    envMapIntensity: 1.05,
    normalScaleMultiplier: 0.85
  },
  'bazaar-brick': {
    envMapIntensity: 0.52,
    normalScaleMultiplier: 1.08
  }
}

export function getSurfacePhysicalProfile(id: SurfacePresetId): SurfacePhysicalProfile {
  return { ...defaultProfile, ...profiles[id] }
}
