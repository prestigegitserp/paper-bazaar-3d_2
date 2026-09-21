import type { RoomDefinition, Vec3, WorldDefinition } from './types'

export function rotateLocalXZ(x: number, z: number, rotationY: number) {
  const sin = Math.sin(rotationY)
  const cos = Math.cos(rotationY)
  return { x: x * cos + z * sin, z: -x * sin + z * cos }
}

export function roomLocalToWorld(room: RoomDefinition, point: Vec3): Vec3 {
  const rotated = rotateLocalXZ(point[0], point[2], room.rotationY)
  return [room.position[0] + rotated.x, room.position[1] + point[1], room.position[2] + rotated.z]
}

export function worldPointToRoomLocal(room: RoomDefinition, x: number, z: number) {
  const dx = x - room.position[0]
  const dz = z - room.position[2]
  const sin = Math.sin(-room.rotationY)
  const cos = Math.cos(-room.rotationY)
  return { x: dx * cos + dz * sin, z: -dx * sin + dz * cos }
}

export function roomEntryPoint(room: RoomDefinition): Vec3 {
  return roomLocalToWorld(room, room.entryAnchor)
}

export function yawToLookAt(from: Vec3, target: Vec3) {
  const dx = target[0] - from[0]
  const dz = target[2] - from[2]
  return Math.atan2(-dx, -dz)
}

export function roomEntryYaw(room: RoomDefinition) {
  return yawToLookAt(roomEntryPoint(room), [room.position[0], roomEntryPoint(room)[1], room.position[2]])
}

function isInsideRoom(room: RoomDefinition, x: number, z: number) {
  const local = worldPointToRoomLocal(room, x, z)
  const [width, depth] = room.footprint
  return Math.abs(local.x) <= width / 2 + 0.35 && Math.abs(local.z) <= depth / 2 + 0.35
}

function discoveryDistance(room: RoomDefinition, x: number, z: number) {
  const local = worldPointToRoomLocal(room, x, z)
  if (Math.abs(local.x) > room.footprint[0] / 2 + 1.2) return Number.POSITIVE_INFINITY

  const distance = Math.hypot(x - room.position[0], z - room.position[2])
  return distance <= room.discoveryRadius ? distance : Number.POSITIVE_INFINITY
}

export function findActiveRoom(world: WorldDefinition, x: number, z: number) {
  for (const room of world.rooms) {
    if (isInsideRoom(room, x, z)) return room
  }

  let nearest: RoomDefinition | null = null
  let nearestDistance = Number.POSITIVE_INFINITY

  for (const room of world.rooms) {
    const distance = discoveryDistance(room, x, z)
    if (distance < nearestDistance) {
      nearest = room
      nearestDistance = distance
    }
  }

  return nearest
}
