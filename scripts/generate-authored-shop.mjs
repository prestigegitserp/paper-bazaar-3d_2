import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  BoxGeometry,
  CylinderGeometry,
  Euler,
  Float32BufferAttribute,
  PlaneGeometry,
  Quaternion,
  TorusGeometry
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const MATERIALS = [
  ['plaster', [0.90, 0.89, 0.86, 1], 0, 0.68],
  ['floor', [0.76, 0.76, 0.73, 1], 0.02, 0.32],
  ['wood', [0.50, 0.34, 0.21, 1], 0, 0.64],
  ['paper', [0.92, 0.90, 0.85, 1], 0, 0.95],
  ['cardboard', [0.67, 0.49, 0.30, 1], 0, 0.92],
  ['metal', [0.20, 0.22, 0.23, 1], 0.76, 0.34],
  ['green', [0.18, 0.31, 0.29, 1], 0.12, 0.62],
  ['yellow', [0.91, 0.78, 0.24, 1], 0, 0.84],
  ['glass', [0.86, 0.93, 0.94, 0.18], 0, 0.06],
  ['white', [0.94, 0.94, 0.91, 1], 0, 0.48],
  ['black', [0.06, 0.07, 0.075, 1], 0.25, 0.32],
  ['red', [0.62, 0.11, 0.09, 1], 0, 0.5],
  ['blue', [0.11, 0.28, 0.45, 1], 0, 0.5],
  ['silver', [0.58, 0.61, 0.62, 1], 0.85, 0.26]
]

const SHAPES = {
  box: new BoxGeometry(1, 1, 1),
  rounded: new RoundedBoxGeometry(1, 1, 1, 3, 0.055),
  cylinder: new CylinderGeometry(0.5, 0.5, 1, 24, 1, false),
  plane: new PlaneGeometry(1, 1),
  torus: new TorusGeometry(0.5, 0.12, 12, 24)
}

function bakeVertexLighting(geometry) {
  geometry.computeBoundingBox()
  const position = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')
  const box = geometry.boundingBox
  if (!position || !normal || !box) return

  const height = Math.max(0.0001, box.max.y - box.min.y)
  const colors = new Float32Array(position.count * 3)

  for (let index = 0; index < position.count; index += 1) {
    const y = position.getY(index)
    const ny = normal.getY(index)
    const nx = normal.getX(index)
    const nz = normal.getZ(index)
    const vertical = (y - box.min.y) / height
    const upwardBounce = Math.max(0, ny) * 0.08
    const downwardOcclusion = Math.max(0, -ny) * 0.16
    const sideFalloff = (Math.abs(nx) + Math.abs(nz)) * 0.018
    const floorBounce = vertical * 0.055
    const brightness = Math.max(0.68, Math.min(1, 0.84 + upwardBounce - downwardOcclusion - sideFalloff + floorBounce))

    colors[index * 3] = brightness
    colors[index * 3 + 1] = brightness * 0.985
    colors[index * 3 + 2] = brightness * 0.95
  }

  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
}

for (const geometry of Object.values(SHAPES)) bakeVertexLighting(geometry)

function pad4(value) {
  return (value + 3) & ~3
}

function quat(x = 0, y = 0, z = 0) {
  return new Quaternion().setFromEuler(new Euler(x, y, z, 'XYZ')).toArray()
}

function part(name, material, scale, translation, options = {}) {
  return {
    name,
    material,
    scale,
    translation,
    shape: options.shape ?? 'rounded',
    extras: options.extras,
    rotation: options.rotation
  }
}

const hard = (name, material, scale, translation, options = {}) =>
  part(name, material, scale, translation, { ...options, shape: 'box' })

const cylinder = (name, material, scale, translation, options = {}) =>
  part(name, material, scale, translation, { ...options, shape: 'cylinder' })

const torus = (name, material, scale, translation, options = {}) =>
  part(name, material, scale, translation, { ...options, shape: 'torus' })

