import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { buildAuthoredShopGlb, inspectAuthoredShopGlb } from './generate-authored-shop.mjs'

async function source(relative) {
  return readFile(new URL(relative, import.meta.url), 'utf8')
}

test('three distinct production hero shops preserve common semantic anchors', () => {
  for (const variant of ['wholesale', 'packaging', 'studio']) {
    const gltf = inspectAuthoredShopGlb(buildAuthoredShopGlb(variant))
    const names = new Set(gltf.nodes.map((node) => node.name))
    for (const name of ['hotspot_management','hotspot_prices','hotspot_catalog','hotspot_product_0','hotspot_product_1']) {
      assert.ok(names.has(name), `${variant} missing ${name}`)
    }
  }

  const wholesale = inspectAuthoredShopGlb(buildAuthoredShopGlb('wholesale'))
  const packaging = inspectAuthoredShopGlb(buildAuthoredShopGlb('packaging'))
  const studio = inspectAuthoredShopGlb(buildAuthoredShopGlb('studio'))
  assert.ok(wholesale.nodes.some((node) => node.name === 'hero_wholesale_pallet'))
  assert.ok(packaging.nodes.some((node) => node.name === 'hero_pack_cutting_table'))
  assert.ok(studio.nodes.some((node) => node.name === 'hero_studio_swatch_0_0'))
})

test('world selects presentation profile independently from asset and business data', async () => {
  const types = await source('../src/world/types.ts')
  const registry = await source('../src/presentation/assetPresentationRegistry.ts')
  const world = await source('../src/world/demoWorld.ts')

  assert.match(types, /presentationProfileId\?: string/)
  assert.match(registry, /hero-wholesale-v1/)
  assert.match(registry, /hero-packaging-v1/)
  assert.match(registry, /hero-paper-studio-v1/)
  assert.match(registry, /getAssetPresentationProfile/)
  assert.match(world, /models\/hero-wholesale-v1\.glb/)
  assert.match(world, /models\/hero-packaging-v1\.glb/)
  assert.match(world, /models\/hero-paper-studio-v1\.glb/)
})

test('room streaming and procedural detail budgets come from presentation profiles', async () => {
  const renderer = await source('../src/components/RoomRenderer.tsx')
  const registry = await source('../src/presentation/assetPresentationRegistry.ts')

  assert.match(renderer, /getAssetPresentationProfile\(room\)\.lod/)
  assert.match(renderer, /lod\.prefetchRadius/)
  assert.match(renderer, /lod\.revealRadius/)
  assert.match(renderer, /lod\.sleepRadius/)
  assert.match(renderer, /lod\.proceduralWakeRadius/)
  assert.match(renderer, /lod\.proceduralSleepRadius/)
  assert.doesNotMatch(renderer, /FILE_PREFETCH_RADIUS/)
  assert.match(registry, /proceduralWakeRadius: 11\.5/)
  assert.match(registry, /proceduralSleepRadius: 15\.5/)
})

test('production texture pipeline contains a real KTX2 path and offline fallback', async () => {
  const prepare = await source('./prepare-production-textures.mjs')
  const loader = await source('../src/scene/materials/productionAtlas.ts')
  const packageJson = await source('../package.json')

  assert.match(prepare, /toktx/)
  assert.match(prepare, /--encode', 'etc1s'/)
  assert.match(prepare, /--genmipmap/)
  assert.match(loader, /KTX2Loader/)
  assert.match(loader, /market-material-atlas\.ktx2/)
  assert.match(loader, /market-material-atlas\.png/)
  assert.match(packageJson, /generate:production-atlas/)
})

test('hero materials share atlas tiles while hero lights remain shadow-free', async () => {
  const renderer = await source('../src/components/FileRoomRenderer.tsx')
  const art = await source('../src/components/HeroRoomArtDirection.tsx')

  assert.match(renderer, /getProductionAtlasTile/)
  assert.match(renderer, /atlasMaterialTiles/)
  assert.match(renderer, /presentation\.materialBindings/)
  assert.match(art, /loadProductionMaterialAtlas/)
  assert.match(art, /castShadow=\{false\}/)
  assert.match(art, /atlasDressing/)
})

test('production shadow policy keeps small props out of the shadow budget', async () => {
  const registry = await source('../src/presentation/assetPresentationRegistry.ts')
  const renderer = await source('../src/components/FileRoomRenderer.tsx')

  assert.match(registry, /tinyDecorationsCast: false/)
  assert.match(registry, /transparentCast: false/)
  assert.match(renderer, /presentation\.shadow\.tinyDecorationsCast/)
  assert.match(renderer, /presentation\.shadow\.transparentCast/)
})

test('v0.16 package and UI identify the new production release', async () => {
  const packageJson = JSON.parse(await source('../package.json'))
  const hud = await source('../src/components/HUD.tsx')
  assert.equal(packageJson.version, '0.16.0')
  assert.match(hud, /PRODUCTION ART PASS · v0\.16\.0/)
  assert.match(hud, /KTX2 material atlas/)
})
