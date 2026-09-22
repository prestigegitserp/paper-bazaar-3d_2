import { useFrame, useThree } from '@react-three/fiber'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Vector3 } from 'three'
import type { Vendor } from '../domain/catalog'
import { clearRoomRuntimeMode, setRoomRuntimeMode, type RoomRuntimeMode } from '../engine/runtimeMetrics'
import { getAssetPresentationProfile } from '../presentation/assetPresentationRegistry'
import { useAppStore } from '../store'
import type { RoomDefinition } from '../world/types'
import Booth from './Booth'
import ProceduralRoomProxy from './ProceduralRoomProxy'
import RoomAssetBoundary from './RoomAssetBoundary'
import WorldTextPanel from './WorldTextPanel'

const PROCEDURAL_BEHIND_PROBES = 4

let fileRoomModulePromise: Promise<typeof import('./FileRoomRenderer')> | null = null

function loadFileRoomModule() {
  if (!fileRoomModulePromise) fileRoomModulePromise = import('./FileRoomRenderer')
  return fileRoomModulePromise
}

const FileRoomRenderer = lazy(loadFileRoomModule)

function fileAssetUrl(room: RoomDefinition) {
  if (room.asset.kind === 'gltf') return room.asset.url
  if (room.asset.kind === 'scan' && room.asset.format === 'gltf') return room.asset.url
  return null
}

type RoomRuntimeState = {
  fileReady: boolean
  fileVisible: boolean
  proceduralDetailed: boolean
}

function useRoomRuntime(room: RoomDefinition): RoomRuntimeState {
  const started = useAppStore((state) => state.started)
  const camera = useThree((state) => state.camera)
  const lod = getAssetPresentationProfile(room).lod
  const url = fileAssetUrl(room)
  const [runtime, setRuntime] = useState<RoomRuntimeState>(() => ({
    fileReady: !url,
    fileVisible: false,
    proceduralDetailed: false
  }))
  const runtimeRef = useRef(runtime)
  const frame = useRef(0)
  const behindProbes = useRef(0)
  const prefetchStarted = useRef(false)
  const forward = useRef(new Vector3())
  const toRoom = useRef(new Vector3())

  useEffect(() => {
    const reset = {
      fileReady: !url,
      fileVisible: false,
      proceduralDetailed: false
    }
    runtimeRef.current = reset
    setRuntime(reset)
    frame.current = 0
    behindProbes.current = 0
    prefetchStarted.current = false
  }, [room.asset.assetId, room.asset.version, url])

  const patchRuntime = (patch: Partial<RoomRuntimeState>) => {
    const current = runtimeRef.current
    const next = { ...current, ...patch }
    if (
      next.fileReady === current.fileReady
      && next.fileVisible === current.fileVisible
      && next.proceduralDetailed === current.proceduralDetailed
    ) return
    runtimeRef.current = next
    setRuntime(next)
  }

  useFrame(() => {
    frame.current += 1

    if (room.asset.kind === 'procedural') {
      if (!started) {
        behindProbes.current = 0
        if (runtimeRef.current.proceduralDetailed) patchRuntime({ proceduralDetailed: false })
        return
      }

      if (frame.current % 12 !== 0) return

      const state = useAppStore.getState()
      if (state.activeRoomId === room.id) {
        behindProbes.current = 0
        if (!runtimeRef.current.proceduralDetailed) patchRuntime({ proceduralDetailed: true })
        return
      }

      const dx = state.player.x - room.position[0]
      const dz = state.player.z - room.position[2]
      const distanceSq = dx * dx + dz * dz
      const forceRadiusSq = lod.forceDetailRadius * lod.forceDetailRadius
      const wakeRadiusSq = lod.proceduralWakeRadius * lod.proceduralWakeRadius
      const sleepRadiusSq = lod.proceduralSleepRadius * lod.proceduralSleepRadius

      toRoom.current.set(room.position[0] - camera.position.x, 0, room.position[2] - camera.position.z)
      const toRoomLengthSq = toRoom.current.lengthSq()
      const viewDot = toRoomLengthSq > 0.0001
        ? camera.getWorldDirection(forward.current).setY(0).normalize().dot(toRoom.current.normalize())
        : 1

      if (!runtimeRef.current.proceduralDetailed) {
        if (
          distanceSq <= forceRadiusSq
          || (distanceSq <= wakeRadiusSq && viewDot >= lod.viewWakeDot)
        ) {
          behindProbes.current = 0
          patchRuntime({ proceduralDetailed: true })
        }
        return
      }

      if (distanceSq >= sleepRadiusSq) {
        behindProbes.current = 0
        patchRuntime({ proceduralDetailed: false })
        return
      }

      if (distanceSq > forceRadiusSq && viewDot <= lod.viewSleepDot) {
        behindProbes.current += 1
        if (behindProbes.current >= PROCEDURAL_BEHIND_PROBES) {
          behindProbes.current = 0
          patchRuntime({ proceduralDetailed: false })
        }
        return
      }

      behindProbes.current = 0
      return
    }

    if (!url) return

    if (!started) {
      if (runtimeRef.current.fileVisible) patchRuntime({ fileVisible: false })
      return
    }

    if (frame.current % 10 !== 0) return

    const state = useAppStore.getState()
    const dx = state.player.x - room.position[0]
    const dz = state.player.z - room.position[2]
    const distanceSq = dx * dx + dz * dz
    const prefetchRadiusSq = lod.prefetchRadius * lod.prefetchRadius
    const revealRadiusSq = lod.revealRadius * lod.revealRadius
    const sleepRadiusSq = lod.sleepRadius * lod.sleepRadius

    const preload = () => {
      if (prefetchStarted.current) return
      prefetchStarted.current = true
      void loadFileRoomModule().then((module) => module.preloadFileRoom(url))
    }

    if (state.activeRoomId === room.id) {
      preload()
      patchRuntime({ fileReady: true, fileVisible: true })
      return
    }

    if (distanceSq <= prefetchRadiusSq) preload()

    if (distanceSq <= revealRadiusSq) {
      preload()
      patchRuntime({ fileReady: true, fileVisible: true })
      return
    }

    if (runtimeRef.current.fileVisible && distanceSq >= sleepRadiusSq) {
      patchRuntime({ fileVisible: false })
    }
  })

  return runtime
}

