import { useGLTF } from '@react-three/drei'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import {
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  StaticDrawUsage,
  Vector2,
  type Material,
  type Object3D
} from 'three'
import type { Vendor } from '../domain/catalog'
import type { Interaction } from '../domain/interaction'
import { interactionFromObject } from '../engine/interactions'
import { resolveAssetUrl } from '../assets/resolveAssetUrl'
import { getAssetPresentationProfile, type AssetPresentationProfile } from '../presentation/assetPresentationRegistry'
import {
  acquirePbrTextureSet,
  releasePbrTextureSet,
  type PbrTextureLease,
  type PbrTextureSet
} from '../scene/materials/pbrTextureCache'
import {
  getMicroAlbedoVariant,
  getMicroNormalScale,
  getMicroNormalVariant,
  getMicroRoughnessVariant
} from '../scene/materials/microDetailTextures'
import { warmPbrTextureSet } from '../scene/materials/textureUploadScheduler'
import { useAppStore, type RenderQuality } from '../store'
import { resolveHotspotInteraction } from '../world/hotspots'
import type { RoomDefinition } from '../world/types'
import AuthoredSurfaceDetails from './AuthoredSurfaceDetails'
import HeroRoomArtDirection from './HeroRoomArtDirection'
import { ProductSampleRail } from '../scene/retail/RetailFixtures'
import WorldTextPanel from './WorldTextPanel'

const tinyDecorativeBatch = /^(calculator_key_|bundle_strap_|shelf_front_lip_|hvac_slot_|carton_tape_|paper_label_|counter_ticket_clip_|hero_.*(?:book|tape|stamp|twine))/


export function preloadFileRoom(url: string) {
  useGLTF.preload(resolveAssetUrl(url))
}

