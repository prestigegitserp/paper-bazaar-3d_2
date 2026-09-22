export type RoomRuntimeMode = 'proxy' | 'procedural-detail' | 'file-detail'

let interactionRaycasts = 0
let interactionOcclusionRaycasts = 0
const roomModes = new Map<string, RoomRuntimeMode>()

export function noteInteractionRaycast() {
  interactionRaycasts += 1
}

export function noteInteractionOcclusionRaycast() {
  interactionOcclusionRaycasts += 1
}

export function setRoomRuntimeMode(roomId: string, mode: RoomRuntimeMode) {
  roomModes.set(roomId, mode)
}

export function clearRoomRuntimeMode(roomId: string) {
  roomModes.delete(roomId)
}

export function readRuntimeMetrics() {
  let proxyRooms = 0
  let detailedRooms = 0
  let fileRooms = 0

  for (const mode of roomModes.values()) {
    if (mode === 'proxy') proxyRooms += 1
    if (mode === 'procedural-detail') detailedRooms += 1
    if (mode === 'file-detail') fileRooms += 1
  }

  return {
    interactionRaycasts,
    interactionOcclusionRaycasts,
    proxyRooms,
    detailedRooms,
    fileRooms
  }
}
