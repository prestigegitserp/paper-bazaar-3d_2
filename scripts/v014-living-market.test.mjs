import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function source(relative) {
  return readFile(new URL(relative, import.meta.url), 'utf8')
}

test('procedural rooms hibernate behind lightweight storefront proxies', async () => {
  const renderer = await source('../src/components/RoomRenderer.tsx')
  const proxy = await source('../src/components/ProceduralRoomProxy.tsx')
  const presentation = await source('../src/presentation/assetPresentationRegistry.ts')

  assert.match(presentation, /proceduralWakeRadius: 11\.5/)
  assert.match(presentation, /proceduralSleepRadius: 15\.5/)
  assert.match(renderer, /ProceduralRoomProxy/)
  assert.match(renderer, /distanceSq <= wakeRadiusSq/)
  assert.match(renderer, /distanceSq >= sleepRadiusSq/)
  assert.match(renderer, /state\.activeRoomId === room\.id/)
  assert.match(proxy, /WorldTextPanel/)
  assert.doesNotMatch(proxy, /StockWall|ProductPaperStack|LivedInDetails/)
})

test('living-market details are local, cached and interaction-range only', async () => {
  const booth = await source('../src/scene/retail/RetailBooth.tsx')
  const lived = await source('../src/scene/retail/LivedInDetails.tsx')
  const decal = await source('../src/components/SurfaceDecal.tsx')

  assert.match(booth, /LivedInDetails/)
  assert.match(lived, /kind="scuff"/)
  assert.match(lived, /kind="smudge"/)
  assert.match(lived, /kind="fingerprint"/)
  assert.match(lived, /torusGeometry/)
  assert.match(decal, /textureCache/)
  assert.match(decal, /canvas\.width = 256/)
  assert.match(decal, /canvas\.height = 128/)
})

test('real wood PBR assets extend v0.13 progressive texture pipeline', async () => {
  const registry = await source('../src/scene/materials/pbrSurfaceRegistry.ts')
  const material = await source('../src/scene/materials/SurfaceMaterial.tsx')
  const procedural = await source('../src/scene/materials/proceduralSurfaces.ts')

  assert.match(registry, /walnut_veneer/)
  assert.match(registry, /oak_wood_planks/)
  assert.match(registry, /Poly Haven · Walnut Veneer · CC0/)
  assert.match(registry, /Poly Haven · Oak Wood Planks · CC0/)
  assert.match(material, /loadedPbr\?\.roughnessMap \?\? microRoughness/)
  assert.match(procedural, /preset\.kind === 'wood' \? 384/)
  assert.match(procedural, /ctx\.ellipse/)
})

test('every catalog product can be reached through an in-world sample rail', async () => {
  const displays = await source('../src/scene/retail/fixtures/ProductDisplays.tsx')
  const fixtures = await source('../src/scene/retail/RetailFixtures.tsx')
  const booth = await source('../src/scene/retail/RetailBooth.tsx')

  assert.match(displays, /ProductSampleRail/)
  assert.match(displays, /vendor\.products\.slice\(0, 3\)/)
  assert.match(displays, /kind: 'product'/)
  assert.match(fixtures, /ProductSampleRail/)
  assert.match(booth, /<ProductSampleRail room=\{room\} vendor=\{vendor\}/)
})

test('market gameplay tracks exploration, product discovery, samples and favorites', async () => {
  const store = await source('../src/store.ts')
  const hud = await source('../src/components/HUD.tsx')

  assert.match(store, /marketScore/)
  assert.match(store, /exploredInteractionKeys/)
  assert.match(store, /discoveredProductIds/)
  assert.match(store, /sampledProductIds/)
  assert.match(store, /favoriteProductIds/)
  assert.match(store, /collectSample/)
  assert.match(store, /toggleFavoriteProduct/)
  assert.match(hud, /MarketMission/)
  assert.match(hud, /ماموریت بازارگرد/)
  assert.match(hud, /برداشت نمونه کاغذ/)
  assert.match(hud, /ذخیره برای مقایسه/)
})

test('v0.14 keeps v0.13 performance and interaction safety contracts', async () => {
  const app = await source('../src/App.tsx')
  const mall = await source('../src/components/MallScene.tsx')
  const warmup = await source('../src/components/SceneWarmup.tsx')
  const player = await source('../src/components/PlayerController.tsx')

  assert.match(app, /performance=\{\{/)
  assert.match(mall, /AdaptiveDpr/)
  assert.match(warmup, /compileAsync/)
  assert.match(player, /RAYCASTER\.far = INTERACTION_DISTANCE/)
  assert.match(player, /intersectObjects\(scene\.children, true\)\[0\]/)
})