function PointHotspot({ position, interaction }: { position: readonly [number, number, number]; interaction: Interaction }) {
  const setSelected = useAppStore((state) => state.setSelected)
  const setNearby = useAppStore((state) => state.setNearby)

  return (
    <mesh
      position={position as [number, number, number]}
      userData={{ interaction }}
      onClick={(event) => {
        event.stopPropagation()
        if (!document.pointerLockElement) setSelected(interaction)
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        if (!document.pointerLockElement) setNearby(interaction)
      }}
      onPointerOut={() => {
        if (!document.pointerLockElement) setNearby(null)
      }}
    >
      <sphereGeometry args={[0.42, 10, 10]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>
  )
}

function applyAuthoredMicroDetail(
  material: MeshStandardMaterial,
  materialName: string,
  anisotropy: number
) {
  if (materialName === 'paper') {
    material.map = getMicroAlbedoVariant('paper-white', [1.4, 1.4], anisotropy)
    material.normalMap = getMicroNormalVariant('paper-white', [1.4, 1.4], anisotropy)
    material.normalScale = new Vector2(getMicroNormalScale('paper-white'), getMicroNormalScale('paper-white'))
    material.roughnessMap = getMicroRoughnessVariant('paper-white', [1.4, 1.4], anisotropy)
    return
  }

  if (materialName === 'cardboard') {
    material.map = getMicroAlbedoVariant('paper-cream', [1.1, 1.1], anisotropy)
    material.normalMap = getMicroNormalVariant('paper-cream', [1.1, 1.1], anisotropy)
    const scale = getMicroNormalScale('paper-cream') * 1.2
    material.normalScale = new Vector2(scale, scale)
    material.roughnessMap = getMicroRoughnessVariant('paper-cream', [1.1, 1.1], anisotropy)
    return
  }

  const surface = materialName === 'floor'
    ? 'mall-porcelain'
    : materialName === 'wood'
      ? 'bazaar-plywood'
      : materialName === 'metal' || materialName === 'silver'
        ? 'mall-metal'
        : null

  if (!surface) return
  const repeat: [number, number] = materialName === 'floor' ? [2.6, 4.2] : materialName === 'wood' ? [2.2, 2.2] : [5, 5]
  material.normalMap = getMicroNormalVariant(surface, repeat, anisotropy)
  const scale = getMicroNormalScale(surface)
  material.normalScale = new Vector2(scale, scale)
  material.roughnessMap = getMicroRoughnessVariant(surface, repeat, anisotropy)
}

function upgradeAuthoredMaterial(
  material: Material,
  quality: RenderQuality,
  detailAnisotropy: number,
  environmentIntensity: number
) {
  if (!(material instanceof MeshStandardMaterial)) return material.clone()

  if (material.name === 'glass' && quality === 'cinematic') {
    const glass = new MeshPhysicalMaterial({
      name: material.name,
      color: '#dcebed',
      roughness: 0.09,
      metalness: 0,
      transmission: 0.82,
      thickness: 0.06,
      ior: 1.45,
      transparent: true,
      opacity: 1,
      depthWrite: false
    })
    glass.envMapIntensity = 1.15 * environmentIntensity
    return glass
  }

  const standard = new MeshStandardMaterial({
    name: material.name,
    color: material.color.clone(),
    emissive: material.emissive.clone(),
    emissiveIntensity: material.emissiveIntensity,
    roughness: material.roughness,
    metalness: material.metalness,
    side: material.side,
    transparent: material.transparent,
    opacity: material.opacity,
    alphaTest: material.alphaTest
  })

  switch (material.name) {
    case 'glass':
      standard.color.set('#b9cdcf')
      standard.roughness = 0.18
      standard.metalness = 0.04
      standard.transparent = true
      standard.opacity = 0.18
      standard.depthWrite = false
      standard.envMapIntensity = 0.9
      break
    case 'floor':
      standard.roughness = 0.34
      standard.metalness = 0.01
      standard.envMapIntensity = 1.0
      break
    case 'metal':
    case 'silver':
      standard.roughness = material.name === 'silver' ? 0.25 : 0.34
      standard.metalness = 0.82
      standard.envMapIntensity = 1.18
      break
    case 'wood':
      standard.roughness = 0.52
      standard.metalness = 0
      standard.envMapIntensity = 0.78
      break
    case 'paper':
      standard.roughness = 0.92
      standard.metalness = 0
      standard.envMapIntensity = 0.32
      break
    case 'plaster':
      standard.roughness = 0.72
      standard.metalness = 0
      standard.envMapIntensity = 0.48
      break
    case 'cardboard':
      standard.roughness = 0.91
      standard.metalness = 0
      standard.envMapIntensity = 0.32
      break
    default:
      standard.roughness = Math.max(0.44, standard.roughness)
      standard.envMapIntensity = 0.72
  }

  standard.envMapIntensity *= environmentIntensity
  applyAuthoredMicroDetail(standard, material.name, detailAnisotropy)
  return standard
}

function attachNodeInteractions(
  scene: Object3D,
  room: RoomDefinition,
  quality: RenderQuality,
  detailAnisotropy: number,
  presentation: AssetPresentationProfile,
  vendor?: Vendor
) {
  const materialCache = new Map<Material, Material>()
  const upgraded = (material: Material) => {
    const cached = materialCache.get(material)
    if (cached) return cached
    const next = upgradeAuthoredMaterial(
      material,
      quality,
      detailAnisotropy,
      presentation.hero?.environmentIntensity ?? 1
    )
    materialCache.set(material, next)
    return next
  }

  scene.traverse((object) => {
    object.userData = { ...object.userData }
    delete object.userData.interaction

    if (object instanceof Mesh) {
      const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material]
      const transparent = sourceMaterials.some((material) => material.transparent)
      const tinyDecoration = tinyDecorativeBatch.test(object.name)
      object.castShadow = (!transparent || presentation.shadow.transparentCast)
        && (!tinyDecoration || presentation.shadow.tinyDecorationsCast)
      object.receiveShadow = true
      object.material = Array.isArray(object.material)
        ? object.material.map(upgraded)
        : upgraded(object.material)
    }
  })

  if (vendor) {
    for (const hotspot of room.hotspots) {
      if (hotspot.anchor.kind !== 'node') continue
      const object = scene.getObjectByName(hotspot.anchor.nodeName)
      if (!object) {
        console.warn(`[room-hotspot] ${room.id} is missing GLB node "${hotspot.anchor.nodeName}"`)
        continue
      }

      const interaction = resolveHotspotInteraction(hotspot, vendor)
      if (interaction) object.userData.interaction = interaction
    }
  }

  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return
    object.updateMatrix()
    object.matrixAutoUpdate = false
  })
}