function authoredShopNodes(variant = 'wholesale') {
  const nodes = [
    hard('floor', 'floor', [5.5, 0.08, 7], [0, 0.04, 0]),
    hard('back_wall', 'plaster', [0.16, 4.2, 7], [-2.68, 2.1, 0]),
    hard('side_wall_north', 'plaster', [5.5, 4.2, 0.16], [0, 2.1, -3.42]),
    hard('side_wall_south', 'plaster', [5.5, 4.2, 0.16], [0, 2.1, 3.42]),
    hard('ceiling', 'metal', [5.5, 0.12, 7], [-0.05, 4.16, 0]),
    part('front_post_north', 'metal', [0.14, 4.1, 0.14], [2.68, 2.05, -3.15]),
    part('front_post_south', 'metal', [0.14, 4.1, 0.14], [2.68, 2.05, 3.15]),
    part('front_lintel', 'metal', [0.14, 0.14, 6.42], [2.68, 4.05, 0]),
    part('sign_frame', 'metal', [0.16, 0.72, 5.2], [2.67, 3.54, 0]),
    hard('sign_face', 'green', [0.035, 0.58, 4.92], [2.77, 3.54, 0])
  ]

  for (const y of [0.34, 0.95, 1.57, 2.19, 2.81, 3.43]) {
    nodes.push(part(`shelf_${y}`, 'wood', [0.34, 0.06, 6.2], [-2.20, y, 0]))
  }

  for (const z of [-3, -2, -1, 0, 1, 2, 3]) {
    nodes.push(part(`shelf_upright_${z}`, 'metal', [0.12, 3.5, 0.1], [-2.38, 1.86, z]))
  }

  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      const z = -2.55 + col * 1.02
      const y = 0.55 + row * 0.62
      const lean = ((row * 11 + col * 7) % 5 - 2) * 0.008
      const shift = ((row * 5 + col * 3) % 4 - 1.5) * 0.018
      nodes.push(part(
        `paper_bundle_${row}_${col}`,
        'paper',
        [0.60, 0.25, 0.72],
        [-2.03, y, z + shift],
        { rotation: quat(lean * 0.4, lean, lean * 0.6) }
      ))
      if ((row + col) % 5 === 0) {
        nodes.push(part(`paper_label_${row}_${col}`, 'yellow', [0.015, 0.12, 0.28], [-1.72, y, z + shift]))
      }
    }
  }

  nodes.push(
    part('counter_base', 'wood', [0.78, 0.65, 2.65], [0.95, 0.33, -1.05]),
    part('counter_top', 'wood', [0.84, 0.07, 2.72], [0.95, 1.05, -1.05]),
    hard('hotspot_management', 'glass', [0.035, 0.62, 2.52], [1.35, 0.78, -1.05], { extras: { semantic: 'management-desk' } }),
    hard('counter_glass_top', 'glass', [0.74, 0.035, 2.52], [0.98, 1.01, -1.05]),
    part('calculator', 'metal', [0.34, 0.08, 0.45], [0.80, 1.14, -0.45]),
    hard('calculator_screen', 'green', [0.22, 0.015, 0.10], [0.80, 1.185, -0.56]),
    part('hotspot_catalog', 'green', [0.66, 0.035, 0.46], [0.72, 1.15, -1.45], { extras: { semantic: 'catalog-desk' }, rotation: quat(0.025, -0.06, 0.01) }),
    part('catalog_pages', 'paper', [0.60, 0.022, 0.40], [0.72, 1.18, -1.45], { rotation: quat(0.025, -0.06, 0.01) }),
    part('price_board', 'wood', [0.10, 1.35, 2.25], [-2.48, 2.05, 0.45]),
    hard('hotspot_prices', 'paper', [0.025, 1.15, 2.04], [-2.42, 2.05, 0.45], { extras: { semantic: 'price-board' } })
  )

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      nodes.push(part(
        `calculator_key_${row}_${col}`,
        row === 2 && col > 1 ? 'yellow' : 'silver',
        [0.045, 0.018, 0.055],
        [0.70 + col * 0.067, 1.19, -0.35 + row * 0.075]
      ))
    }
  }

  for (const [index, x, z] of [[0, -0.4, 1.65], [1, 1.45, 1.6]]) {
    nodes.push(part(`product_pedestal_${index}`, 'wood', [0.92, 0.62, 0.88], [x, 0.31, z]))
    for (let layer = 0; layer < 4; layer += 1) {
      const name = layer === 3 ? `hotspot_product_${index}` : `product_ream_${index}_${layer}`
      const twist = (layer - 1.5) * (index ? -0.008 : 0.009)
      nodes.push(part(
        name,
        'paper',
        [0.82 - layer * 0.015, 0.085, 0.66 - layer * 0.01],
        [x, 0.68 + layer * 0.10, z],
        {
          extras: layer === 3 ? { semantic: `product-${index}` } : undefined,
          rotation: quat(0, twist, twist * 0.5)
        }
      ))
    }
    nodes.push(part(`product_band_${index}`, index === 0 ? 'green' : 'yellow', [0.84, 0.03, 0.14], [x, 1.02, z]))
  }

  for (const [index, x, y, z] of [
    [0, 0.25, 0.2, 2.75],
    [1, 0.9, 0.2, 2.70],
    [2, 0.52, 0.58, 2.78],
    [3, -0.18, 0.55, 2.80]
  ]) {
    const angle = (index - 1.5) * 0.045
    nodes.push(part(`carton_${index}`, 'cardboard', [0.62, 0.36, 0.64], [x, y, z], { rotation: quat(0, angle, 0) }))
    nodes.push(part(`carton_flap_a_${index}`, 'cardboard', [0.28, 0.025, 0.58], [x - 0.16, y + 0.20, z], { rotation: quat(0, angle, -0.055) }))
    nodes.push(part(`carton_flap_b_${index}`, 'cardboard', [0.28, 0.025, 0.58], [x + 0.16, y + 0.20, z], { rotation: quat(0, angle, 0.045) }))
  }

  nodes.push(part('roll_rack', 'metal', [1.2, 2.2, 0.12], [-1, 1.1, 2.95]))
  for (const [index, x] of [[0, -1.35], [1, -1], [2, -0.65]]) {
    nodes.push(cylinder(`paper_roll_${index}`, 'paper', [0.36, 1.8, 0.36], [x, 1.15, 2.78]))
    nodes.push(cylinder(`paper_core_${index}`, 'cardboard', [0.105, 1.84, 0.105], [x, 1.15, 2.78]))
  }

  const samples = [
    [-0.8, 2.5, -3.30], [0, 2.5, -3.30], [0.8, 2.5, -3.30],
    [-0.8, 1.65, -3.30], [0, 1.65, -3.30], [0.8, 1.65, -3.30]
  ]
  samples.forEach((position, index) => nodes.push(part(
    `sample_${index}`,
    index % 3 === 2 ? 'yellow' : 'paper',
    [0.56, 0.62, 0.04],
    position,
    { rotation: quat(0, 0, ((index % 3) - 1) * 0.018) }
  )))

  for (const [index, z] of [[0, -1.5], [1, 1.5]]) {
    nodes.push(
      part(`light_case_${index}`, 'metal', [1.85, 0.08, 0.18], [0.2, 3.88, z]),
      hard(`light_panel_${index}`, 'paper', [1.60, 0.025, 0.07], [0.2, 3.82, z])
    )
  }

  for (const y of [0.34, 0.95, 1.57, 2.19, 2.81, 3.43]) {
    nodes.push(part(`shelf_front_lip_${y}`, 'silver', [0.03, 0.05, 6.05], [-2.01, y + 0.055, 0]))
  }

  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      if ((row + col) % 3 === 0) {
        const z = -2.55 + col * 1.02
        const y = 0.55 + row * 0.62
        nodes.push(part(`bundle_strap_${row}_${col}`, 'cardboard', [0.06, 0.285, 0.75], [-2.00, y, z]))
      }
    }
  }

  nodes.push(
    hard('counter_glass_shelf', 'glass', [0.64, 0.025, 2.32], [0.98, 0.72, -1.05]),
    part('receipt_printer', 'white', [0.30, 0.13, 0.40], [0.68, 1.16, -0.66]),
    hard('receipt_slot', 'black', [0.20, 0.018, 0.08], [0.68, 1.23, -0.77]),
    part('tape_dispenser', 'green', [0.18, 0.08, 0.30], [0.96, 1.15, -0.10]),
    cylinder('pen_cup', 'silver', [0.12, 0.20, 0.12], [0.62, 1.17, 0.08]),
    cylinder('pen_red', 'red', [0.018, 0.24, 0.018], [0.60, 1.31, 0.08], { rotation: quat(0.08, 0, -0.06) }),
    cylinder('pen_blue', 'blue', [0.018, 0.22, 0.018], [0.65, 1.30, 0.08], { rotation: quat(-0.05, 0, 0.07) }),
    part('drawer_front_0', 'white', [0.04, 0.22, 0.92], [1.36, 0.43, -1.62]),
    part('drawer_front_1', 'white', [0.04, 0.22, 0.92], [1.36, 0.43, -0.50]),
    part('drawer_handle_0', 'silver', [0.03, 0.035, 0.26], [1.39, 0.45, -1.62]),
    part('drawer_handle_1', 'silver', [0.03, 0.035, 0.26], [1.39, 0.45, -0.50]),
    part('power_outlet', 'white', [0.04, 0.18, 0.28], [-2.49, 0.55, -2.62]),
    cylinder('cable_trunk', 'silver', [0.035, 3.1, 0.035], [-2.50, 3.25, -1.70], { rotation: quat(Math.PI / 2, 0, 0) }),
    part('cctv_body', 'white', [0.28, 0.16, 0.18], [-1.95, 3.54, -2.88], { rotation: quat(0, 0.08, -0.10) }),
    cylinder('cctv_lens', 'black', [0.07, 0.05, 0.07], [-1.80, 3.54, -2.88], { rotation: quat(0, 0, -Math.PI / 2) }),
    cylinder('cctv_arm', 'silver', [0.04, 0.28, 0.04], [-2.12, 3.68, -2.88], { rotation: quat(0, 0, Math.PI / 2) }),
    part('hvac_vent', 'white', [1.45, 0.05, 0.48], [-0.55, 4.06, 0.95]),
    part('waste_bin', 'black', [0.34, 0.56, 0.34], [1.95, 0.28, -2.65]),
    hard('brochure_holder', 'glass', [0.12, 0.42, 0.50], [0.44, 1.28, 0.88]),
    cylinder('service_bell', 'silver', [0.16, 0.08, 0.16], [0.72, 1.15, 0.92])
  )

  for (let index = 0; index < 8; index += 1) {
    nodes.push(part(`hvac_slot_${index}`, 'black', [0.08, 0.012, 0.35], [-1.10 + index * 0.16, 4.035, 0.95]))
  }

  for (const [index, z] of [[0, -1.72], [1, -0.38], [2, 0.96]]) {
    nodes.push(
      part(`counter_price_ticket_${index}`, index === 1 ? 'yellow' : 'white', [0.03, 0.16, 0.34], [1.37, 0.73, z]),
      part(`counter_ticket_clip_${index}`, 'silver', [0.04, 0.04, 0.08], [1.40, 0.83, z])
    )
  }

  for (const [index, x, z] of [[0, 0.25, 2.75], [1, 0.9, 2.70], [2, 0.52, 2.78], [3, -0.18, 2.80]]) {
    nodes.push(part(`carton_tape_${index}`, 'cardboard', [0.64, 0.045, 0.09], [x, index < 2 ? 0.40 : 0.77, z]))
  }

  nodes.push(
    cylinder('fan_hub', 'metal', [0.18, 0.18, 0.18], [0.25, 3.70, 0.20]),
    part('fan_blade_0', 'metal', [1.0, 0.035, 0.16], [0.75, 3.66, 0.20]),
    part('fan_blade_1', 'metal', [1.0, 0.035, 0.16], [0.00, 3.66, 0.63], { rotation: [0, 0.5, 0, 0.8660254] }),
    part('fan_blade_2', 'metal', [1.0, 0.035, 0.16], [0.00, 3.66, -0.23], { rotation: [0, -0.5, 0, 0.8660254] }),
    cylinder('wall_conduit', 'metal', [0.035, 3, 0.035], [-2.52, 3.25, -1.7], { rotation: quat(Math.PI / 2, 0, 0) }),
    part('junction_box', 'metal', [0.10, 0.24, 0.18], [-2.49, 2.85, -0.20])
  )

  nodes.push(
    part('hero_order_clipboard', 'wood', [0.36, 0.035, 0.50], [0.34, 1.16, -0.08], { rotation: quat(0, -0.16, 0.015) }),
    part('hero_order_sheet', 'paper', [0.31, 0.012, 0.44], [0.34, 1.185, -0.08], { rotation: quat(0, -0.16, 0.015) }),
    part('hero_stamp_pad', 'black', [0.22, 0.05, 0.16], [0.16, 1.145, 0.24], { rotation: quat(0, 0.10, 0) }),
    cylinder('hero_stamp_handle', 'wood', [0.07, 0.13, 0.07], [0.18, 1.245, 0.24]),
    part('hero_scale_base', 'metal', [0.46, 0.10, 0.42], [1.78, 0.11, 2.16]),
    part('hero_scale_platform', 'silver', [0.52, 0.035, 0.48], [1.78, 0.19, 2.16]),
    part('hero_scale_display', 'green', [0.05, 0.13, 0.22], [1.52, 0.28, 2.16]),
    torus('hero_tape_roll', 'yellow', [0.18, 0.18, 0.11], [1.23, 1.17, -0.08], { rotation: quat(Math.PI / 2, 0, 0) }),
    part('hero_handtruck_left', 'metal', [0.07, 1.45, 0.07], [2.05, 0.84, 2.72], { rotation: quat(0, 0, -0.08) }),
    part('hero_handtruck_right', 'metal', [0.07, 1.45, 0.07], [2.05, 0.84, 3.08], { rotation: quat(0, 0, -0.08) }),
    part('hero_handtruck_axle', 'metal', [0.10, 0.08, 0.48], [2.09, 0.24, 2.90]),
    torus('hero_handtruck_wheel_a', 'black', [0.22, 0.22, 0.12], [2.10, 0.20, 2.66], { rotation: quat(0, Math.PI / 2, 0) }),
    torus('hero_handtruck_wheel_b', 'black', [0.22, 0.22, 0.12], [2.10, 0.20, 3.14], { rotation: quat(0, Math.PI / 2, 0) })
  )

  for (let index = 0; index < 5; index += 1) {
    const z = 0.34 + index * 0.085
    nodes.push(part(
      `hero_sample_book_${index}`,
      index % 2 === 0 ? 'paper' : index === 3 ? 'yellow' : 'green',
      [0.48 - index * 0.015, 0.035, 0.34],
      [0.65, 1.15 + index * 0.038, z],
      { rotation: quat(0, -0.18 + index * 0.025, 0.01) }
    ))
  }


  if (variant === 'wholesale') {
    for (let index = 0; index < 5; index += 1) {
      const z = -1.9 + index * 0.88
      nodes.push(
        cylinder(`hero_wholesale_roll_${index}`, index % 2 ? 'paper' : 'cardboard', [0.42, 2.15, 0.42], [1.78, 1.12, z], { rotation: quat(0, 0, Math.PI / 2) }),
        cylinder(`hero_wholesale_core_${index}`, 'cardboard', [0.12, 2.18, 0.12], [1.78, 1.12, z], { rotation: quat(0, 0, Math.PI / 2) })
      )
    }
    nodes.push(
      part('hero_wholesale_pallet', 'wood', [1.5, 0.13, 1.15], [0.2, 0.08, 2.15]),
      part('hero_wholesale_bundle', 'paper', [1.34, 0.58, 1.0], [0.2, 0.43, 2.15]),
      part('hero_wholesale_strap_a', 'green', [0.08, 0.62, 1.04], [0.2, 0.43, 2.15]),
      part('hero_wholesale_strap_b', 'yellow', [1.38, 0.62, 0.08], [0.2, 0.43, 2.15])
    )
  }

  if (variant === 'packaging') {
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        nodes.push(part(
          `hero_pack_carton_${row}_${col}`,
          'cardboard',
          [0.58, 0.34 + row * 0.02, 0.52],
          [0.05 + col * 0.62, 0.20 + row * 0.37, 1.92 + (row % 2) * 0.08],
          { rotation: quat(0, (col - 1.5) * 0.025, 0) }
        ))
      }
    }
    nodes.push(
      part('hero_pack_cutting_table', 'wood', [1.25, 0.78, 1.5], [0.55, 0.39, -2.2]),
      part('hero_pack_cutting_mat', 'green', [1.12, 0.025, 1.38], [0.55, 0.80, -2.2]),
      cylinder('hero_pack_twine_a', 'cardboard', [0.18, 0.42, 0.18], [1.72, 1.02, -2.35]),
      cylinder('hero_pack_twine_b', 'yellow', [0.16, 0.38, 0.16], [1.72, 1.02, -1.9]),
      torus('hero_pack_tape_large', 'yellow', [0.28, 0.28, 0.14], [0.20, 0.89, -2.30], { rotation: quat(Math.PI / 2, 0, 0) })
    )
  }

  if (variant === 'studio') {
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        const material = (row + col) % 4 === 0 ? 'yellow' : (row + col) % 3 === 0 ? 'green' : 'paper'
        nodes.push(part(
          `hero_studio_swatch_${row}_${col}`,
          material,
          [0.38, 0.48, 0.035],
          [-2.46, 1.12 + row * 0.62, -2.4 + col * 0.96],
          { rotation: quat(0, Math.PI / 2, (col - 2) * 0.012) }
        ))
      }
    }
    nodes.push(
      part('hero_studio_island', 'wood', [1.45, 0.72, 1.55], [0.25, 0.36, 1.95]),
      part('hero_studio_island_top', 'white', [1.52, 0.055, 1.62], [0.25, 0.76, 1.95]),
      cylinder('hero_studio_stool_a', 'metal', [0.42, 0.48, 0.42], [1.55, 0.25, 1.7]),
      cylinder('hero_studio_stool_b', 'metal', [0.42, 0.48, 0.42], [1.55, 0.25, 2.45])
    )
    for (let index = 0; index < 9; index += 1) {
      nodes.push(part(
        `hero_studio_book_${index}`,
        index % 3 === 0 ? 'yellow' : index % 2 ? 'paper' : 'green',
        [0.42, 0.035, 0.30],
        [-0.2 + (index % 3) * 0.46, 0.82 + Math.floor(index / 3) * 0.045, 1.78 + Math.floor(index / 3) * 0.12],
        { rotation: quat(0, -0.12 + (index % 3) * 0.05, 0) }
      ))
    }
  }

  return nodes
}