function UnsupportedRoom({ room }: { room: RoomDefinition }) {
  return (
    <group position={room.position as [number, number, number]} rotation={[0, room.rotationY, 0]}>
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[3.2, 2.8, 3.2]} />
        <meshStandardMaterial color="#d7dcdd" wireframe emissive="#789096" emissiveIntensity={0.12} />
      </mesh>
      <WorldTextPanel
        position={[0, 2.8, 1.62]}
        width={2.6}
        height={0.42}
        background="#39474b"
        lines={[{ text: `Renderer pending · ${room.asset.kind === 'scan' ? room.asset.format : room.asset.kind}`, size: 44, color: '#eef6f7', weight: 800, direction: 'ltr' }]}
      />
    </group>
  )
}

function RoomRendererInner({
  room,
  vendor,
  runtime
}: {
  room: RoomDefinition
  vendor?: Vendor
  runtime: RoomRuntimeState
}) {
  if (room.asset.kind === 'procedural') {
    return runtime.proceduralDetailed
      ? <Booth room={room} vendor={vendor} />
      : <ProceduralRoomProxy room={room} vendor={vendor} />
  }

  if (room.asset.kind === 'gltf') {
    if (!runtime.fileReady || !runtime.fileVisible) return <ProceduralRoomProxy room={room} vendor={vendor} />
    return <FileRoomRenderer room={room} vendor={vendor} url={room.asset.url} scale={room.asset.scale} />
  }

  if (room.asset.kind === 'scan' && room.asset.format === 'gltf') {
    if (!runtime.fileReady || !runtime.fileVisible) return <ProceduralRoomProxy room={room} vendor={vendor} />
    return <FileRoomRenderer room={room} vendor={vendor} url={room.asset.url} scale={room.asset.scale} />
  }

  return <UnsupportedRoom room={room} />
}

export default function RoomRenderer({ room, vendor }: { room: RoomDefinition; vendor?: Vendor }) {
  const clearAssetError = useAppStore((state) => state.clearAssetError)
  const runtime = useRoomRuntime(room)

  const runtimeMode: RoomRuntimeMode = room.asset.kind === 'procedural'
    ? runtime.proceduralDetailed ? 'procedural-detail' : 'proxy'
    : runtime.fileReady && runtime.fileVisible
      ? 'file-detail'
      : 'proxy'

  useEffect(() => {
    setRoomRuntimeMode(room.id, runtimeMode)
    return () => clearRoomRuntimeMode(room.id)
  }, [room.id, runtimeMode])

  useEffect(() => {
    clearAssetError(room.id)
  }, [clearAssetError, room.asset.version, room.id])

  return (
    <RoomAssetBoundary key={`${room.id}:${room.asset.version}`} room={room}>
      <Suspense fallback={<ProceduralRoomProxy room={room} vendor={vendor} />}>
        <RoomRendererInner room={room} vendor={vendor} runtime={runtime} />
      </Suspense>
    </RoomAssetBoundary>
  )
}
