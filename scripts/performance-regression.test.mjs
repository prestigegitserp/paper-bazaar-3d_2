import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function source(relative) {
  return readFile(new URL(relative, import.meta.url), 'utf8')
}

test('catalog reader is a true interaction-time dynamic import', async () => {
  const app = await source('../src/App.tsx')
  assert.match(app, /lazy\(\(\) => import\('\.\/features\/catalog-reader\/CatalogReader'\)\)/)
  assert.match(app, /documentOpen/)
  assert.match(app, /documentOpen &&/)
})

test('intro rendering defers expensive continuous and shadow work', async () => {
  const app = await source('../src/App.tsx')
  const mall = await source('../src/components/MallScene.tsx')
  const effects = await source('../src/components/ExperienceEffects.tsx')
  const environment = await source('../src/components/MaterialEnvironment.tsx')

  assert.match(app, /frameloop=\{started \? 'always' : 'demand'\}/)
  assert.match(app, /shadows=\{started && quality === 'cinematic'\}/)
  assert.match(mall, /started && <FloorImperfections/)
  assert.match(effects, /started && quality === 'cinematic'/)
  assert.match(environment, /if \(!started\) return/)
})

test('file-backed rooms use distance prefetch and local Suspense fallback', async () => {
  const renderer = await source('../src/components/RoomRenderer.tsx')
  const fileRenderer = await source('../src/components/FileRoomRenderer.tsx')
  assert.match(renderer, /FILE_PREFETCH_RADIUS = 24/)
  assert.match(renderer, /FILE_REVEAL_RADIUS = 18/)
  assert.match(renderer, /import\('\.\/FileRoomRenderer'\)/)
  assert.match(renderer, /preloadFileRoom/)
  assert.match(fileRenderer, /useGLTF\.preload/)
  assert.match(renderer, /Suspense fallback=\{<ProceduralRoomProxy/)
  assert.match(renderer, /useProgressiveFileAsset/)
})

test('authored repeated meshes are batched without touching semantic hotspots', async () => {
  const renderer = await source('../src/components/FileRoomRenderer.tsx')
  assert.match(renderer, /InstancedMesh/)
  assert.match(renderer, /batchStaticAuthoredMeshes/)
  assert.match(renderer, /object\.userData\.interaction/)
  assert.match(renderer, /object\.name\.startsWith\('hotspot_'\)/)
  assert.match(renderer, /meshes\.length < 3/)
})

test('PBR residency is ref-counted and build concurrency is bounded', async () => {
  const cache = await source('../src/scene/materials/pbrTextureCache.ts')
  const material = await source('../src/scene/materials/SurfaceMaterial.tsx')

  assert.match(cache, /MAX_CONCURRENT_BUILDS = 2/)
  assert.match(cache, /variantCache/)
  assert.match(cache, /acquirePbrTextureSet/)
  assert.match(cache, /releasePbrTextureSet/)
  assert.match(material, /requestIdleCallback/)
  assert.match(material, /loadPriority/)
  assert.match(material, /phase === 'full'/)
})

test('v0.12 keeps the v0.11 authored asset and realism pipeline intact', async () => {
  const world = await source('../src/world/demoWorld.ts')
  const generator = await source('./generate-authored-shop.mjs')
  const material = await source('../src/scene/materials/SurfaceMaterial.tsx')

  assert.match(world, /iran-paper-authored-v4\.glb/)
  assert.match(world, /authored:iran-paper-net:store:v4/)
  assert.match(generator, /TEXCOORD_0/)
  assert.match(generator, /RoundedBoxGeometry/)
  assert.match(material, /meshPhysicalMaterial/)
})
