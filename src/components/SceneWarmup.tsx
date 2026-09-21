import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useAppStore } from '../store'

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number }
  ) => number
  cancelIdleCallback?: (id: number) => void
}

export default function SceneWarmup() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const started = useAppStore((state) => state.started)
  const quality = useAppStore((state) => state.quality)
  const activeRoomId = useAppStore((state) => state.activeRoomId)

  useEffect(() => {
    if (!started) return

    const idleWindow = window as IdleWindow
    let cancelled = false
    let idleId: number | null = null
    let timer: number | null = null

    const compile = () => {
      if (cancelled) return
      void gl.compileAsync(scene, camera).catch(() => {
        // Rendering remains authoritative; warm-up failure must never block the scene.
      })
    }

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(compile, { timeout: 1400 })
    } else {
      timer = window.setTimeout(compile, 220)
    }

    return () => {
      cancelled = true
      if (idleId !== null) idleWindow.cancelIdleCallback?.(idleId)
      if (timer !== null) window.clearTimeout(timer)
    }
  }, [activeRoomId, camera, gl, quality, scene, started])

  return null
}
