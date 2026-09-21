import type { RoomCollider, Vec2, Vec3 } from '../types'

export const bazaarShopFootprint: Vec2 = [5.6, 7.2]
export const bazaarShopEntryAnchor: Vec3 = [3.0, 1.68, 0]

export const bazaarShopColliders: RoomCollider[] = [
  { kind: 'box', center: [-2.74, 0], size: [0.34, 7.25] },
  { kind: 'box', center: [0, -3.48], size: [5.6, 0.32] },
  { kind: 'box', center: [0, 3.48], size: [5.6, 0.32] },
  { kind: 'box', center: [-2.18, 0], size: [0.72, 6.45] },
  { kind: 'box', center: [1.05, -1.15], size: [1.0, 2.85] },
  { kind: 'box', center: [-0.35, 1.68], size: [1.05, 1.0] },
  { kind: 'box', center: [1.48, 1.66], size: [1.05, 1.0] }
]