function componentTypeFor(array) {
  if (array instanceof Float32Array) return 5126
  if (array instanceof Uint32Array) return 5125
  if (array instanceof Uint16Array) return 5123
  if (array instanceof Uint8Array) return 5121
  throw new Error(`Unsupported typed array: ${array.constructor.name}`)
}

function accessorType(itemSize) {
  if (itemSize === 1) return 'SCALAR'
  if (itemSize === 2) return 'VEC2'
  if (itemSize === 3) return 'VEC3'
  if (itemSize === 4) return 'VEC4'
  throw new Error(`Unsupported attribute itemSize: ${itemSize}`)
}

function extrema(attribute) {
  const min = Array.from({ length: attribute.itemSize }, () => Number.POSITIVE_INFINITY)
  const max = Array.from({ length: attribute.itemSize }, () => Number.NEGATIVE_INFINITY)

  for (let i = 0; i < attribute.count; i += 1) {
    for (let c = 0; c < attribute.itemSize; c += 1) {
      const value = attribute.array[i * attribute.itemSize + c]
      min[c] = Math.min(min[c], value)
      max[c] = Math.max(max[c], value)
    }
  }

  return { min, max }
}

function serializeGeometries(geometries) {
  const chunks = []
  const bufferViews = []
  const accessors = []
  const refs = new Map()
  let offset = 0

  const pushArray = (array, target) => {
    offset = pad4(offset)
    const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength)
    const viewIndex = bufferViews.length
    bufferViews.push({
      buffer: 0,
      byteOffset: offset,
      byteLength: bytes.length,
      target
    })
    chunks.push({ offset, bytes })
    offset += bytes.length
    return viewIndex
  }

  const pushAttribute = (attribute, semantic) => {
    const view = pushArray(attribute.array, 34962)
    const accessor = {
      bufferView: view,
      componentType: componentTypeFor(attribute.array),
      count: attribute.count,
      type: accessorType(attribute.itemSize)
    }
    if (semantic === 'POSITION') Object.assign(accessor, extrema(attribute))
    const index = accessors.length
    accessors.push(accessor)
    return index
  }

  const pushIndex = (attribute) => {
    const view = pushArray(attribute.array, 34963)
    const { min, max } = extrema(attribute)
    const index = accessors.length
    accessors.push({
      bufferView: view,
      componentType: componentTypeFor(attribute.array),
      count: attribute.count,
      type: 'SCALAR',
      min,
      max
    })
    return index
  }

  for (const [shape, geometry] of Object.entries(geometries)) {
    const position = geometry.getAttribute('position')
    const normal = geometry.getAttribute('normal')
    const uv = geometry.getAttribute('uv')
    if (!position || !normal || !uv) throw new Error(`Geometry ${shape} must provide position, normal and UV attributes`)

    refs.set(shape, {
      POSITION: pushAttribute(position, 'POSITION'),
      NORMAL: pushAttribute(normal, 'NORMAL'),
      TEXCOORD_0: pushAttribute(uv, 'TEXCOORD_0'),
      COLOR_0: geometry.getAttribute('color') ? pushAttribute(geometry.getAttribute('color'), 'COLOR_0') : null,
      index: geometry.index ? pushIndex(geometry.index) : null
    })
  }

  const binary = Buffer.alloc(pad4(offset))
  for (const chunk of chunks) chunk.bytes.copy(binary, chunk.offset)

  return { binary, bufferViews, accessors, refs }
}

