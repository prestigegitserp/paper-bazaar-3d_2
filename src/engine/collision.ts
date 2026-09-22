import { rotateLocalXZ } from '../world/spatial'
import type { RoomDefinition, WorldDefinition } from '../world/types'

export type AabbCollider = { minX: number; maxX: number; minZ: number; maxZ: number }
export type CircleWorldCollider = { x: number; z: number; radius: number }
export type WorldCollisionSet = { boxes: AabbCollider[]; circles: CircleWorldCollider[] }

function localPoint(room: RoomDefinition, x: number, z: number) {
  const rotated = rotateLocalXZ(x, z, room.rotationY)
  return { x: room.position[0] + rotated.x, z: room.position[2] + rotated.z }
}

function aabbFromLocalRect(room: RoomDefinition, centerX: number, centerZ: number, width: number, depth: number): AabbCollider {
  const corners = [
    localPoint(room, centerX - width / 2, centerZ - depth / 2),
    localPoint(room, centerX + width / 2, centerZ - depth / 2),
    localPoint(room, centerX - width / 2, centerZ + depth / 2),
    localPoint(room, centerX + width / 2, centerZ + depth / 2)
  ]

  return {
    minX: Math.min(...corners.map((point) => point.x)),
    maxX: Math.max(...corners.map((point) => point.x)),
    minZ: Math.min(...corners.map((point) => point.z)),
    maxZ: Math.max(...corners.map((point) => point.z))
  }
}

export function buildWorldColliders(world: WorldDefinition): WorldCollisionSet {
  const boxes: AabbCollider[] = []
  const circles: CircleWorldCollider[] = world.staticColliders.map(({ x, z, radius }) => ({ x, z, radius }))

  for (const room of world.rooms) {
    for (const collider of room.colliders) {
      if (collider.kind === 'box') {
        boxes.push(aabbFromLocalRect(room, collider.center[0], collider.center[1], collider.size[0], collider.size[1]))
      } else {
        const center = localPoint(room, collider.center[0], collider.center[1])
        circles.push({ x: center.x, z: center.z, radius: collider.radius })
      }
    }
  }

  return { boxes, circles }
}

export function isPositionBlocked(world: WorldDefinition, collisions: WorldCollisionSet, x: number, z: number, radius: number) {
  const { bounds } = world
  if (x < bounds.minX + radius || x > bounds.maxX - radius || z < bounds.minZ + radius || z > bounds.maxZ - radius) return true

  if (collisions.boxes.some((box) => x > box.minX - radius && x < box.maxX + radius && z > box.minZ - radius && z < box.maxZ + radius)) {
    return true
  }

  return collisions.circles.some((collider) => {
    const dx = x - collider.x
    const dz = z - collider.z
    const combined = collider.radius + radius
    return dx * dx + dz * dz < combined * combined
  })
}
