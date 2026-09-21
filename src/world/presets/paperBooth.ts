import type { RoomCollider, Vec2, Vec3 } from '../types'

export const paperBoothFootprint: Vec2 = [7.2, 9.5]
export const paperBoothEntryAnchor: Vec3 = [4.15, 1.72, 0]

export const paperBoothColliders: RoomCollider[] = [
  { kind: 'box', center: [-3.58, 0], size: [0.4, 9.6] },
  { kind: 'box', center: [0, -4.68], size: [7.2, 0.4] },
  { kind: 'box', center: [0, 4.68], size: [7.2, 0.4] },
  { kind: 'box', center: [0.75, 0], size: [2.9, 1.9] },
  { kind: 'box', center: [-1.2, -2.65], size: [1.9, 1.6] },
  { kind: 'box', center: [-1.2, 2.65], size: [1.9, 1.6] },
  { kind: 'box', center: [2.1, -1.55], size: [1.24, 1.24] },
  { kind: 'box', center: [2.1, 1.55], size: [1.24, 1.24] }
]
