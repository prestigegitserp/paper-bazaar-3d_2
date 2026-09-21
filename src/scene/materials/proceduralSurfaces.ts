import {
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture
} from 'three'
import type { SurfacePresetId } from '../../world/boothProfiles'

type PatternKind = 'plaster' | 'wood' | 'brick' | 'terrazzo' | 'paper' | 'metal' | 'fabric'

export type SurfacePreset = {
  id: SurfacePresetId
  kind: PatternKind
  base: string
  detail: string
  roughness: number
  metalness: number
  bumpScale: number
}

const presets: Record<SurfacePresetId, SurfacePreset> = {
  'plaster-ivory': { id: 'plaster-ivory', kind: 'plaster', base: '#d8cdbb', detail: '#a8967c', roughness: 0.94, metalness: 0, bumpScale: 0.022 },
  'plaster-cool': { id: 'plaster-cool', kind: 'plaster', base: '#d6dde0', detail: '#9ba9ae', roughness: 0.92, metalness: 0, bumpScale: 0.02 },
  'brick-aged': { id: 'brick-aged', kind: 'brick', base: '#82523b', detail: '#b77d59', roughness: 0.9, metalness: 0, bumpScale: 0.035 },
  'wood-walnut': { id: 'wood-walnut', kind: 'wood', base: '#66452f', detail: '#2e1d15', roughness: 0.63, metalness: 0.02, bumpScale: 0.026 },
  'wood-oak': { id: 'wood-oak', kind: 'wood', base: '#b58a5c', detail: '#745334', roughness: 0.58, metalness: 0.01, bumpScale: 0.024 },
  'metal-charcoal': { id: 'metal-charcoal', kind: 'metal', base: '#353a3e', detail: '#92999e', roughness: 0.34, metalness: 0.78, bumpScale: 0.008 },
  'metal-brass': { id: 'metal-brass', kind: 'metal', base: '#9f7741', detail: '#e5bd71', roughness: 0.3, metalness: 0.86, bumpScale: 0.006 },
  'terrazzo-warm': { id: 'terrazzo-warm', kind: 'terrazzo', base: '#a9947d', detail: '#55483e', roughness: 0.76, metalness: 0.04, bumpScale: 0.018 },
  'terrazzo-cool': { id: 'terrazzo-cool', kind: 'terrazzo', base: '#909a9e', detail: '#3f4a50', roughness: 0.72, metalness: 0.05, bumpScale: 0.016 },
  'paper-cream': { id: 'paper-cream', kind: 'paper', base: '#f0e8d8', detail: '#b9aa8f', roughness: 0.96, metalness: 0, bumpScale: 0.012 },
  'paper-white': { id: 'paper-white', kind: 'paper', base: '#f5f6f3', detail: '#c8ccc7', roughness: 0.94, metalness: 0, bumpScale: 0.01 },
  'fabric-canvas': { id: 'fabric-canvas', kind: 'fabric', base: '#b99a72', detail: '#665039', roughness: 0.98, metalness: 0, bumpScale: 0.026 },
  'bazaar-brick': { id: 'bazaar-brick', kind: 'brick', base: '#875a3d', detail: '#c18a61', roughness: 0.9, metalness: 0, bumpScale: 0.038 },
  'bazaar-plaster': { id: 'bazaar-plaster', kind: 'plaster', base: '#c9c0ae', detail: '#7e7364', roughness: 0.94, metalness: 0, bumpScale: 0.03 },
  'bazaar-floor': { id: 'bazaar-floor', kind: 'terrazzo', base: '#706c63', detail: '#282b2a', roughness: 0.78, metalness: 0.02, bumpScale: 0.024 },
  'bazaar-shutter': { id: 'bazaar-shutter', kind: 'metal', base: '#777b78', detail: '#323632', roughness: 0.68, metalness: 0.62, bumpScale: 0.018 },
  'bazaar-plywood': { id: 'bazaar-plywood', kind: 'wood', base: '#9a744d', detail: '#4f351f', roughness: 0.64, metalness: 0.01, bumpScale: 0.023 },
  'mall-porcelain': { id: 'mall-porcelain', kind: 'terrazzo', base: '#d8d8d4', detail: '#9fa3a3', roughness: 0.28, metalness: 0.03, bumpScale: 0.006 },
  'mall-plaster': { id: 'mall-plaster', kind: 'plaster', base: '#ecece8', detail: '#c7c9c6', roughness: 0.64, metalness: 0, bumpScale: 0.008 },
  'mall-metal': { id: 'mall-metal', kind: 'metal', base: '#34393d', detail: '#98a0a4', roughness: 0.3, metalness: 0.82, bumpScale: 0.005 }
}

