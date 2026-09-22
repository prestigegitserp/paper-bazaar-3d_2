import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function source(relative) {
  return readFile(new URL(relative, import.meta.url), 'utf8')
}

test('modern passage surfaces are backed by real multi-map PBR assets', async () => {
  const registry = await source('../src/scene/materials/pbrSurfaceRegistry.ts')
  assert.match(registry, /'mall-porcelain'/)
  assert.match(registry, /floor_tiles_04/)
  assert.match(registry, /'mall-plaster'/)
  assert.match(registry, /white_plaster_02/)
  assert.match(registry, /nor_gl/)
  assert.match(registry, /rough/)
})

test('surface renderer uses standard-first PBR, adaptive anisotropy and shared cache', async () => {
  const material = await source('../src/scene/materials/SurfaceMaterial.tsx')
  const cache = await source('../src/scene/materials/pbrTextureCache.ts')
  assert.match(material, /meshStandardMaterial/)
  assert.doesNotMatch(material, /meshPhysicalMaterial/)
  assert.match(material, /textureAnisotropy/)
  assert.match(material, /performanceCurrent > 0\.97/)
  assert.match(material, /acquirePbrTextureSet/)
  assert.match(cache, /getMaxAnisotropy|anisotropy/)
  assert.match(cache, /sourceTexturePromises/)
})

test('scene has local reflection environment without full-floor transparent overdraw', async () => {
  const mall = await source('../src/components/MallScene.tsx')
  const environment = await source('../src/components/MaterialEnvironment.tsx')
  assert.match(mall, /MaterialEnvironment/)
  assert.doesNotMatch(mall, /FloorImperfections/)
  assert.match(environment, /RoomEnvironment/)
  assert.match(environment, /scene\.environment/)
})

test('authored GLB shares the same profile-driven PBR material pipeline', async () => {
  const renderer = await source('../src/components/FileRoomRenderer.tsx')
  const presentation = await source('../src/presentation/assetPresentationRegistry.ts')
  assert.match(presentation, /mall-porcelain/)
  assert.match(presentation, /mall-plaster/)
  assert.match(presentation, /wood-walnut/)
  assert.match(renderer, /presentation\.materialBindings/)
  assert.match(renderer, /acquirePbrTextureSet/)
  assert.match(renderer, /transmission/)
  assert.match(renderer, /MeshPhysicalMaterial/)
})

test('cinematic realism pass has no decorative sparkles or manual tile grout overlay', async () => {
  const effects = await source('../src/components/ExperienceEffects.tsx')
  const architecture = await source('../src/components/Architecture.tsx')
  assert.doesNotMatch(effects, /Sparkles/)
  assert.doesNotMatch(effects, /SoftShadows/)
  assert.doesNotMatch(architecture, /zSeams|xSeams/)
  assert.match(architecture, /surface="mall-porcelain"/)
})