export function buildAuthoredShopGlb(variant = 'wholesale') {
  const { binary, bufferViews, accessors, refs } = serializeGeometries(SHAPES)
  const materialIndex = new Map(MATERIALS.map(([name], index) => [name, index]))
  const materials = MATERIALS.map(([name, color, metallicFactor, roughnessFactor]) => ({
    name,
    pbrMetallicRoughness: {
      baseColorFactor: color,
      metallicFactor,
      roughnessFactor
    },
    ...(name === 'glass' ? { alphaMode: 'BLEND', doubleSided: true } : {})
  }))

  const meshIndex = new Map()
  const meshes = []
  for (const shape of Object.keys(SHAPES)) {
    const geometry = refs.get(shape)
    for (const [materialName] of MATERIALS) {
      const primitive = {
        attributes: {
          POSITION: geometry.POSITION,
          NORMAL: geometry.NORMAL,
          TEXCOORD_0: geometry.TEXCOORD_0,
          ...(geometry.COLOR_0 !== null ? { COLOR_0: geometry.COLOR_0 } : {})
        },
        material: materialIndex.get(materialName)
      }
      if (geometry.index !== null) primitive.indices = geometry.index

      meshIndex.set(`${shape}:${materialName}`, meshes.length)
      meshes.push({
        name: `${shape}_${materialName}`,
        primitives: [primitive]
      })
    }
  }

  const nodeSpecs = authoredShopNodes(variant)
  const nodes = nodeSpecs.map((node) => ({
    name: node.name,
    mesh: meshIndex.get(`${node.shape}:${node.material}`),
    translation: node.translation,
    scale: node.scale,
    ...(node.rotation ? { rotation: node.rotation } : {}),
    ...(node.extras ? { extras: node.extras } : {})
  }))

  const gltf = {
    asset: {
      version: '2.0',
      generator: 'Paper Bazaar production hero generator v0.17'
    },
    scene: 0,
    scenes: [{ name: `Paper Bazaar Hero ${variant} v1`, nodes: nodes.map((_, index) => index) }],
    nodes,
    meshes,
    materials,
    buffers: [{ byteLength: binary.length }],
    bufferViews,
    accessors
  }

  const jsonBuffer = Buffer.from(JSON.stringify(gltf), 'utf8')
  const jsonLength = pad4(jsonBuffer.length)
  const paddedJson = Buffer.alloc(jsonLength, 0x20)
  jsonBuffer.copy(paddedJson)

  const totalLength = 12 + 8 + paddedJson.length + 8 + binary.length
  const output = Buffer.alloc(totalLength)
  output.write('glTF', 0, 4, 'ascii')
  output.writeUInt32LE(2, 4)
  output.writeUInt32LE(totalLength, 8)
  output.writeUInt32LE(paddedJson.length, 12)
  output.writeUInt32LE(0x4E4F534A, 16)
  paddedJson.copy(output, 20)

  const binHeader = 20 + paddedJson.length
  output.writeUInt32LE(binary.length, binHeader)
  output.writeUInt32LE(0x004E4942, binHeader + 4)
  binary.copy(output, binHeader + 8)

  return output
}

