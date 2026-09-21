import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function source(relative) {
  return readFile(new URL(relative, import.meta.url), 'utf8')
}

test('v0.13 is a fidelity-preserving rebuild on v0.12 contracts', async () => {
  const world = await source('../src/world/demoWorld.ts')
  const renderer = await source('../src/components/RoomRenderer.tsx')
  const fileRenderer = await source('../src/components/FileRoomRenderer.tsx')
  const generator = await source('./generate-authored-shop.mjs')

  assert.match(renderer, /FILE_PREFETCH_RADIUS = 24/)
  assert.match(renderer, /FILE_REVEAL_RADIUS = 18/)
  assert.match(renderer, /import\('\.\/FileRoomRenderer'\)/)
  assert.match(fileRenderer, /InstancedMesh/)
  assert.match(world, /iran-paper-authored-v4\.glb/)
  assert.match(world, /authored:iran-paper-net:store:v4/)
  assert.match(generator, /TEXCOORD_0/)
  assert.match(generator, /RoundedBoxGeometry/)
})

test('static scene no longer regenerates cinematic shadows every frame', async () => {
  const controller = await source('../src/components/StaticShadowController.tsx')
  const mall = await source('../src/components/MallScene.tsx')
  const renderer = await source('../src/components/FileRoomRenderer.tsx')

  assert.match(controller, /shadowMap\.autoUpdate = false/)
  assert.match(controller, /shadowMap\.needsUpdate = true/)
  assert.match(mall, /StaticShadowController/)
  assert.match(renderer, /shadowMap\.needsUpdate = true/)
})

test('repeated architecture is instanced and unused floor subdivision is removed', async () => {
  const architecture = await source('../src/components/Architecture.tsx')

  assert.match(architecture, /<Instances/)
  assert.match(architecture, /<Instance/)
  assert.match(architecture, /planeGeometry args=\{\[16\.55, MARKET_LENGTH\]\}/)
  assert.doesNotMatch(architecture, /16\.55, MARKET_LENGTH, 12, 30/)
  assert.match(architecture, /index % 3 === 0/)
  assert.match(architecture, /intensity=\{13\.5\}/)
})

test('diagnostics and store writes are suppressed when they are not useful', async () => {
  const mall = await source('../src/components/MallScene.tsx')
  const store = await source('../src/store.ts')
  const player = await source('../src/components/PlayerController.tsx')

  assert.match(store, /diagnosticsEnabled/)
  assert.match(mall, /diagnosticsEnabled && <DiagnosticsProbe/)
  assert.match(player, /lastReportedPlayer/)
  assert.match(player, /dx \* dx \+ dz \* dz > 0\.0025/)
})

test('file streaming probe is throttled and sqrt-free', async () => {
  const renderer = await source('../src/components/RoomRenderer.tsx')

  assert.match(renderer, /streamFrame\.current/)
  assert.match(renderer, /% 10/)
  assert.match(renderer, /distanceSq/)
  assert.match(renderer, /FILE_PREFETCH_RADIUS_SQ/)
  assert.doesNotMatch(renderer, /Math\.hypot/)
})

test('raycast optimization preserves structural occlusion', async () => {
  const renderer = await source('../src/components/FileRoomRenderer.tsx')

  assert.match(renderer, /tinyDecorativeBatch/)
  assert.match(renderer, /nonOccludingDecoration/)
  assert.match(renderer, /instanced\.raycast = \(\) => undefined/)
  assert.doesNotMatch(renderer, /if \(!object\.userData\.interaction\) \{\s*object\.raycast/)
})

test('PBR resolution upgrades are adaptive instead of global', async () => {
  const registry = await source('../src/scene/materials/pbrSurfaceRegistry.ts')
  const quality = await source('../src/scene/materials/textureQuality.ts')
  const surface = await source('../src/scene/materials/SurfaceMaterial.tsx')

  assert.match(registry, /type PbrResolution = '1k' \| '2k'/)
  assert.match(registry, /getPbrSurfaceUrls/)
  assert.match(quality, /deviceMemory/)
  assert.match(quality, /hardwareConcurrency/)
  assert.match(quality, /wideEnough/)
  assert.match(surface, /allowHighResolution/)
  assert.match(surface, /preferredPbrResolution/)
})

test('texture decode and GPU upload are scheduled away from the hot path', async () => {
  const cache = await source('../src/scene/materials/pbrTextureCache.ts')
  const uploader = await source('../src/scene/materials/textureUploadScheduler.ts')

  assert.match(cache, /ImageBitmapLoader/)
  assert.match(cache, /loadWithFallback/)
  assert.match(cache, /const detailUrls = getPbrSurfaceUrls\(surface, '1k'\)/)
  assert.match(cache, /loadSharedTexture\(detailUrls\.normal\)/)
  assert.match(cache, /MAX_CONCURRENT_BUILDS = 2/)
  assert.match(uploader, /requestIdleCallback/)
  assert.match(uploader, /renderer\.initTexture/)
  assert.match(uploader, /uploadTail/)
  assert.match(uploader, /uploadTail\s*\.catch/)
  assert.match(uploader, /reject\(error\)/)
})

test('micro material detail uses physically compatible channels', async () => {
  const micro = await source('../src/scene/materials/microDetailTextures.ts')
  const surface = await source('../src/scene/materials/SurfaceMaterial.tsx')
  const renderer = await source('../src/components/FileRoomRenderer.tsx')

  assert.match(micro, /getMicroNormalVariant/)
  assert.match(micro, /getMicroRoughnessVariant/)
  assert.match(surface, /clearcoatNormalMap/)
  assert.match(renderer, /materialName === 'paper'/)
  assert.match(renderer, /materialName === 'cardboard'/)
  assert.match(renderer, /roughnessMap = getMicroRoughnessVariant/)
  assert.doesNotMatch(micro, /https?:\/\//)
})

test('v0.13 keeps progressive startup and lazy catalog behavior from v0.12', async () => {
  const app = await source('../src/App.tsx')
  const environment = await source('../src/components/MaterialEnvironment.tsx')

  assert.match(app, /lazy\(\(\) => import\('\.\/features\/catalog-reader\/CatalogReader'\)\)/)
  assert.match(app, /frameloop=\{started \? 'always' : 'demand'\}/)
  assert.match(environment, /if \(!started\) return/)
})


test('heavy file-backed renderer is code-split from the startup room renderer', async () => {
  const renderer = await source('../src/components/RoomRenderer.tsx')
  const fileRenderer = await source('../src/components/FileRoomRenderer.tsx')
  assert.match(renderer, /lazy\(loadFileRoomModule\)/)
  assert.match(renderer, /import\('\.\/FileRoomRenderer'\)/)
  assert.doesNotMatch(renderer, /MeshPhysicalMaterial/)
  assert.match(fileRenderer, /MeshPhysicalMaterial/)
})


test('interaction raycaster is distance-bounded without losing first-hit occlusion', async () => {
  const player = await source('../src/components/PlayerController.tsx')
  assert.match(player, /RAYCASTER\.far = INTERACTION_DISTANCE/)
  assert.match(player, /intersectObjects\(scene\.children, true\)\[0\]/)
})
