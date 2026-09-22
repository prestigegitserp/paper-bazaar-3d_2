import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useAppStore } from '../store'

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number }
  ) => number
  cancelIdleCallback?: (id: number) => void
}

export default function MaterialEnvironment() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const invalidate = useThree((state) => state.invalidate)
  const quality = useAppStore((state) => state.quality)

  useEffect(() => {
    const idleWindow = window as IdleWindow
    let disposed = false
    let target: ReturnType<PMREMGenerator['fromScene']> | null = null
    let pmrem: PMREMGenerator | null = null
    let idleId: number | null = null
    let timer: number | null = null

    const buildEnvironment = () => {
      if (disposed) return

      pmrem = new PMREMGenerator(gl)
      pmrem.compileCubemapShader()
      const room = new RoomEnvironment()
      target = pmrem.fromScene(room, 0.04)

      if (disposed) {
        target.dispose()
        pmrem.dispose()
        return
      }

      scene.environment = target.texture
      invalidate()
    }

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(buildEnvironment, { timeout: 650 })
    } else {
      timer = window.setTimeout(buildEnvironment, 80)
    }

    return () => {
      disposed = true
      if (idleId !== null) idleWindow.cancelIdleCallback?.(idleId)
      if (timer !== null) window.clearTimeout(timer)
      if (target && scene.environment === target.texture) scene.environment = null
      target?.dispose()
      pmrem?.dispose()
      invalidate()
    }
  }, [gl, invalidate, scene])

  useEffect(() => {
    scene.environmentIntensity = quality === 'cinematic' ? 0.82 : 0.58
    invalidate()
  }, [invalidate, quality, scene])

  return null
}
