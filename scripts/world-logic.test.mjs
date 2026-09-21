import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

async function loadSpatialModule() {
  const source = await readFile(new URL('../src/world/spatial.ts', import.meta.url), 'utf8')
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText

  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)
}

function room(id, x, z, discoveryRadius = 5) {
  return {
    id,
    label: id,
    kind: 'booth',
    position: [x, 0, z],
    rotationY: 0,
    footprint: [4, 4],
    entryAnchor: [2.2, 1.68, 0],
    discoveryRadius,
    theme: { primary: '#000', secondary: '#000', accent: '#000', floor: '#000' },
    asset: { kind: 'procedural', renderer: 'retail-booth-v3', assetId: id, version: '1' },
    hotspots: [],
    colliders: []
  }
}

test('exact room containment wins over an earlier room discovery radius', async () => {
  const { findActiveRoom } = await loadSpatialModule()
  const world = {
    id: 'test',
    name: 'test',
    version: 1,
    spawn: [0, 1.68, 0],
    bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 },
    rooms: [
      room('near-but-not-inside', 0, 0, 10),
      room('actually-inside', 4.1, 0, 5)
    ],
    staticColliders: []
  }

  assert.equal(findActiveRoom(world, 4.1, 0)?.id, 'actually-inside')
})

test('discovery fallback chooses the nearest eligible room instead of array order', async () => {
  const { findActiveRoom } = await loadSpatialModule()
  const world = {
    id: 'test',
    name: 'test',
    version: 1,
    spawn: [0, 1.68, 0],
    bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 },
    rooms: [
      room('farther', 0, 0, 10),
      room('nearest', 3, 0, 10)
    ],
    staticColliders: []
  }

  assert.equal(findActiveRoom(world, 1.9, 3.2)?.id, 'nearest')
})
