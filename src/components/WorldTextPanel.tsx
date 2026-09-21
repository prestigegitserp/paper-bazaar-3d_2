import { useEffect, useMemo } from 'react'
import { CanvasTexture, DoubleSide, LinearFilter, SRGBColorSpace } from 'three'

export type WorldTextLine = {
  text: string
  size?: number
  color?: string
  weight?: number
  direction?: 'rtl' | 'ltr'
}

export default function WorldTextPanel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width,
  height,
  lines,
  background = '#202326',
  borderColor = 'rgba(255,255,255,.16)',
  resolutionScale = 1
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  width: number
  height: number
  lines: WorldTextLine[]
  background?: string
  borderColor?: string
  resolutionScale?: number
}) {
  const signature = JSON.stringify(lines)

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    const baseCanvasWidth = width < 0.9 ? 512 : width < 2.2 ? 768 : 1024
    const safeScale = Math.max(0.35, Math.min(1, resolutionScale))
    const canvasWidth = Math.max(256, Math.round(baseCanvasWidth * safeScale))
    const fontScale = canvasWidth / baseCanvasWidth
    canvas.width = canvasWidth
    canvas.height = Math.max(
      Math.max(128, Math.round(192 * safeScale)),
      Math.min(Math.max(256, Math.round(640 * safeScale)), Math.round(canvasWidth * (height / width)))
    )
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')

    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = borderColor
    ctx.lineWidth = Math.max(2, canvas.height * 0.012)
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, canvas.width - ctx.lineWidth, canvas.height - ctx.lineWidth)

    const parsed = JSON.parse(signature) as WorldTextLine[]
    const total = parsed.reduce((sum, line) => sum + (line.size ?? 42) * fontScale, 0)
    const spacing = canvas.height * 0.055
    const contentHeight = total + spacing * Math.max(0, parsed.length - 1)
    let y = (canvas.height - contentHeight) / 2

    for (const line of parsed) {
      const size = (line.size ?? 42) * fontScale
      y += size
      ctx.direction = line.direction ?? 'rtl'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = line.color ?? '#f5f5f3'
      ctx.font = `${line.weight ?? 800} ${size}px Tahoma, Arial, sans-serif`
      ctx.fillText(line.text, canvas.width / 2, y, canvas.width * 0.91)
      y += spacing
    }

    const map = new CanvasTexture(canvas)
    map.colorSpace = SRGBColorSpace
    map.minFilter = LinearFilter
    map.magFilter = LinearFilter
    map.needsUpdate = true
    return map
  }, [background, borderColor, height, resolutionScale, signature, width])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} side={DoubleSide} transparent={false} />
    </mesh>
  )
}
