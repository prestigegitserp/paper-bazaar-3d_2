import type { RenderQuality } from '../../store'
import type { PbrResolution } from './pbrSurfaceRegistry'

type NavigatorWithMemory = Navigator & { deviceMemory?: number }

export function preferredPbrResolution(
  quality: RenderQuality,
  allowHighResolution: boolean
): PbrResolution {
  if (!allowHighResolution || quality !== 'cinematic' || typeof window === 'undefined') return '1k'

  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const memory = (navigator as NavigatorWithMemory).deviceMemory
  const cores = navigator.hardwareConcurrency
  const wideEnough = window.innerWidth >= 1100
  const memoryOkay = typeof memory !== 'number' || memory >= 6
  const cpuOkay = typeof cores !== 'number' || cores >= 4

  return !coarse && wideEnough && memoryOkay && cpuOkay ? '2k' : '1k'
}
