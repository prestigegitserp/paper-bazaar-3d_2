import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useAppStore } from '../store'

const INPUT_REGRESS_INTERVAL_MS = 80
const PLAYER_REGRESS_DISTANCE_SQ = 0.0016

export default function MotionPerformanceController() {
  const regress = useThree((state) => state.performance.regress)
  const started = useAppStore((state) => state.started)

  useEffect(() => {
    if (!started) return

    const initial = useAppStore.getState().player
    let lastX = initial.x
    let lastZ = initial.z
    let lastInputAt = 0

    const regressForMotion = () => {
      const now = window.performance.now()
      if (now - lastInputAt < INPUT_REGRESS_INTERVAL_MS) return
      lastInputAt = now
      regress()
    }

    const unsubscribe = useAppStore.subscribe((state) => {
      const dx = state.player.x - lastX
      const dz = state.player.z - lastZ
      if (dx * dx + dz * dz <= PLAYER_REGRESS_DISTANCE_SQ) return

      lastX = state.player.x
      lastZ = state.player.z
      regressForMotion()
    })

    const onPointerMove = () => {
      if (document.pointerLockElement) regressForMotion()
    }

    const onTouchMove = () => regressForMotion()

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      unsubscribe()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [regress, started])

  return null
}
