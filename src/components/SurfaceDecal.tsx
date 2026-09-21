import { useMemo } from 'react'
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'
import type { AssetDecalKind } from '../assets/detailProfiles'

const textureCache = new Map<string, CanvasTexture>()

function seeded(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function buildTexture(kind: AssetDecalKind, seed: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  const random = seeded(seed)
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  if (kind === 'smudge') {
    for (let i = 0; i < 20; i += 1) {
      const x = w * (0.16 + random() * 0.68)
      const y = h * (0.2 + random() * 0.58)
      const radius = 9 + random() * 28
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, `rgba(50,43,37,${0.04 + random() * 0.1})`)
      gradient.addColorStop(1, 'rgba(50,43,37,0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.ellipse(x, y, radius, radius * (0.25 + random() * 0.45), (random() - 0.5) * 0.7, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  if (kind === 'scuff') {
    ctx.lineCap = 'round'
    for (let i = 0; i < 15; i += 1) {
      const x = w * (0.12 + random() * 0.7)
      const y = h * (0.3 + random() * 0.38)
      ctx.strokeStyle = `rgba(44,48,49,${0.05 + random() * 0.11})`
      ctx.lineWidth = 0.7 + random() * 2
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.quadraticCurveTo(x + 16 + random() * 40, y + (random() - 0.5) * 12, x + 48 + random() * 70, y + (random() - 0.5) * 18)
      ctx.stroke()
    }
  }

  if (kind === 'fingerprint') {
    ctx.strokeStyle = 'rgba(225,235,233,.13)'
    ctx.lineWidth = 1.2
    for (let ring = 0; ring < 8; ring += 1) {
      ctx.beginPath()
      ctx.ellipse(
        w * 0.5 + (random() - 0.5) * 4,
        h * 0.52 + (random() - 0.5) * 3,
        21 + ring * 4.5,
        12 + ring * 3,
        -0.18,
        Math.PI * 0.12,
        Math.PI * 1.82
      )
      ctx.stroke()
    }
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}

function getTexture(kind: AssetDecalKind, seed: number) {
  const key = `${kind}:${seed}`
  let texture = textureCache.get(key)
  if (!texture) {
    texture = buildTexture(kind, seed)
    textureCache.set(key, texture)
  }
  return texture
}

export default function SurfaceDecal({
  kind,
  seed,
  position,
  rotation,
  size,
  opacity
}: {
  kind: AssetDecalKind
  seed: number
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number]
  opacity: number
}) {
  const texture = useMemo(() => getTexture(kind, seed), [kind, seed])

  return (
    <mesh position={position} rotation={rotation} renderOrder={5}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-3}
        toneMapped={false}
      />
    </mesh>
  )
}

export function getSurfaceDecalCacheStats() {
  return { textures: textureCache.size }
}
