import { useFrame, useThree } from '@react-three/fiber'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Vector3 } from 'three'
import type { Vendor } from '../domain/catalog'
import { clearRoomRuntimeMode, setRoomRuntimeMode, type RoomRuntimeMode } from '../engine/runtimeMetrics'
import { useAppStore } from '../store'
import type { RoomDefinition } from '../world/types'
import Booth from './Booth'
import ProceduralRoomProxy from './ProceduralRoomProxy'
import RoomAssetBoundary from './RoomAssetBoundary'
import WorldTextPanel from './WorldTextPanel'

const FILE_PREFETCH_RADIUS = 24
const FILE_REVEAL_RADIUS = 18
const FILE_SLEEP_RADIUS = 22
const FILE_PREFETCH_RADIUS_SQ = FILE_PREFETCH_RADIUS * FILE_PREFETCH_RADIUS
const FILE_REVEAL_RADIUS_SQ = FILE_REVEAL_RADIUS * FILE_REVEAL_RADIUS
const FILE_SLEEP_RADIUS_SQ = FILE_SLEEP_RADIUS * FILE_SLEEP_RADIUS

const PROCEDURAL_FORCE_RADIUS = 6.8
const PROCEDURAL_WAKE_RADIUS = 11.5
const PROCEDURAL_SLEEP_RADIUS = 15.5
const PROCEDURAL_FORCE_RADIUS_SQ = PROCEDURAL_FORCE_RADIUS * PROCEDURAL_FORCE_RADIUS
const PROCEDURAL_WAKE_RADIUS_SQ = PROCEDURAL_WAKE_RADIUS * PROCEDURAL_WAKE_RADIUS
const PROCEDURAL_SLEEP_RADIUS_SQ = PROCEDURAL_SLEEP_RADIUS * PROCEDURAL_SLEEP_RADIUS
const PROCEDURAL_WAKE_VIEW_DOT = -0.18
const PROCEDURAL_SLEEP_VIEW_DOT = -0.72
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

function useProceduralDetail(room: RoomDefinition) {
  const started = useAppStore((state) => state.started)
  const camera = useThree((state) => state.camera)
  const [detailed, setDetailed] = useState(false)
  const frame = useRef(0)
  const behindProbes = useRef(0)
  const forward = useRef(new Vector3())
  const toRoom = useRef(new Vector3())

  useEffect(() => {
    setDetailed(false)
    frame.current = 0
    behindProbes.current = 0
  }, [room.asset.assetId, room.asset.version])

  useFrame(() => {
    if (room.asset.kind !== 'procedural') return

    if (!started) {
      behindProbes.current = 0
      if (detailed) setDetailed(false)
      return
    }

    frame.current = (frame.current + 1) % 12
    if (frame.current !== 0) return

    const state = useAppStore.getState()
    if (state.activeRoomId === room.id) {
      behindProbes.current = 0
      if (!detailed) setDetailed(true)
      return
    }

    const dx = state.player.x - room.position[0]
    const dz = state.player.z - room.position[2]
    const distanceSq = dx * dx + dz * dz

    toRoom.current.set(room.position[0] - camera.position.x, 0, room.position[2] - camera.position.z)
    const toRoomLengthSq = toRoom.current.lengthSq()
    const viewDot = toRoomLengthSq > 0.0001
      ? camera.getWorldDirection(forward.current).setY(0).normalize().dot(toRoom.current.normalize())
      : 1

    if (!detailed) {
      if (
        distanceSq <= PROCEDURAL_FORCE_RADIUS_SQ
        || (distanceSq <= PROCEDURAL_WAKE_RADIUS_SQ && viewDot >= PROCEDURAL_WAKE_VIEW_DOT)
      ) {
        behindProbes.current = 0
        setDetailed(true)
      }
      return
    }

    if (distanceSq >= PROCEDURAL_SLEEP_RADIUS_SQ) {
      behindProbes.current = 0
      setDetailed(false)
      return
    }

    if (distanceSq > PROCEDURAL_FORCE_RADIUS_SQ && viewDot <= PROCEDURAL_SLEEP_VIEW_DOT) {
      behindProbes.current += 1
      if (behindProbes.current >= PROCEDURAL_BEHIND_PROBES) {
        behindProbes.current = 0
        setDetailed(false)
      }
      return
    }

    behindProbes.current = 0
  })

  return detailed
}

