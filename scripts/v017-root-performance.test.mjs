import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { buildAuthoredShopGlb, inspectAuthoredShopGlb } from './generate-authored-shop.mjs'

async function source(relative) {
  return readFile(new URL(relative, import.meta.url), 'utf8')
}

test('v0.17 renders only on demand with an explicit motion frame budget', async () => {
  const app = await source('../src/App.tsx')
  const player = await source('../src/components/PlayerController.tsx')
  const mall = await source('../src/components/MallScene.tsx')
  const effects = await source('../src/components/ExperienceEffects.tsx')

  assert.match(app, /frameloop="demand"/)
  assert.match(app, /\[0\.82, 1\.28\]/)
  assert.match(app, /\[0\.62, 1\.0\]/)
  assert.match(player, /requestBudgetedFrame/)
  assert.match(player, /quality === 'cinematic' \? 1000 \/ 60 : 1000 \/ 45/)
  assert.match(player, /window\.setTimeout/)
  assert.match(mall, /<AdaptiveDpr/)
  assert.doesNotMatch(effects, /AdaptiveDpr|SoftShadows/)
})

test('v0.17 removes corridor real-time light fan-out and full-floor overdraw', async () => {
  const architecture = await source('../src/components/Architecture.tsx')
  const mall = await source('../src/components/MallScene.tsx')

  assert.doesNotMatch(architecture, /pointLight/)
  assert.doesNotMatch(architecture, /spotLight/)
  assert.match(architecture, /emissiveIntensity=\{4\.1\}/)
  assert.doesNotMatch(mall, /FloorImperfections/)
  assert.match(mall, /shadow-mapSize=\{\[1024, 1024\]\}/)
})

test('v0.17 is standard-first and reserves physical transmission for hero glass', async () => {
  const surface = await source('../src/scene/materials/SurfaceMaterial.tsx')
  const file = await source('../src/components/FileRoomRenderer.tsx')

  assert.match(surface, /meshStandardMaterial/)
  assert.doesNotMatch(surface, /meshPhysicalMaterial/)
  assert.match(surface, /performanceCurrent > 0\.97/)
  assert.match(file, /material\.name === 'glass' && quality === 'cinematic'/)
  assert.match(file, /new MeshPhysicalMaterial/)
  assert.match(file, /new MeshStandardMaterial/)
  assert.match(file, /performanceCurrent < 0\.97/)
})

test('v0.17 interaction engine uses a compact target broadphase before exact occlusion', async () => {
  const registry = await source('../src/engine/interactionTargets.ts')
  const player = await source('../src/components/PlayerController.tsx')
  const node = await source('../src/scene/retail/InteractiveNode.tsx')
  const file = await source('../src/components/FileRoomRenderer.tsx')

  assert.match(registry, /const targets = new Set<Object3D>/)
  assert.match(player, /getInteractionTargets\(\)/)
  assert.match(player, /intersectObjects\(targets, true\)/)
  assert.match(player, /noteInteractionOcclusionRaycast\(\)/)
  assert.match(player, /intersectObjects\(scene\.children, true\)\[0\]/)
  assert.doesNotMatch(node, /onPointerOver|onClick=/)
  assert.doesNotMatch(file, /onPointerOver|ThreeEvent/)
})

test('v0.17 halves per-room residency callbacks without losing hysteresis', async () => {
  const renderer = await source('../src/components/RoomRenderer.tsx')
  const presentation = await source('../src/presentation/assetPresentationRegistry.ts')

  assert.match(renderer, /function useRoomRuntime/)
  assert.equal((renderer.match(/useFrame\(/g) ?? []).length, 1)
  assert.doesNotMatch(renderer, /useProgressiveFileAsset|useProceduralDetail/)
  assert.match(renderer, /frame\.current % 10/)
  assert.match(renderer, /frame\.current % 12/)
  assert.match(presentation, /proceduralWakeRadius: 11\.5/)
  assert.match(presentation, /proceduralSleepRadius: 15\.5/)
})

test('v0.17 moves PMREM and shader compilation before interaction-time movement', async () => {
  const environment = await source('../src/components/MaterialEnvironment.tsx')
  const warmup = await source('../src/components/SceneWarmup.tsx')

  assert.match(environment, /requestIdleCallback/)
  assert.doesNotMatch(environment, /if \(!started\) return/)
  assert.match(warmup, /compileAsync/)
  assert.match(warmup, /requestIdleCallback/)
  assert.doesNotMatch(warmup, /activeRoomId|quality|started/)
})

test('v0.17 hero assets carry baked vertex lighting instead of more real-time lights', () => {
  const gltf = inspectAuthoredShopGlb(buildAuthoredShopGlb('wholesale'))
  assert.match(gltf.asset.generator, /v0\.17/)
  for (const mesh of gltf.meshes) {
    for (const primitive of mesh.primitives) {
      assert.ok(Number.isInteger(primitive.attributes.COLOR_0), `${mesh.name} missing COLOR_0`)
    }
  }
})

test('v0.17 keeps hot collision checks sqrt-free', async () => {
  const collision = await source('../src/engine/collision.ts')
  assert.doesNotMatch(collision, /Math\.hypot/)
  assert.match(collision, /dx \* dx \+ dz \* dz < combined \* combined/)
})

test('v0.17 F3 diagnostics separate broadphase from expensive occlusion work', async () => {
  const metrics = await source('../src/engine/runtimeMetrics.ts')
  const probe = await source('../src/components/DiagnosticsProbe.tsx')
  const hud = await source('../src/components/HUD.tsx')

  assert.match(metrics, /interactionOcclusionRaycasts/)
  assert.match(probe, /getInteractionTargets\(\)\.length/)
  assert.match(probe, /gl\.getPixelRatio\(\)/)
  assert.match(hud, /occlusion scans\/s/)
  assert.match(hud, /interaction targets/)
  assert.match(hud, /pixel ratio/)
})
