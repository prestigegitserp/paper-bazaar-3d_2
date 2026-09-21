import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function source(relative) {
  return readFile(new URL(relative, import.meta.url), 'utf8')
}

test('v0.15 re-hibernates file-backed rooms without evicting the prefetched asset', async () => {
  const renderer = await source('../src/components/RoomRenderer.tsx')

  const presentation = await source('../src/presentation/assetPresentationRegistry.ts')
  assert.match(renderer, /lod\.revealRadius/)
  assert.match(renderer, /lod\.sleepRadius/)
  assert.match(presentation, /revealRadius: 18/)
  assert.match(presentation, /sleepRadius: 22/)
  assert.match(renderer, /setVisible\(false\)/)
  assert.match(renderer, /fileState\.ready && fileState\.visible/)
  assert.match(renderer, /!fileReady \|\| !fileVisible/)
  assert.match(renderer, /ProceduralRoomProxy/)
  assert.match(renderer, /prefetchStarted/)
})

test('procedural detail budget is view-aware while preserving v0.14 distance hysteresis', async () => {
  const renderer = await source('../src/components/RoomRenderer.tsx')

  const presentation = await source('../src/presentation/assetPresentationRegistry.ts')
  assert.match(presentation, /proceduralWakeRadius: 11\.5/)
  assert.match(presentation, /proceduralSleepRadius: 15\.5/)
  assert.match(presentation, /forceDetailRadius: 6\.8/)
  assert.match(renderer, /lod\.viewWakeDot/)
  assert.match(renderer, /lod\.viewSleepDot/)
  assert.match(renderer, /viewDot/)
  assert.match(renderer, /behindProbes/)
})

test('decorative passage glass no longer pays transmission cost', async () => {
  const architecture = await source('../src/components/Architecture.tsx')
  const glassBayStart = architecture.indexOf('function GlassBay')
  const entranceStart = architecture.indexOf('function EntrancePortal')
  const glassBay = architecture.slice(glassBayStart, entranceStart)

  assert.match(glassBay, /meshStandardMaterial/)
  assert.doesNotMatch(glassBay, /transmission=/)
  assert.doesNotMatch(glassBay, /thickness=/)
})

test('interaction scanning is refresh-rate independent and reports raycast pressure', async () => {
  const player = await source('../src/components/PlayerController.tsx')
  const metrics = await source('../src/engine/runtimeMetrics.ts')
  const diagnostics = await source('../src/components/DiagnosticsProbe.tsx')

  assert.match(player, /lastInteractionScanAt/)
  assert.match(player, /scanGap = poseChanged \? 90 : 260/)
  assert.match(player, /hardRefresh/)
  assert.match(player, /noteInteractionRaycast\(\)/)
  assert.doesNotMatch(player, /frameCount\.current % 5/)
  assert.match(metrics, /interactionRaycasts/)
  assert.match(diagnostics, /raycastsPerSecond/)
})

test('inactive interaction halos do zero frame work and nodes subscribe to local active state', async () => {
  const halo = await source('../src/components/InteractionHalo.tsx')
  const node = await source('../src/scene/retail/InteractiveNode.tsx')

  assert.match(halo, /if \(!active\) return null/)
  assert.match(halo, /ActiveInteractionHalo/)
  assert.doesNotMatch(halo, /pointLight/)
  assert.match(node, /interactionKey\(state\.nearby\) === key/)
  assert.doesNotMatch(node, /const nearby = useAppStore/)
})

test('human market actions support quick sample, quote basket and guide flow', async () => {
  const store = await source('../src/store.ts')
  const hud = await source('../src/components/HUD.tsx')
  const player = await source('../src/components/PlayerController.tsx')

  assert.match(store, /quoteItems/)
  assert.match(store, /performQuickAction/)
  assert.match(store, /toggleQuoteProduct/)
  assert.match(hud, /QuoteTray/)
  assert.match(hud, /سبد استعلام چندفروشنده/)
  assert.match(hud, /InteractionPrompt/)
  assert.match(hud, /راهنما:/)
  assert.match(player, /KeyF/)
  assert.match(player, /KeyC/)
  assert.match(hud, /KeyG/)
})

test('authored hero shop v4 adds work props and stays local to the file renderer', async () => {
  const generator = await source('./generate-authored-shop.mjs')
  const world = await source('../src/world/demoWorld.ts')
  const assets = await source('../src/assets/worldAssetRegistry.ts')
  const fileRenderer = await source('../src/components/FileRoomRenderer.tsx')

  assert.match(generator, /TorusGeometry/)
  assert.match(generator, /hero_order_clipboard/)
  assert.match(generator, /hero_scale_base/)
  assert.match(generator, /hero_handtruck_wheel_a/)
  assert.match(generator, /hero_sample_book_/)
  assert.match(generator, /hero-wholesale-v1\.glb/)
  assert.match(world, /hero-wholesale-v1/)
  assert.match(assets, /authored:hero-wholesale:v1/)
  assert.match(fileRenderer, /HeroRoomArtDirection/)
  assert.match(fileRenderer, /presentation\.shadow/)
})

test('dormant storefront text uses a reduced texture budget', async () => {
  const panel = await source('../src/components/WorldTextPanel.tsx')
  const proxy = await source('../src/components/ProceduralRoomProxy.tsx')

  assert.match(panel, /resolutionScale/)
  assert.match(panel, /baseCanvasWidth/)
  assert.match(proxy, /resolutionScale=\{0\.45\}/)
})
