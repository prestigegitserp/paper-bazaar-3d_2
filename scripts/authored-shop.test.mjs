import assert from 'node:assert/strict'
import test from 'node:test'
import { buildAuthoredShopGlb, inspectAuthoredShopGlb } from './generate-authored-shop.mjs'

test('production hero shop emits UV-mapped beveled/cylindrical/torus GLB with semantic anchors', () => {
  const buffer = buildAuthoredShopGlb()
  const gltf = inspectAuthoredShopGlb(buffer)

  assert.ok(buffer.length > 20_000)
  assert.ok(buffer.length < 600_000)
  assert.equal(gltf.asset.version, '2.0')
  assert.match(gltf.asset.generator, /v0\.17/)

  const names = new Set(gltf.nodes.map((node) => node.name))
  for (const required of [
    'hotspot_management',
    'hotspot_prices',
    'hotspot_catalog',
    'hotspot_product_0',
    'hotspot_product_1',
    'counter_glass_top',
    'paper_roll_0',
    'paper_core_0',
    'carton_flap_a_0',
    'calculator_key_0_0',
    'junction_box',
    'receipt_printer',
    'cctv_body',
    'hvac_vent',
    'counter_glass_shelf',
    'service_bell',
    'hero_order_clipboard',
    'hero_scale_base',
    'hero_tape_roll',
    'hero_handtruck_wheel_a',
    'hero_sample_book_0'
  ]) {
    assert.ok(names.has(required), `missing authored node: ${required}`)
  }

  assert.ok(gltf.nodes.length >= 165, 'authored shop should retain dense detail and retain dense hero props and v0.17 baked lighting')
  assert.ok(gltf.materials.some((material) => material.name === 'glass'))

  for (const mesh of gltf.meshes) {
    for (const primitive of mesh.primitives) {
      assert.ok(Number.isInteger(primitive.attributes.POSITION), `${mesh.name} missing POSITION`)
      assert.ok(Number.isInteger(primitive.attributes.NORMAL), `${mesh.name} missing NORMAL`)
      assert.ok(Number.isInteger(primitive.attributes.TEXCOORD_0), `${mesh.name} missing TEXCOORD_0`)
      assert.equal(gltf.accessors[primitive.attributes.TEXCOORD_0].type, 'VEC2')
      assert.ok(Number.isInteger(primitive.attributes.COLOR_0), `${mesh.name} missing baked COLOR_0`)
      assert.equal(gltf.accessors[primitive.attributes.COLOR_0].type, 'VEC3')
    }
  }

  const nodeByName = new Map(gltf.nodes.map((node) => [node.name, node]))
  assert.match(gltf.meshes[nodeByName.get('paper_roll_0').mesh].name, /^cylinder_/)
  assert.match(gltf.meshes[nodeByName.get('paper_bundle_0_0').mesh].name, /^rounded_/)
  assert.match(gltf.meshes[nodeByName.get('back_wall').mesh].name, /^box_/)
  assert.match(gltf.meshes[nodeByName.get('hero_tape_roll').mesh].name, /^torus_/)
})