const cache = new Map<SurfacePresetId, { map: CanvasTexture; bump: CanvasTexture }>()
const variantCache = new Map<string, { map: Texture; bump: Texture }>()

function seeded(seed: number) {
  let state = seed >>> 0
  return () => {
    state = Math.imul(1664525, state) + 1013904223 >>> 0
    return state / 4294967296
  }
}

function hexRgb(hex: string) {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255] as const
}

function blend(a: readonly number[], b: readonly number[], t: number) {
  return a.map((value, index) => Math.round(value + (b[index] - value) * t)) as [number, number, number]
}

function createCanvasTexture(preset: SurfacePreset, bumpOnly: boolean) {
  const size = preset.kind === 'wood' ? 384 : preset.kind === 'paper' ? 320 : 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('Canvas 2D is not available')

  const base = hexRgb(preset.base)
  const detail = hexRgb(preset.detail)
  const random = seeded([...preset.id].reduce((sum, char) => sum + char.charCodeAt(0) * 17, 97))

  const fill = (rgb: readonly number[]) => `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`
  ctx.fillStyle = bumpOnly ? '#808080' : fill(base)
  ctx.fillRect(0, 0, size, size)

  if (preset.kind === 'plaster') {
    for (let i = 0; i < 18; i += 1) {
      const x = random() * size
      const y = random() * size
      const radius = size * (0.06 + random() * 0.16)
      const shade = bumpOnly
        ? 118 + Math.round(random() * 24)
        : blend(base, detail, 0.035 + random() * 0.07)
      ctx.fillStyle = bumpOnly ? `rgb(${shade} ${shade} ${shade})` : fill(shade as readonly number[])
      ctx.globalAlpha = 0.035 + random() * 0.04
      ctx.beginPath()
      ctx.ellipse(x, y, radius * 1.5, radius, random() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }

    for (let i = 0; i < 850; i += 1) {
      const t = random() * 0.28
      const shade = bumpOnly ? Math.round(108 + random() * 45) : blend(base, detail, t)
      ctx.fillStyle = bumpOnly ? `rgb(${shade} ${shade} ${shade})` : fill(shade as readonly number[])
      ctx.globalAlpha = 0.08 + random() * 0.08
      ctx.beginPath()
      ctx.arc(random() * size, random() * size, 0.5 + random() * 2.8, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  if (preset.kind === 'wood') {
    for (let y = 0; y < size; y += 2) {
      const wave = (Math.sin(y * 0.18) + Math.sin(y * 0.047)) * 0.08
      const t = 0.16 + wave + random() * 0.14
      const shade = bumpOnly ? Math.round(105 + t * 70) : blend(base, detail, Math.max(0, Math.min(1, t)))
      ctx.strokeStyle = bumpOnly ? `rgb(${shade} ${shade} ${shade})` : fill(shade as readonly number[])
      ctx.globalAlpha = 0.45
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, y + Math.sin(y) * 1.5)
      ctx.bezierCurveTo(64, y + random() * 6, 180, y - random() * 5, size, y + Math.sin(y * 0.1) * 2)
      ctx.stroke()
    }

    for (let i = 0; i < 7; i += 1) {
      const x = random() * size
      const y = random() * size
      const radiusX = 10 + random() * 30
      const radiusY = 3 + random() * 10
      const shade = bumpOnly ? 98 + Math.round(random() * 28) : blend(base, detail, 0.22 + random() * 0.16)
      ctx.strokeStyle = bumpOnly ? `rgb(${shade} ${shade} ${shade})` : fill(shade as readonly number[])
      ctx.globalAlpha = 0.18 + random() * 0.16
      ctx.lineWidth = 1 + random() * 2
      ctx.beginPath()
      ctx.ellipse(x, y, radiusX, radiusY, random() * Math.PI, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  if (preset.kind === 'brick') {
    const brickW = 58
    const brickH = 26
    ctx.lineWidth = 3
    for (let row = -1; row < 12; row += 1) {
      const offset = row % 2 ? -brickW / 2 : 0
      for (let col = -1; col < 7; col += 1) {
        const x = col * brickW + offset
        const y = row * brickH
        const t = 0.1 + random() * 0.22
        const shade = bumpOnly ? Math.round(128 + random() * 28) : blend(base, detail, t)
        ctx.fillStyle = bumpOnly ? `rgb(${shade} ${shade} ${shade})` : fill(shade as readonly number[])
        ctx.fillRect(x + 2, y + 2, brickW - 4, brickH - 4)
        ctx.strokeStyle = bumpOnly ? '#686868' : '#b9a68f'
        ctx.globalAlpha = 0.5
        ctx.strokeRect(x + 1, y + 1, brickW - 2, brickH - 2)
      }
    }
  }

  if (preset.kind === 'terrazzo') {
    for (let i = 0; i < 520; i += 1) {
      const radius = 0.8 + random() * 3.6
      const shade = bumpOnly ? Math.round(95 + random() * 85) : blend(base, detail, random() * 0.8)
      ctx.fillStyle = bumpOnly ? `rgb(${shade} ${shade} ${shade})` : fill(shade as readonly number[])
      ctx.globalAlpha = 0.24 + random() * 0.5
      ctx.beginPath()
      ctx.ellipse(random() * size, random() * size, radius * 1.5, radius, random() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  if (preset.kind === 'paper') {
    ctx.globalAlpha = 0.28
    for (let i = 0; i < 260; i += 1) {
      const shade = bumpOnly ? 125 + Math.round(random() * 26) : 0
      ctx.strokeStyle = bumpOnly ? `rgb(${shade} ${shade} ${shade})` : fill(blend(base, detail, 0.08 + random() * 0.1))
      ctx.lineWidth = 0.35 + random() * 0.55
      const x = random() * size
      const y = random() * size
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + 7 + random() * 25, y + (random() - 0.5) * 2.2)
      ctx.stroke()
    }
  }

  if (preset.kind === 'metal') {
    for (let y = 0; y < size; y += 1) {
      const value = 102 + Math.round(Math.sin(y * 0.42) * 10 + random() * 18)
      ctx.strokeStyle = bumpOnly
        ? `rgb(${value} ${value} ${value})`
        : fill(blend(base, detail, 0.08 + random() * 0.18))
      ctx.globalAlpha = 0.28
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(size, y)
      ctx.stroke()
    }

    ctx.globalAlpha = 0.16
    for (let i = 0; i < 28; i += 1) {
      const y = random() * size
      const x = random() * size
      const length = 8 + random() * 64
      ctx.strokeStyle = bumpOnly ? '#a0a0a0' : 'rgba(220,225,226,.38)'
      ctx.lineWidth = 0.35 + random() * 0.8
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(Math.min(size, x + length), y + (random() - 0.5) * 2)
      ctx.stroke()
    }
  }

  if (preset.kind === 'fabric') {
    ctx.globalAlpha = 0.35
    for (let i = 0; i < size; i += 4) {
      const shade = bumpOnly ? '#969696' : fill(blend(base, detail, 0.18))
      ctx.strokeStyle = shade
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(size, i)
      ctx.stroke()
    }
  }

  ctx.globalAlpha = 1
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  if (!bumpOnly) texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export function getSurfacePreset(id: SurfacePresetId) {
  return presets[id]
}

export function getSurfaceTextures(id: SurfacePresetId): { map: Texture; bump: Texture } {
  let cached = cache.get(id)
  if (!cached) {
    const preset = presets[id]
    cached = {
      map: createCanvasTexture(preset, false),
      bump: createCanvasTexture(preset, true)
    }
    cache.set(id, cached)
  }
  return cached
}


export function getSurfaceTextureVariant(
  id: SurfacePresetId,
  repeat: [number, number],
  anisotropy: number
): { map: Texture; bump: Texture } {
  const key = `${id}|${repeat[0].toFixed(3)}|${repeat[1].toFixed(3)}|${anisotropy.toFixed(2)}`
  let variant = variantCache.get(key)

  if (!variant) {
    const source = getSurfaceTextures(id)
    const map = source.map.clone()
    const bump = source.bump.clone()

    for (const texture of [map, bump]) {
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
      texture.repeat.set(repeat[0], repeat[1])
      texture.anisotropy = anisotropy
      texture.needsUpdate = true
    }

    variant = { map, bump }
    variantCache.set(key, variant)
  }

  return variant
}

export function getProceduralResidencyStats() {
  return {
    sourceSurfaces: cache.size,
    variants: variantCache.size
  }
}