function useProgressiveFileAsset(room: RoomDefinition) {
  const started = useAppStore((state) => state.started)
  const url = fileAssetUrl(room)
  const [ready, setReady] = useState(() => !url)
  const [visible, setVisible] = useState(false)
  const prefetchStarted = useRef(false)
  const streamFrame = useRef(0)

  useEffect(() => {
    prefetchStarted.current = false
    streamFrame.current = 0
    setReady(!url)
    setVisible(false)
  }, [room.asset.assetId, room.asset.version, url])

  useFrame(() => {
    if (!url) return

    if (!started) {
      if (visible) setVisible(false)
      return
    }

    streamFrame.current = (streamFrame.current + 1) % 10
    if (streamFrame.current !== 0) return

    const state = useAppStore.getState()
    const dx = state.player.x - room.position[0]
    const dz = state.player.z - room.position[2]
    const distanceSq = dx * dx + dz * dz

    const preload = () => {
      if (prefetchStarted.current) return
      prefetchStarted.current = true
      void loadFileRoomModule().then((module) => module.preloadFileRoom(url))
    }

    if (state.activeRoomId === room.id) {
      preload()
      if (!ready) setReady(true)
      if (!visible) setVisible(true)
      return
    }

    if (distanceSq <= FILE_PREFETCH_RADIUS_SQ) preload()

    if (distanceSq <= FILE_REVEAL_RADIUS_SQ) {
      preload()
      if (!ready) setReady(true)
      if (!visible) setVisible(true)
      return
    }

    if (visible && distanceSq >= FILE_SLEEP_RADIUS_SQ) {
      setVisible(false)
    }
  })

  return { ready, visible }
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
  fileReady,
  fileVisible,
  proceduralDetailed
}: {
  room: RoomDefinition
  vendor?: Vendor
  fileReady: boolean
  fileVisible: boolean
  proceduralDetailed: boolean
}) {
  if (room.asset.kind === 'procedural') {
    return proceduralDetailed
      ? <Booth room={room} vendor={vendor} />
      : <ProceduralRoomProxy room={room} vendor={vendor} />
  }

  if (room.asset.kind === 'gltf') {
    if (!fileReady || !fileVisible) return <ProceduralRoomProxy room={room} vendor={vendor} />
    return <FileRoomRenderer room={room} vendor={vendor} url={room.asset.url} scale={room.asset.scale} />
  }

  if (room.asset.kind === 'scan' && room.asset.format === 'gltf') {
    if (!fileReady || !fileVisible) return <ProceduralRoomProxy room={room} vendor={vendor} />
    return <FileRoomRenderer room={room} vendor={vendor} url={room.asset.url} scale={room.asset.scale} />
  }

  return <UnsupportedRoom room={room} />
}

export default function RoomRenderer({ room, vendor }: { room: RoomDefinition; vendor?: Vendor }) {
  const clearAssetError = useAppStore((state) => state.clearAssetError)
  const fileState = useProgressiveFileAsset(room)
  const proceduralDetailed = useProceduralDetail(room)

  const runtimeMode: RoomRuntimeMode = room.asset.kind === 'procedural'
    ? proceduralDetailed ? 'procedural-detail' : 'proxy'
    : fileState.ready && fileState.visible
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
        <RoomRendererInner
          room={room}
          vendor={vendor}
          fileReady={fileState.ready}
          fileVisible={fileState.visible}
          proceduralDetailed={proceduralDetailed}
        />
      </Suspense>
    </RoomAssetBoundary>
  )
}
