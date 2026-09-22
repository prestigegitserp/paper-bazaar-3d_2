import { useFrame, useThree } from '@react-three/fiber'
import { Euler, PerspectiveCamera, Quaternion, Raycaster, Vector2, Vector3 } from 'three'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { buildWorldColliders, isPositionBlocked } from '../engine/collision'
import { interactionFromObject, interactionKey } from '../engine/interactions'
import { noteInteractionRaycast } from '../engine/runtimeMetrics'
import {
  consumeMobileLook,
  consumeMobileZoom,
  getMobileInteractSequence,
  getMobileMove,
  resetMobileInput,
  subscribeMobileInput
} from '../input/mobileInput'
import { useAppStore } from '../store'
import { findActiveRoom } from '../world/spatial'
import type { WorldDefinition } from '../world/types'

const CENTER = new Vector2(0, 0)
const RAYCASTER = new Raycaster()
const PLAYER_RADIUS = 0.32
const INTERACTION_DISTANCE = 5.2
const DEFAULT_FOV = 66
const MIN_FOV = 43
const MAX_FOV = 78

function clampFov(value: number) {
  return Math.max(MIN_FOV, Math.min(MAX_FOV, value))
}

function touchDistance(a: Touch, b: Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

export default function PlayerController({ world }: { world: WorldDefinition }) {
  const { camera, gl, scene, invalidate } = useThree()
  const started = useAppStore((state) => state.started)
  const quality = useAppStore((state) => state.quality)
  const navigationRequest = useAppStore((state) => state.navigationRequest)
  const clearNavigationRequest = useAppStore((state) => state.clearNavigationRequest)
  const setSelected = useAppStore((state) => state.setSelected)
  const setNearby = useAppStore((state) => state.setNearby)
  const setPlayer = useAppStore((state) => state.setPlayer)
  const setActiveRoom = useAppStore((state) => state.setActiveRoom)
  const performQuickAction = useAppStore((state) => state.performQuickAction)
  const keys = useRef(new Set<string>())
  const yaw = useRef(0)
  const pitch = useRef(0)
  const baseFovTarget = useRef(DEFAULT_FOV)
  const lastPinchDistance = useRef<number | null>(null)
  const touchMode = useRef(false)
  const lastMobileInteract = useRef(getMobileInteractSequence())
  const frameCount = useRef(0)
  const lastNearby = useRef('')
  const lastInteractionScanAt = useRef(-1000)
  const lastInteractionScanPosition = useRef(new Vector3())
  const lastInteractionScanQuaternion = useRef(new Quaternion())
  const lastActiveRoom = useRef<string | null>(null)
  const lastReportedPlayer = useRef(new Vector2(world.spawn[0], world.spawn[2]))
  const lookEuler = useRef(new Euler(0, 0, 0, 'YXZ'))
  const yawEuler = useRef(new Euler(0, 0, 0, 'YXZ'))
  const forward = useRef(new Vector3())
  const right = useRef(new Vector3())
  const desiredVelocity = useRef(new Vector3())
  const velocity = useRef(new Vector3())
  const stepVector = useRef(new Vector3())
  const bobPhase = useRef(0)
  const renderTimer = useRef<number | null>(null)
  const lastRenderedAt = useRef(0)
  const collisions = useMemo(() => buildWorldColliders(world), [world])

  const requestBudgetedFrame = useCallback(() => {
    const targetMs = quality === 'cinematic' ? 1000 / 60 : 1000 / 45
    const now = window.performance.now()
    const wait = Math.max(0, targetMs - (now - lastRenderedAt.current))
    if (renderTimer.current !== null) return

    renderTimer.current = window.setTimeout(() => {
      renderTimer.current = null
      invalidate()
    }, wait)
  }, [invalidate, quality])

  const clearNearby = useCallback(() => {
    if (!lastNearby.current) return
    lastNearby.current = ''
    setNearby(null)
  }, [setNearby])

  const findTarget = useCallback(() => {
    noteInteractionRaycast()
    RAYCASTER.near = 0
    RAYCASTER.far = INTERACTION_DISTANCE
    RAYCASTER.setFromCamera(CENTER, camera)
    const firstHit = RAYCASTER.intersectObjects(scene.children, true)[0]
    if (!firstHit || firstHit.distance > INTERACTION_DISTANCE) return null
    return interactionFromObject(firstHit.object)
  }, [camera, scene])

  const activateTarget = useCallback(() => {
    const target = findTarget()
    if (!target) return
    setSelected(target)
    clearNearby()
    if (document.pointerLockElement === gl.domElement) document.exitPointerLock()
  }, [clearNearby, findTarget, gl.domElement, setSelected])

  const quickTargetAction = useCallback((action: 'sample' | 'quote') => {
    const target = findTarget()
    if (!target) return
    performQuickAction(target, action)
  }, [findTarget, performQuickAction])

  const moveTo = useCallback((target: readonly [number, number, number], nextYaw: number) => {
    camera.position.set(target[0], target[1], target[2])
    yaw.current = nextYaw
    pitch.current = 0
    velocity.current.set(0, 0, 0)
    desiredVelocity.current.set(0, 0, 0)
    bobPhase.current = 0
    setPlayer(target[0], target[2])
    lastReportedPlayer.current.set(target[0], target[2])
    requestBudgetedFrame()
  }, [camera, requestBudgetedFrame, setPlayer])

  useEffect(() => {
    touchMode.current = (window.matchMedia?.('(pointer: coarse)').matches ?? false) || navigator.maxTouchPoints > 0
    moveTo(world.spawn, 0)
  }, [moveTo, world])

  useEffect(() => {
    if (!started) return
    moveTo(world.spawn, 0)
  }, [moveTo, started, world.spawn])

  useEffect(() => {
    if (!navigationRequest) return
    moveTo(navigationRequest.target, navigationRequest.yaw)
    setSelected(null)
    clearNearby()
    clearNavigationRequest()
  }, [clearNavigationRequest, clearNearby, moveTo, navigationRequest, setSelected])

  useEffect(() => {
    const canvas = gl.domElement
    const clearKeys = () => keys.current.clear()

    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return
      yaw.current -= event.movementX * 0.0022
      pitch.current -= event.movementY * 0.002
      pitch.current = Math.max(-1.25, Math.min(1.25, pitch.current))
      requestBudgetedFrame()
    }

    const onWheel = (event: WheelEvent) => {
      if (!started) return
      event.preventDefault()
      const delta = Math.max(-120, Math.min(120, event.deltaY))
      baseFovTarget.current = clampFov(baseFovTarget.current + delta * 0.045)
      requestBudgetedFrame()
    }

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault()
        lastPinchDistance.current = touchDistance(event.touches[0], event.touches[1])
      }
    }

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 2) return
      event.preventDefault()
      const distance = touchDistance(event.touches[0], event.touches[1])
      if (lastPinchDistance.current !== null) {
        const delta = lastPinchDistance.current - distance
        baseFovTarget.current = clampFov(baseFovTarget.current + delta * 0.08)
      }
      lastPinchDistance.current = distance
    }

    const onTouchEnd = () => {
      lastPinchDistance.current = null
    }

    const preventGesture = (event: Event) => {
      if (started) event.preventDefault()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      keys.current.add(event.code)
      requestBudgetedFrame()

      if (event.code === 'KeyE' && !event.repeat && document.pointerLockElement === canvas) activateTarget()
      if (event.code === 'KeyF' && !event.repeat && document.pointerLockElement === canvas) quickTargetAction('sample')
      if (event.code === 'KeyC' && !event.repeat && document.pointerLockElement === canvas) quickTargetAction('quote')

      if (event.code === 'KeyR' && !event.repeat) {
        useAppStore.getState().requestNavigation({ target: world.spawn, yaw: 0, label: 'ورودی بازار' })
      }

      if (event.code === 'Digit0' && !event.repeat) baseFovTarget.current = DEFAULT_FOV
    }

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.code)
      requestBudgetedFrame()
    }

    const onPointerLockChange = () => {
      clearKeys()
      if (document.pointerLockElement !== canvas) clearNearby()
    }

    const onCanvasMouseDown = (event: MouseEvent) => {
      if (!started || touchMode.current) return
      if (document.pointerLockElement === canvas) {
        if (event.button === 0) activateTarget()
        return
      }

      if (!useAppStore.getState().selected && canvas.requestPointerLock) {
        try {
          void canvas.requestPointerLock()
        } catch {
          // Pointer Lock can be denied by browser policy; click interactions remain available.
        }
      }
    }

    const onContextMenu = (event: MouseEvent) => {
      if (document.pointerLockElement === canvas) event.preventDefault()
    }

    const unsubscribeMobileInput = subscribeMobileInput(requestBudgetedFrame)

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onPointerLockChange)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clearKeys)
    canvas.addEventListener('mousedown', onCanvasMouseDown)
    canvas.addEventListener('contextmenu', onContextMenu)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd, { passive: true })
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: true })
    canvas.addEventListener('gesturestart', preventGesture, { passive: false })
    canvas.addEventListener('gesturechange', preventGesture, { passive: false })

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', clearKeys)
      canvas.removeEventListener('mousedown', onCanvasMouseDown)
      canvas.removeEventListener('contextmenu', onContextMenu)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('touchcancel', onTouchEnd)
      canvas.removeEventListener('gesturestart', preventGesture)
      canvas.removeEventListener('gesturechange', preventGesture)
      unsubscribeMobileInput()
      if (renderTimer.current !== null) {
        window.clearTimeout(renderTimer.current)
        renderTimer.current = null
      }
      resetMobileInput()
    }
  }, [activateTarget, clearNearby, gl.domElement, quickTargetAction, requestBudgetedFrame, started, world.spawn])

  const blocked = useCallback(
    (x: number, z: number) => isPositionBlocked(world, collisions, x, z, PLAYER_RADIUS),
    [collisions, world]
  )

  useFrame(({ clock }, delta) => {
    lastRenderedAt.current = window.performance.now()
    const mobileZoom = consumeMobileZoom()
    if (mobileZoom) baseFovTarget.current = clampFov(baseFovTarget.current + mobileZoom)

    if (!started) {
      const t = clock.elapsedTime
      camera.position.set(Math.sin(t * 0.16) * 0.35, world.spawn[1] + 0.05 + Math.sin(t * 0.38) * 0.018, world.spawn[2])
      const idleLook = lookEuler.current.set(-0.015, Math.sin(t * 0.13) * 0.035, 0, 'YXZ')
      camera.quaternion.setFromEuler(idleLook)

      if (camera instanceof PerspectiveCamera) {
        camera.fov += (DEFAULT_FOV - camera.fov) * (1 - Math.exp(-5 * delta))
        camera.updateProjectionMatrix()
      }
      return
    }

    const mobileLook = consumeMobileLook()
    if (touchMode.current && (mobileLook.x || mobileLook.y)) {
      yaw.current -= mobileLook.x * 0.0042
      pitch.current -= mobileLook.y * 0.0036
      pitch.current = Math.max(-1.2, Math.min(1.2, pitch.current))
    }

    const currentInteract = getMobileInteractSequence()
    if (currentInteract !== lastMobileInteract.current) {
      lastMobileInteract.current = currentInteract
      activateTarget()
    }

    const look = lookEuler.current.set(pitch.current, yaw.current, 0, 'YXZ')
    camera.quaternion.setFromEuler(look)

    const pointerLocked = document.pointerLockElement === gl.domElement
    const mobileMove = getMobileMove()
    const mobileMoving = Math.hypot(mobileMove.x, mobileMove.y) > 0.04
    const movementEnabled = pointerLocked || touchMode.current
    let moving = false
    let sprinting = false

    if (movementEnabled) {
      const horizontalRotation = yawEuler.current.set(0, yaw.current, 0, 'YXZ')
      forward.current.set(0, 0, -1).applyEuler(horizontalRotation)
      right.current.set(1, 0, 0).applyEuler(horizontalRotation)
      desiredVelocity.current.set(0, 0, 0)

      if (pointerLocked) {
        if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) desiredVelocity.current.add(forward.current)
        if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) desiredVelocity.current.sub(forward.current)
        if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) desiredVelocity.current.add(right.current)
        if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) desiredVelocity.current.sub(right.current)
      }

      if (mobileMoving) {
        desiredVelocity.current.addScaledVector(forward.current, mobileMove.y)
        desiredVelocity.current.addScaledVector(right.current, mobileMove.x)
      }

      moving = desiredVelocity.current.lengthSq() > 0
      sprinting = pointerLocked && moving && (keys.current.has('ShiftLeft') || keys.current.has('ShiftRight'))
      const speed = sprinting ? 7.4 : touchMode.current ? 4.35 : 4.85

      if (moving) desiredVelocity.current.normalize().multiplyScalar(speed)
      const response = 1 - Math.exp(-(moving ? 10 : 8) * Math.min(delta, 0.05))
      velocity.current.lerp(desiredVelocity.current, response)

      stepVector.current.copy(velocity.current).multiplyScalar(Math.min(delta, 0.04))
      const nextX = camera.position.x + stepVector.current.x
      const nextZ = camera.position.z + stepVector.current.z

      if (!blocked(nextX, camera.position.z)) camera.position.x = nextX
      else velocity.current.x = 0

      if (!blocked(camera.position.x, nextZ)) camera.position.z = nextZ
      else velocity.current.z = 0
    } else {
      desiredVelocity.current.set(0, 0, 0)
      velocity.current.multiplyScalar(Math.max(0, 1 - delta * 10))
    }

    const horizontalSpeed = Math.hypot(velocity.current.x, velocity.current.z)
    if (movementEnabled && horizontalSpeed > 0.2) bobPhase.current += delta * (sprinting ? 10.8 : 7.8)
    const bobAmount = movementEnabled && horizontalSpeed > 0.2 ? Math.sin(bobPhase.current) * (sprinting ? 0.037 : 0.022) : 0
    camera.position.y = world.spawn[1] + bobAmount

    if (camera instanceof PerspectiveCamera) {
      const sprintBonus = sprinting && horizontalSpeed > 2 ? 3.5 : 0
      const targetFov = clampFov(baseFovTarget.current + sprintBonus)
      const nextFov = camera.fov + (targetFov - camera.fov) * (1 - Math.exp(-7 * delta))
      if (Math.abs(nextFov - camera.fov) > 0.003) {
        camera.fov = nextFov
        camera.updateProjectionMatrix()
      }
    }

    frameCount.current += 1
    const aiming = pointerLocked || touchMode.current
    const nowMs = clock.elapsedTime * 1000

    if (aiming) {
      const positionChanged = camera.position.distanceToSquared(lastInteractionScanPosition.current) > 0.0005
      const orientationChanged = 1 - Math.abs(camera.quaternion.dot(lastInteractionScanQuaternion.current)) > 0.000025
      const poseChanged = positionChanged || orientationChanged || horizontalSpeed > 0.15
      const scanGap = poseChanged ? 90 : 260
      const hardRefresh = nowMs - lastInteractionScanAt.current >= 360

      if (hardRefresh || (poseChanged && nowMs - lastInteractionScanAt.current >= scanGap)) {
        lastInteractionScanAt.current = nowMs
        lastInteractionScanPosition.current.copy(camera.position)
        lastInteractionScanQuaternion.current.copy(camera.quaternion)

        const target = findTarget()
        const key = interactionKey(target)
        if (key !== lastNearby.current) {
          lastNearby.current = key
          setNearby(target)
        }
      }
    } else {
      clearNearby()
    }

    if (frameCount.current % 8 === 0) {
      const dx = camera.position.x - lastReportedPlayer.current.x
      const dz = camera.position.z - lastReportedPlayer.current.y
      if (dx * dx + dz * dz > 0.0025) {
        lastReportedPlayer.current.set(camera.position.x, camera.position.z)
        setPlayer(camera.position.x, camera.position.z)
      }
      const activeRoom = findActiveRoom(world, camera.position.x, camera.position.z)
      const activeId = activeRoom?.id ?? null
      if (activeId !== lastActiveRoom.current) {
        lastActiveRoom.current = activeId
        setActiveRoom(activeId)
      }
    }

    const fovSettling = camera instanceof PerspectiveCamera
      ? Math.abs(clampFov(baseFovTarget.current + (sprinting && horizontalSpeed > 2 ? 3.5 : 0)) - camera.fov) > 0.02
      : false
    const stillMoving = horizontalSpeed > 0.025 || desiredVelocity.current.lengthSq() > 0.0004
    if (stillMoving || fovSettling || mobileMoving) requestBudgetedFrame()
  })

  return null
}
