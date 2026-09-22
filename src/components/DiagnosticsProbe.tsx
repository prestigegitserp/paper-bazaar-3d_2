import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { readRuntimeMetrics } from '../engine/runtimeMetrics'
import { getInteractionTargets } from '../engine/interactionTargets'
import { useAppStore } from '../store'

export default function DiagnosticsProbe() {
  const { gl } = useThree()
  const setDiagnostics = useAppStore((state) => state.setDiagnostics)
  const frame = useRef(0)
  const elapsed = useRef(0)
  const lastRaycasts = useRef(0)
  const lastOcclusionRaycasts = useRef(0)

  useFrame((_, delta) => {
    frame.current += 1
    elapsed.current += delta
    if (frame.current % 30 !== 0) return

    const seconds = Math.max(0.001, elapsed.current)
    const runtime = readRuntimeMetrics()
    const raycastsPerSecond = (runtime.interactionRaycasts - lastRaycasts.current) / seconds
    const occlusionRaycastsPerSecond = (runtime.interactionOcclusionRaycasts - lastOcclusionRaycasts.current) / seconds
    const fps = 30 / seconds

    lastRaycasts.current = runtime.interactionRaycasts
    lastOcclusionRaycasts.current = runtime.interactionOcclusionRaycasts
    elapsed.current = 0

    setDiagnostics({
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      fps,
      frameMs: 1000 / Math.max(1, fps),
      raycastsPerSecond,
      occlusionRaycastsPerSecond,
      interactionTargets: getInteractionTargets().length,
      pixelRatio: gl.getPixelRatio(),
      proxyRooms: runtime.proxyRooms,
      detailedRooms: runtime.detailedRooms,
      fileRooms: runtime.fileRooms
    })
  })

  return null
}
