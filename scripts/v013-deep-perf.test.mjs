import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function source(relative) {
  return readFile(new URL(relative, import.meta.url), 'utf8')
}

test('motion temporarily trades pixels, never scene fidelity', async () => {
  const app = await source('../src/App.tsx')
  const mall = await source('../src/components/MallScene.tsx')
  const controller = await source('../src/components/MotionPerformanceController.tsx')

  assert.match(app, /performance=\{\{/)
  assert.match(app, /debounce: 850/)
  assert.match(mall, /AdaptiveDpr/)
  assert.doesNotMatch(mall, /AdaptiveEvents/)
  assert.match(controller, /state\.performance\.regress/)
  assert.match(controller, /useAppStore\.subscribe/)
  assert.match(controller, /pointermove/)
  assert.match(controller, /touchmove/)
})

test('shader warm-up is idle and non-blocking', async () => {
  const mall = await source('../src/components/MallScene.tsx')
  const warmup = await source('../src/components/SceneWarmup.tsx')

  assert.match(mall, /SceneWarmup/)
  assert.match(warmup, /compileAsync/)
  assert.match(warmup, /requestIdleCallback/)
  assert.match(warmup, /\.catch\(\(\) =>/)
})

test('PMREM creation is decoupled from quality toggles', async () => {
  const environment = await source('../src/components/MaterialEnvironment.tsx')

  assert.match(environment, /requestIdleCallback/)
  assert.match(environment, /new PMREMGenerator/)
  assert.match(environment, /scene\.environmentIntensity = quality === 'cinematic'/)
  assert.match(environment, /\}, \[gl, invalidate, scene\]\)/)
  assert.match(environment, /\}, \[invalidate, quality, scene\]\)/)
})

test('micro roughness fills the albedo-only realism gap without network assets', async () => {
  const surface = await source('../src/scene/materials/SurfaceMaterial.tsx')
  const micro = await source('../src/scene/materials/microDetailTextures.ts')

  assert.match(surface, /getMicroRoughnessVariant/)
  assert.match(surface, /const roughnessMap = loadedPbr\?\.roughnessMap/)
  assert.match(surface, /roughnessMap=\{roughnessMap\}/)
  assert.match(micro, /CanvasTexture/)
  assert.doesNotMatch(micro, /https?:\/\//)
})
