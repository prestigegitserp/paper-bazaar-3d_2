import { useEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import {
  Color,
  Vector2,
  type Side
} from 'three'
import { useAppStore } from '../../store'
import type { SurfacePresetId } from '../../world/boothProfiles'
import { getPbrSurfaceAsset } from './pbrSurfaceRegistry'
import {
  acquirePbrTextureSet,
  releasePbrTextureSet,
  type PbrTextureLease,
  type PbrTextureSet
} from './pbrTextureCache'
import {
  getSurfacePreset,
  getSurfaceTextureVariant
} from './proceduralSurfaces'
import { getSurfacePhysicalProfile } from './surfacePhysicalProfiles'
import { preferredPbrResolution } from './textureQuality'
import { warmPbrTextureSet } from './textureUploadScheduler'
import {
  getMicroNormalScale,
  getMicroNormalVariant,
  getMicroRoughnessVariant
} from './microDetailTextures'

type LoadPriority = 'critical' | 'deferred'
type PbrPhase = 'fallback' | 'albedo' | 'full'

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number }
  ) => number
  cancelIdleCallback?: (id: number) => void
}

function stableDelay(surface: SurfacePresetId) {
  let hash = 17
  for (const char of surface) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return 100 + (hash % 520)
}

function usePbrPhase(
  surface: SurfacePresetId,
  hasPbr: boolean,
  quality: 'cinematic' | 'balanced',
  started: boolean,
  loadPriority: LoadPriority,
  allowFullUpgrade: boolean
) {
  const [phase, setPhase] = useState<PbrPhase>(
    hasPbr && loadPriority === 'critical' ? 'albedo' : 'fallback'
  )

  useEffect(() => {
    if (!hasPbr) {
      setPhase('fallback')
      return
    }

    if (phase === 'full') return

    const idleWindow = window as IdleWindow
    let albedoTimer: number | null = null
    let fullTimer: number | null = null
    let idleId: number | null = null
    let cancelled = false

    const scheduleFull = () => {
      if (quality !== 'cinematic' || !allowFullUpgrade) return
      const upgrade = () => {
        if (!cancelled) setPhase('full')
      }

      if (idleWindow.requestIdleCallback) {
        idleId = idleWindow.requestIdleCallback(upgrade, { timeout: 1800 })
      } else {
        fullTimer = window.setTimeout(upgrade, 900)
      }
    }

    if (!started) {
      if (phase !== 'albedo' && loadPriority === 'critical') setPhase('albedo')
      return () => {
        cancelled = true
      }
    }

    if (phase === 'albedo') {
      scheduleFull()
      return () => {
        cancelled = true
        if (fullTimer !== null) window.clearTimeout(fullTimer)
        if (idleId !== null) idleWindow.cancelIdleCallback?.(idleId)
      }
    }

    const delay = loadPriority === 'critical' ? 0 : stableDelay(surface)
    albedoTimer = window.setTimeout(() => {
      if (cancelled) return
      setPhase('albedo')
    }, delay)

    return () => {
      cancelled = true
      if (albedoTimer !== null) window.clearTimeout(albedoTimer)
      if (fullTimer !== null) window.clearTimeout(fullTimer)
      if (idleId !== null) idleWindow.cancelIdleCallback?.(idleId)
    }
  }, [allowFullUpgrade, hasPbr, loadPriority, phase, quality, started, surface])

  return phase
}

export default function SurfaceMaterial({
  surface,
  repeat = [2, 2],
  color,
  emissive,
  emissiveIntensity = 0,
  side,
  transparent,
  opacity,
  loadPriority = 'deferred',
  allowHighResolution = false
}: {
  surface: SurfacePresetId
  repeat?: [number, number]
  color?: string
  emissive?: string
  emissiveIntensity?: number
  side?: Side
  transparent?: boolean
  opacity?: number
  loadPriority?: LoadPriority
  allowHighResolution?: boolean
}) {
  const quality = useAppStore((state) => state.quality)
  const started = useAppStore((state) => state.started)
  const gl = useThree((state) => state.gl)
  const performanceCurrent = useThree((state) => state.performance.current)
  const preset = getSurfacePreset(surface)
  const physical = getSurfacePhysicalProfile(surface)
  const pbrAsset = getPbrSurfaceAsset(surface)
  const phase = usePbrPhase(
    surface,
    Boolean(pbrAsset),
    quality,
    started,
    loadPriority,
    performanceCurrent > 0.97
  )
  const resolution = phase === 'full'
    ? preferredPbrResolution(quality, allowHighResolution)
    : '1k'

  const [loadedPbr, setLoadedPbr] = useState<PbrTextureSet | null>(null)
  const textureAnisotropy = quality === 'cinematic'
    ? Math.min(6, gl.capabilities.getMaxAnisotropy())
    : Math.min(3, gl.capabilities.getMaxAnisotropy())

  const fallback = useMemo(
    () => getSurfaceTextureVariant(surface, repeat, textureAnisotropy),
    [repeat[0], repeat[1], surface, textureAnisotropy]
  )
  const microNormal = useMemo(
    () => getMicroNormalVariant(surface, repeat, textureAnisotropy),
    [repeat[0], repeat[1], surface, textureAnisotropy]
  )
  const microRoughness = useMemo(
    () => getMicroRoughnessVariant(surface, repeat, textureAnisotropy),
    [repeat[0], repeat[1], surface, textureAnisotropy]
  )

  useEffect(() => {
    if (!pbrAsset || phase === 'fallback') {
      setLoadedPbr(null)
      return
    }

    let active = true
    let lease: PbrTextureLease | null = null
    let readyForRelease = false
    setLoadedPbr(null)

    void (async () => {
      try {
        const nextLease = await acquirePbrTextureSet(surface, {
          repeat,
          anisotropy: textureAnisotropy,
          full: phase === 'full',
          priority: loadPriority === 'critical'
            ? 'critical'
            : phase === 'full'
              ? 'background'
              : 'normal',
          resolution
        })
        lease = nextLease
        if (!nextLease) return

        await warmPbrTextureSet(gl, nextLease.set)
        readyForRelease = true

        if (!active) {
          releasePbrTextureSet(nextLease)
          lease = null
          return
        }

        setLoadedPbr(nextLease.set)
      } catch {
        if (lease) {
          releasePbrTextureSet(lease)
          lease = null
        }
        if (active) setLoadedPbr(null)
      }
    })()

    return () => {
      active = false
      if (lease && readyForRelease) {
        releasePbrTextureSet(lease)
        lease = null
      }
    }
  }, [
    gl,
    loadPriority,
    pbrAsset,
    phase,
    repeat[0],
    repeat[1],
    resolution,
    surface,
    textureAnisotropy
  ])

  const map = loadedPbr?.map ?? fallback.map
  const normalMap = loadedPbr?.normalMap ?? microNormal
  const baseNormalScale = loadedPbr?.normalMap
    ? (pbrAsset?.normalScale ?? 0.5) * physical.normalScaleMultiplier
    : getMicroNormalScale(surface)
  const roughnessMap = loadedPbr?.roughnessMap ?? microRoughness

  return (
    <meshStandardMaterial
      color={color ? new Color(color) : undefined}
      map={map}
      normalMap={normalMap}
      normalScale={new Vector2(baseNormalScale, baseNormalScale)}
      roughnessMap={roughnessMap}
      roughness={preset.roughness}
      metalness={preset.metalness}
      envMapIntensity={physical.envMapIntensity}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      side={side}
      transparent={transparent}
      opacity={opacity}
    />
  )
}
