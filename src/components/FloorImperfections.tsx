import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

function seeded(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function createFloorImperfectionTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D unavailable')

  const random = seeded(0x50a77e)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 72; i += 1) {
    const x = random() * canvas.width
    const y = random() * canvas.height
    const rx = 10 + random() * 52
    const ry = 3 + random() * 16
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, rx)
    gradient.addColorStop(0, `rgba(52,56,58,${0.025 + random() * 0.045})`)
    gradient.addColorStop(1, 'rgba(52,56,58,0)')
    ctx.fillStyle = gradient
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((random() - 0.5) * Math.PI)
    ctx.scale(1, ry / rx)
    ctx.beginPath()
    ctx.arc(0, 0, rx, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  ctx.strokeStyle = 'rgba(48,52,53,.055)'
  ctx.lineCap = 'round'
  for (let i = 0; i < 54; i += 1) {
    const x = random() * canvas.width
    const y = random() * canvas.height
    ctx.lineWidth = 0.6 + random() * 1.6
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(
      x + (random() - 0.5) * 80,
      y + (random() - 0.5) * 30,
      x + (random() - 0.5) * 130,
      y + (random() - 0.5) * 45
    )
    ctx.stroke()
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export default function FloorImperfections() {
  const texture = useMemo(() => createFloorImperfectionTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, 0]} renderOrder={3}>
      <planeGeometry args={[16.35, 38.9]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.72}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-2}
        toneMapped={false}
      />
    </mesh>
  )
}