export function inspectAuthoredShopGlb(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'glTF') throw new Error('Invalid GLB magic')
  if (buffer.readUInt32LE(4) !== 2) throw new Error('Expected GLB v2')
  if (buffer.readUInt32LE(8) !== buffer.length) throw new Error('GLB length header mismatch')

  const jsonLength = buffer.readUInt32LE(12)
  const jsonType = buffer.readUInt32LE(16)
  if (jsonType !== 0x4E4F534A) throw new Error('Missing GLB JSON chunk')

  return JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength).trim())
}

async function main() {
  const here = dirname(fileURLToPath(import.meta.url))
  const modelDir = resolve(here, '../public/models')
  await mkdir(modelDir, { recursive: true })

  const variants = [
    ['wholesale', 'hero-wholesale-v1.glb'],
    ['packaging', 'hero-packaging-v1.glb'],
    ['studio', 'hero-paper-studio-v1.glb']
  ]

  for (const [variant, filename] of variants) {
    const target = resolve(modelDir, filename)
    const buffer = buildAuthoredShopGlb(variant)
    await writeFile(target, buffer)
    process.stdout.write(`Generated ${target} (${buffer.length} bytes)\n`)
  }

  // Keep the v0.15 asset filename as a build-time compatibility artifact.
  await writeFile(resolve(modelDir, 'iran-paper-authored-v4.glb'), buildAuthoredShopGlb('wholesale'))
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