function batchStaticAuthoredMeshes(scene: Object3D) {
  scene.updateMatrixWorld(true)
  const rootInverse = new Matrix4().copy(scene.matrixWorld).invert()
  const groups = new Map<string, Mesh[]>()

  scene.traverse((object) => {
    if (!(object instanceof Mesh) || object instanceof InstancedMesh) return
    if (object.children.length || object.userData.interaction || object.name.startsWith('hotspot_')) return
    if (Array.isArray(object.material) || object.material.transparent) return

    const key = [
      object.geometry.uuid,
      object.material.uuid,
      object.castShadow ? 'cast' : 'no-cast',
      object.receiveShadow ? 'receive' : 'no-receive'
    ].join('|')

    const group = groups.get(key)
    if (group) group.push(object)
    else groups.set(key, [object])
  })

  for (const meshes of groups.values()) {
    if (meshes.length < 3) continue
    const first = meshes[0]
    if (Array.isArray(first.material)) continue

    const instanced = new InstancedMesh(first.geometry, first.material, meshes.length)
    instanced.name = `batch:${first.geometry.type}:${first.material.name || 'material'}`
    instanced.castShadow = first.castShadow
    instanced.receiveShadow = first.receiveShadow
    instanced.instanceMatrix.setUsage(StaticDrawUsage)

    meshes.forEach((mesh, index) => {
      mesh.updateMatrixWorld(true)
      const relative = new Matrix4().multiplyMatrices(rootInverse, mesh.matrixWorld)
      instanced.setMatrixAt(index, relative)
    })

    instanced.instanceMatrix.needsUpdate = true
    instanced.userData.batchCount = meshes.length

    if (meshes.every((mesh) => tinyDecorativeBatch.test(mesh.name))) {
      instanced.raycast = () => undefined
      instanced.userData.nonOccludingDecoration = true
    }

    instanced.updateMatrix()
    instanced.matrixAutoUpdate = false
    scene.add(instanced)

    for (const mesh of meshes) mesh.parent?.remove(mesh)
  }

  scene.updateMatrixWorld(true)
}

function applyAuthoredTextureSets(
  scene: Object3D,
  sets: Map<string, PbrTextureSet>,
  bindings: AssetPresentationProfile['materialBindings']
) {
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return

    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) {
      if (!(material instanceof MeshStandardMaterial)) continue
      const binding = bindings[material.name]
      const set = sets.get(material.name)
      if (!binding || !set) continue

      material.map = set.map
      material.normalMap = set.normalMap ?? null
      material.roughnessMap = set.roughnessMap ?? null
      material.bumpMap = null
      material.bumpScale = 0
      if (set.normalMap) material.normalScale.set(binding.normalScale, binding.normalScale)
      material.needsUpdate = true
    }
  })
}

const atlasMaterialTiles: Partial<Record<string, number>> = {
  paper: 0,
  cardboard: 2,
  green: 8,
  yellow: 9,
  red: 10,
  blue: 11,
  silver: 12,
  black: 13,
  white: 0
}

function applyProductionAtlasMaterials(
  scene: Object3D,
  atlas: import('three').Texture,
  getTile: (source: import('three').Texture, tile: number) => import('three').Texture
) {
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]

    for (const material of materials) {
      if (!(material instanceof MeshStandardMaterial)) continue
      const tile = atlasMaterialTiles[material.name]
      if (tile === undefined) continue

      material.map = getTile(atlas, tile)
      material.color.set('#ffffff')
      material.needsUpdate = true
    }
  })
}

function disposeSceneMaterials(scene: Object3D) {
  const disposed = new Set<Material>()
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) {
      if (disposed.has(material)) continue
      disposed.add(material)
      material.dispose()
    }
  })
}

