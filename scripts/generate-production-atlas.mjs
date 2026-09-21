import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PNG } from 'pngjs'

const SIZE = 1024
const GRID = 4
const TILE = SIZE / GRID
const targetDir = resolve('public/textures/production')

const tiles = [
  { id: 'paper-white', base: [235, 231, 218], accent: [205, 198, 181], kind: 'fiber' },
  { id: 'paper-cream', base: [224, 211, 184], accent: [190, 168, 127], kind: 'fiber' },
  { id: 'kraft-cardboard', base: [166, 124, 76], accent: [111, 78, 43], kind: 'fiber' },
  { id: 'walnut', base: [112, 71, 43], accent: [55, 31, 20], kind: 'grain' },
  { id: 'oak', base: [171, 132, 84], accent: [98, 67, 36], kind: 'grain' },
  { id: 'brushed-metal', base: [125, 132, 135], accent: [72, 78, 82], kind: 'brush' },
  { id: 'worn-plaster', base: [204, 199, 187], accent: [157, 151, 139], kind: 'blotch' },
  { id: 'floor-stone', base: [141, 139, 132], accent: [88, 91, 88], kind: 'stone' },
  { id: 'green-laminate', base: [45, 78, 73], accent: [24, 46, 44], kind: 'speckle' },
  { id: 'yellow-label', base: [224, 187, 73], accent: [140, 102, 25], kind: 'print' },
  { id: 'red-paint', base: [142, 48, 41], accent: [76, 25, 22], kind: 'speckle' },
  { id: 'blue-paint', base: [47, 82, 111], accent: [22, 46, 66], kind: 'speckle' },
  { id: 'silver', base: [164, 169, 169], accent: [91, 96, 98], kind: 'brush' },
  { id: 'black-rubber', base: [36, 38, 39], accent: [12, 13, 14], kind: 'speckle' },
  { id: 'glass-label', base: [178, 205, 205], accent: [118, 156, 157], kind: 'print' },
  { id: 'packing-tape', base: [194, 157, 84], accent: [118, 82, 35], kind: 'print' }
]

function mulberry32(seed) {
  return () => {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function setPixel(png, x, y, color) {
  const i = (y * SIZE + x) * 4
  png.data[i] = color[0]
  png.data[i + 1] = color[1]
  png.data[i + 2] = color[2]
  png.data[i + 3] = 255
}

function mix(a, b, amount) {
  return [
    clamp(a[0] + (b[0] - a[0]) * amount),
    clamp(a[1] + (b[1] - a[1]) * amount),
    clamp(a[2] + (b[2] - a[2]) * amount)
  ]
}

function tileNoise(kind, lx, ly, random) {
  const nx = lx / TILE
  const ny = ly / TILE
  if (kind === 'fiber') return Math.sin(ny * 280 + Math.sin(nx * 21) * 2) * 0.08 + (random() - 0.5) * 0.08
  if (kind === 'grain') return Math.sin((nx * 18 + Math.sin(ny * 9) * 1.4) * Math.PI) * 0.19 + Math.sin(nx * 54) * 0.045
  if (kind === 'brush') return Math.sin(ny * 520) * 0.08 + (random() - 0.5) * 0.05
  if (kind === 'blotch') return Math.sin(nx * 8 + Math.sin(ny * 7)) * 0.08 + Math.cos(ny * 12) * 0.05 + (random() - 0.5) * 0.06
  if (kind === 'stone') return Math.sin(nx * 17) * Math.cos(ny * 15) * 0.07 + (random() - 0.5) * 0.12
  if (kind === 'print') return ((Math.floor(nx * 12) + Math.floor(ny * 10)) % 7 === 0 ? 0.13 : 0) + (random() - 0.5) * 0.035
  return (random() - 0.5) * 0.11
}

const png = new PNG({ width: SIZE, height: SIZE })
tiles.forEach((tile, index) => {
  const tx = (index % GRID) * TILE
  const ty = Math.floor(index / GRID) * TILE
  const random = mulberry32(0xA11A5 + index * 977)

  for (let y = 0; y < TILE; y += 1) {
    for (let x = 0; x < TILE; x += 1) {
      const amount = 0.18 + tileNoise(tile.kind, x, y, random)
      const edge = Math.min(x, y, TILE - 1 - x, TILE - 1 - y)
      const edgeWear = edge < 4 ? 0.12 : 0
      setPixel(png, tx + x, ty + y, mix(tile.base, tile.accent, amount + edgeWear))
    }
  }

  for (let mark = 0; mark < 18; mark += 1) {
    const cx = tx + Math.floor(random() * TILE)
    const cy = ty + Math.floor(random() * TILE)
    const radius = 2 + Math.floor(random() * 8)
    for (let y = -radius; y <= radius; y += 1) {
      for (let x = -radius; x <= radius; x += 1) {
        if (x * x + y * y > radius * radius) continue
        const px = cx + x
        const py = cy + y
        if (px < tx || px >= tx + TILE || py < ty || py >= ty + TILE) continue
        const fade = 1 - Math.sqrt(x * x + y * y) / radius
        const i = (py * SIZE + px) * 4
        png.data[i] = clamp(png.data[i] * (1 - fade * 0.05))
        png.data[i + 1] = clamp(png.data[i + 1] * (1 - fade * 0.05))
        png.data[i + 2] = clamp(png.data[i + 2] * (1 - fade * 0.05))
      }
    }
  }
})

await mkdir(targetDir, { recursive: true })
await writeFile(resolve(targetDir, 'market-material-atlas.png'), PNG.sync.write(png))
await writeFile(resolve(targetDir, 'market-material-atlas.json'), JSON.stringify({
  version: 1,
  size: SIZE,
  grid: GRID,
  tiles: Object.fromEntries(tiles.map((tile, index) => [
    tile.id,
    { index, column: index % GRID, row: Math.floor(index / GRID), scale: [1 / GRID, 1 / GRID], offset: [(index % GRID) / GRID, 1 - (Math.floor(index / GRID) + 1) / GRID] }
  ]))
}, null, 2))

process.stdout.write(`Generated production atlas ${SIZE}x${SIZE} with ${tiles.length} tiles.\n`)
