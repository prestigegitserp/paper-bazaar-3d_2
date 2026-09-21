import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const worldFiles = [
  '../src/components/Architecture.tsx',
  '../src/components/RoomRenderer.tsx',
  '../src/components/FileRoomRenderer.tsx',
  '../src/scene/retail/RetailShell.tsx',
  '../src/scene/retail/fixtures/StockWall.tsx',
  '../src/scene/retail/fixtures/ProductDisplays.tsx',
  '../src/scene/retail/fixtures/ShopCounter.tsx',
  '../src/scene/retail/fixtures/MarketProps.tsx'
]

test('3D world text is geometry-backed, never Drei Html/DOM overlay', async () => {
  for (const relative of worldFiles) {
    const source = await readFile(new URL(relative, import.meta.url), 'utf8')
    assert.equal(/<Html(?:\s|>)/.test(source), false, `${relative} must not render Drei Html inside the 3D world`)
    assert.equal(/\bHtml\b[^\n]*@react-three\/drei/.test(source), false, `${relative} must not import Drei Html`)
    assert.equal(/RoomScopedHtml/.test(source), false, `${relative} must not depend on DOM world labels`)
  }
})

test('physical world text uses depth-tested CanvasTexture panels', async () => {
  const source = await readFile(new URL('../src/components/WorldTextPanel.tsx', import.meta.url), 'utf8')
  assert.match(source, /CanvasTexture/)
  assert.match(source, /planeGeometry/)
  assert.match(source, /meshBasicMaterial/)
})
