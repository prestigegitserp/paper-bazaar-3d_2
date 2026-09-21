import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function source(relative) {
  return readFile(new URL(relative, import.meta.url), 'utf8')
}

test('authored generator uses real UV-capable rounded, cylindrical and torus geometries', async () => {
  const generator = await source('./generate-authored-shop.mjs')
  assert.match(generator, /RoundedBoxGeometry/)
  assert.match(generator, /CylinderGeometry/)
  assert.match(generator, /TorusGeometry/)
  assert.match(generator, /TEXCOORD_0/)
  assert.match(generator, /iran-paper-authored-v4\.glb/)
})

test('asset-specific realism details stay in a presentation registry', async () => {
  const profiles = await source('../src/assets/detailProfiles.ts')
  const renderer = await source('../src/components/FileRoomRenderer.tsx')
  const details = await source('../src/components/AuthoredSurfaceDetails.tsx')
  assert.match(profiles, /authored:iran-paper-net:store:v4/)
  assert.match(profiles, /fingerprint/)
  assert.match(profiles, /floor-scuff/)
  assert.match(renderer, /AuthoredSurfaceDetails/)
  assert.match(details, /getAssetDetailProfile/)
})

test('localized wear is depth-tested geometry, not DOM overlay', async () => {
  const decal = await source('../src/components/SurfaceDecal.tsx')
  assert.match(decal, /CanvasTexture/)
  assert.match(decal, /planeGeometry/)
  assert.match(decal, /polygonOffset/)
  assert.doesNotMatch(decal, /Html/)
})

test('procedural retail fixtures have reusable real bevel geometry', async () => {
  const beveled = await source('../src/components/BeveledBox.tsx')
  const counter = await source('../src/scene/retail/fixtures/ShopCounter.tsx')
  const products = await source('../src/scene/retail/fixtures/ProductDisplays.tsx')
  assert.match(beveled, /RoundedBox/)
  assert.match(counter, /BeveledBox/)
  assert.match(products, /BeveledBox/)
})

test('renderer uses AgX highlight rolloff for the realism release', async () => {
  const app = await source('../src/App.tsx')
  assert.match(app, /AgXToneMapping/)
  assert.doesNotMatch(app, /ACESFilmicToneMapping/)
})