export default function FileRoomRenderer({ room, vendor, url, scale = 1 }: { room: RoomDefinition; vendor?: Vendor; url: string; scale?: number }) {
  const gltf = useGLTF(resolveAssetUrl(url))
  const gl = useThree((state) => state.gl)
  const invalidate = useThree((state) => state.invalidate)
  const setSelected = useAppStore((state) => state.setSelected)
  const setNearby = useAppStore((state) => state.setNearby)
  const quality = useAppStore((state) => state.quality)
  const performanceCurrent = useThree((state) => state.performance.current)
  const presentation = getAssetPresentationProfile(room)
  const detailAnisotropy = quality === 'cinematic'
    ? Math.min(4, gl.capabilities.getMaxAnisotropy())
    : Math.min(2, gl.capabilities.getMaxAnisotropy())

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true)
    attachNodeInteractions(clone, room, quality, detailAnisotropy, presentation, vendor)
    if (room.asset.kind === 'gltf' && room.asset.source === 'authored') {
      batchStaticAuthoredMeshes(clone)
    }
    return clone
  }, [detailAnisotropy, gltf.scene, presentation, quality, room, vendor])

  useEffect(() => {
    const authored = room.asset.kind === 'gltf' && room.asset.source === 'authored'
    if (!authored) return

    let active = true
    void import('../scene/materials/productionAtlas')
      .then(async ({ loadProductionMaterialAtlas, getProductionAtlasTile }) => {
        const atlas = await loadProductionMaterialAtlas(gl)
        if (!active) return
        applyProductionAtlasMaterials(scene, atlas, getProductionAtlasTile)
        invalidate()
      })
      .catch(() => {
        // Material colors and micro detail remain as the offline-safe fallback.
      })

    return () => {
      active = false
    }
  }, [gl, invalidate, room.asset, scene])

  useEffect(() => {
    const authored = room.asset.kind === 'gltf' && room.asset.source === 'authored'
    if (!authored || quality !== 'cinematic' || performanceCurrent < 0.97) return

    let active = true
    const leases: PbrTextureLease[] = []
    const sets = new Map<string, PbrTextureSet>()

    const tasks = Object.entries(presentation.materialBindings).map(async ([materialName, binding]) => {
      if (!binding) return
      const lease = await acquirePbrTextureSet(binding.surface, {
        repeat: binding.repeat,
        anisotropy: detailAnisotropy,
        full: true,
        priority: 'background',
        resolution: '1k'
      })
      if (!lease) return

      if (!active) {
        releasePbrTextureSet(lease)
        return
      }

      try {
        await warmPbrTextureSet(gl, lease.set)
      } catch {
        releasePbrTextureSet(lease)
        return
      }

      if (!active) {
        releasePbrTextureSet(lease)
        return
      }

      leases.push(lease)
      sets.set(materialName, lease.set)
    })

    void Promise.all(tasks)
      .then(() => {
        if (active) {
          applyAuthoredTextureSets(scene, sets, presentation.materialBindings)
          invalidate()
        }
      })
      .catch(() => {
        // The shared atlas remains the stable fallback.
      })

    return () => {
      active = false
      for (const lease of leases.splice(0)) releasePbrTextureSet(lease)
      sets.clear()
    }
  }, [detailAnisotropy, gl, invalidate, performanceCurrent, presentation, quality, room.asset, scene])

  useEffect(() => {
    if (quality !== 'cinematic') return
    gl.shadowMap.needsUpdate = true
    invalidate()
  }, [gl, invalidate, quality, scene])

  useEffect(() => () => {
    disposeSceneMaterials(scene)
  }, [scene])

  return (
    <group position={room.position as [number, number, number]} rotation={[0, room.rotationY, 0]}>
      <primitive
        object={scene}
        scale={scale}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          const interaction = interactionFromObject(event.object)
          if (!interaction || document.pointerLockElement) return
          event.stopPropagation()
          setSelected(interaction)
        }}
        onPointerOver={(event: ThreeEvent<PointerEvent>) => {
          const interaction = interactionFromObject(event.object)
          if (!interaction || document.pointerLockElement) return
          event.stopPropagation()
          setNearby(interaction)
        }}
        onPointerOut={() => {
          if (!document.pointerLockElement) setNearby(null)
        }}
      />

      <group scale={scale}>
        {room.asset.kind === 'gltf' && room.asset.source === 'authored' && (
          <AuthoredSurfaceDetails room={room} />
        )}

        {room.asset.kind === 'gltf' && room.asset.source === 'authored' && (
          <HeroRoomArtDirection room={room} />
        )}

        {vendor && room.asset.kind === 'gltf' && room.asset.source === 'authored' && (
          <ProductSampleRail room={room} vendor={vendor} />
        )}

        {vendor && room.asset.kind === 'gltf' && room.asset.source === 'authored' && (
          <WorldTextPanel
            position={[2.805, 3.54, 0]}
            rotation={[0, Math.PI / 2, 0]}
            width={4.82}
            height={0.54}
            background="#31504c"
            borderColor="rgba(255,255,255,.12)"
            lines={[
              { text: vendor.name, size: 68, color: '#f6f3eb', weight: 900 },
              { text: `${vendor.shortName} · AUTHORED GLB`, size: 28, color: room.theme.accent, weight: 800, direction: 'ltr' }
            ]}
          />
        )}

        {vendor && room.hotspots.map((hotspot) => {
          if (hotspot.anchor.kind !== 'point') return null
          const interaction = resolveHotspotInteraction(hotspot, vendor)
          return interaction ? <PointHotspot key={hotspot.id} position={hotspot.anchor.position} interaction={interaction} /> : null
        })}
      </group>
    </group>
  )
}


