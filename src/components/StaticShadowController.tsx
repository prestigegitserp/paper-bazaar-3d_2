import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useAppStore } from '../store'

export default function StaticShadowController() {
  const gl = useThree((state) => state.gl)
  const invalidate = useThree((state) => state.invalidate)
  const started = useAppStore((state) => state.started)
  const quality = useAppStore((state) => state.quality)

  useEffect(() => {
    gl.shadowMap.autoUpdate = false

    if (!started || quality !== 'cinematic') {
      gl.shadowMap.needsUpdate = false
      return
    }

    gl.shadowMap.needsUpdate = true
    invalidate()

    return () => {
      gl.shadowMap.autoUpdate = false
    }
  }, [gl, invalidate, quality, started])

  return null
}
