import {
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture
} from 'three'
import type { SurfacePresetId } from '../../world/boothProfiles'
import { getSurfacePreset } from './proceduralSurfaces'

type DetailKind = 'albedo' | 'bump' | 'normal' | 'roughness'

const baseCache = new Map<string, CanvasTexture>()
const variantCache = new Map<string, Texture>()

function seeded(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function surfaceSeed(surface: SurfacePresetId) {
  let hash = 2166136261
  for (const char of surface) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function heightField(surface: SurfacePresetId, size: number) {
  const preset = getSurfacePreset(surface)
  const random = seeded(surfaceSeed(surface))
  const heights = new Float32Array(size * size)

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const grain = (random() - 0.5) * 0.55
      const directional = preset.kind === 'wood'
        ? Math.sin(y * 0.72 + Math.sin(x * 0.055) * 2.3) * 0.25
        : preset.kind === 'paper'
          ? Math.sin(x * 0.55 + y * 0.055) * 0.08
          : preset.kind === 'metal'
            ? Math.sin(y * 1.55) * 0.05
            : 0
      const mineral = preset.kind === 'plaster' || preset.kind === 'terrazzo'
        ? Math.sin(x * 0.19) * Math.sin(y * 0.13) * 0.12
        : 0
      heights[y * size + x] = grain + directional + mineral
    }
  }

  return heights
}

function buildBase(surface: SurfacePresetId, kind: DetailKind) {
  const key = `${surface}|${kind}`
  const cached = baseCache.get(key)
  if (cached) return cached

  const size = 128
  const heights = heightField(surface, size)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('Canvas 2D unavailable')

  const image = ctx.createImageData(size, size)
  const data = image.data

  const sample = (x: number, y: number) => heights[((y + size) % size) * size + ((x + size) % size)]

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4
      const h = sample(x, y)

      if (kind === 'normal') {
        const dx = (sample(x - 1, y) - sample(x + 1, y)) * 0.42
        const dy = (sample(x, y - 1) - sample(x, y + 1)) * 0.42
        const inv = 1 / Math.hypot(dx, dy, 1)
        data[i] = Math.round((dx * inv * 0.5 + 0.5) * 255)
        data[i + 1] = Math.round((dy * inv * 0.5 + 0.5) * 255)
        data[i + 2] = Math.round((inv * 0.5 + 0.5) * 255)
      } else {
        const base = kind === 'roughness' ? 206 : kind === 'albedo' ? 244 : 128
        const strength = kind === 'roughness' ? 24 : kind === 'albedo' ? 9 : 42
        const value = Math.max(0, Math.min(255, Math.round(base + h * strength)))
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
      }
      data[i + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  if (kind === 'albedo') texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  baseCache.set(key, texture)
  return texture
}

function density(surface: SurfacePresetId) {
  const kind = getSurfacePreset(surface).kind
  if (kind === 'paper') return 12
  if (kind === 'wood') return 8
  if (kind === 'metal') return 10
  return 6
}

function variant(
  surface: SurfacePresetId,
  kind: DetailKind,
  repeat: [number, number],
  anisotropy: number
) {
  const key = [surface, kind, repeat[0], repeat[1], anisotropy].join('|')
  let texture = variantCache.get(key)
  if (texture) return texture

  texture = buildBase(surface, kind).clone()
  const d = density(surface)
  texture.repeat.set(repeat[0] * d, repeat[1] * d)
  texture.anisotropy = anisotropy
  texture.needsUpdate = true
  variantCache.set(key, texture)
  return texture
}

export function getMicroAlbedoVariant(
  surface: SurfacePresetId,
  repeat: [number, number],
  anisotropy: number
) {
  return variant(surface, 'albedo', repeat, anisotropy)
}

export function getMicroBumpVariant(
  surface: SurfacePresetId,
  repeat: [number, number],
  anisotropy: number
) {
  return variant(surface, 'bump', repeat, anisotropy)
}

export function getMicroNormalVariant(
  surface: SurfacePresetId,
  repeat: [number, number],
  anisotropy: number
) {
  return variant(surface, 'normal', repeat, anisotropy)
}

export function getMicroRoughnessVariant(
  surface: SurfacePresetId,
  repeat: [number, number],
  anisotropy: number
) {
  return variant(surface, 'roughness', repeat, anisotropy)
}

export function getMicroBumpScale(surface: SurfacePresetId) {
  if (surface === 'mall-porcelain') return 0.0015
  if (surface === 'mall-plaster') return 0.005
  if (surface === 'bazaar-plywood' || surface.startsWith('wood-')) return 0.0045
  if (surface.startsWith('paper-')) return 0.0021
  if (surface.includes('metal') || surface === 'bazaar-shutter') return 0.0011
  if (surface.includes('brick')) return 0.007
  return 0.0035
}

export function getMicroNormalScale(surface: SurfacePresetId) {
  if (surface === 'mall-porcelain') return 0.085
  if (surface === 'bazaar-plywood' || surface.startsWith('wood-')) return 0.12
  if (surface.includes('metal')) return 0.08
  return 0.06
}
