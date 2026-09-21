import type { Interaction } from '../domain/interaction'

export type Vec2 = readonly [number, number]
export type Vec3 = readonly [number, number, number]

export type BoothTheme = {
  primary: string
  secondary: string
  accent: string
  floor: string
}

export type AssetMetadata = {
  assetId: string
  version: string
  metersPerUnit?: number
}

export type ProceduralAsset = AssetMetadata & {
  kind: 'procedural'
  renderer: 'paper-booth-v1' | 'tehran-paper-shop-v2' | 'retail-booth-v3'
}

export type GltfAsset = AssetMetadata & {
  kind: 'gltf'
  url: string
  scale?: number
  source?: 'authored' | 'converted'
}

export type ScanAsset = AssetMetadata & {
  kind: 'scan'
  url: string
  format: 'gltf' | 'gaussian-splat'
  scale?: number
  capture?: 'lidar' | 'photogrammetry' | 'phone-video' | 'other'
}

export type WorldAsset = ProceduralAsset | GltfAsset | ScanAsset

export type HotspotSlot = 'management-desk' | 'price-board' | 'product-pedestal' | 'catalog-desk'

export type HotspotAnchor =
  | { kind: 'slot'; slot: HotspotSlot; index?: number }
  | { kind: 'point'; position: Vec3 }
  | { kind: 'node'; nodeName: string }

export type HotspotAction = Interaction | { kind: 'product-slot'; vendorId: string; productIndex: number; label: string }

export type HotspotDefinition = {
  id: string
  anchor: HotspotAnchor
  action: HotspotAction
}

export type RoomCollider =
  | { kind: 'box'; center: Vec2; size: Vec2 }
  | { kind: 'circle'; center: Vec2; radius: number }

export type RoomExperienceConfig = {
  profileId: string
  catalogDocumentId?: string
}

export type RoomDefinition = {
  id: string
  label: string
  kind: 'booth'
  vendorId?: string
  position: Vec3
  rotationY: number
  footprint: Vec2
  entryAnchor: Vec3
  discoveryRadius: number
  theme: BoothTheme
  asset: WorldAsset
  experience?: RoomExperienceConfig
  hotspots: HotspotDefinition[]
  colliders: RoomCollider[]
}

export type WorldBounds = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export type CircleCollider = {
  kind: 'circle'
  x: number
  z: number
  radius: number
}

export type WorldDefinition = {
  id: string
  name: string
  version: number
  spawn: Vec3
  bounds: WorldBounds
  rooms: RoomDefinition[]
  staticColliders: CircleCollider[]
}
