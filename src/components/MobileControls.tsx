import { useEffect, useRef, useState } from 'react'
import { addMobileLook, addMobileZoom, resetMobileInput, setMobileMove, triggerMobileInteract } from '../input/mobileInput'
import { useAppStore } from '../store'
import { demoWorld } from '../world/demoWorld'

const JOYSTICK_RADIUS = 42

function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)')
    const update = () => setCoarse(query.matches || navigator.maxTouchPoints > 0)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  return coarse
}

export default function MobileControls() {
  const coarse = useCoarsePointer()
  const started = useAppStore((state) => state.started)
  const selected = useAppStore((state) => state.selected)
  const requestNavigation = useAppStore((state) => state.requestNavigation)
  const stickPointer = useRef<number | null>(null)
  const lookPointer = useRef<number | null>(null)
  const stickOrigin = useRef({ x: 0, y: 0 })
  const lookLast = useRef({ x: 0, y: 0 })
  const [knob, setKnob] = useState({ x: 0, y: 0 })

  useEffect(() => () => resetMobileInput(), [])

  if (!coarse || !started || selected) return null

  const updateStick = (clientX: number, clientY: number) => {
    const dx = clientX - stickOrigin.current.x
    const dy = clientY - stickOrigin.current.y
    const length = Math.hypot(dx, dy) || 1
    const scale = Math.min(1, JOYSTICK_RADIUS / length)
    const x = dx * scale
    const y = dy * scale
    setKnob({ x, y })
    setMobileMove(x / JOYSTICK_RADIUS, -y / JOYSTICK_RADIUS)
  }

  return (
    <div className="mobile-controls" dir="ltr">
      <div
        className="mobile-look-zone"
        onPointerDown={(event) => {
          lookPointer.current = event.pointerId
          lookLast.current = { x: event.clientX, y: event.clientY }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (lookPointer.current !== event.pointerId) return
          const dx = event.clientX - lookLast.current.x
          const dy = event.clientY - lookLast.current.y
          lookLast.current = { x: event.clientX, y: event.clientY }
          addMobileLook(dx, dy)
        }}
        onPointerUp={(event) => {
          if (lookPointer.current === event.pointerId) lookPointer.current = null
        }}
        onPointerCancel={() => {
          lookPointer.current = null
        }}
      />

      <div
        className="mobile-joystick"
        onPointerDown={(event) => {
          stickPointer.current = event.pointerId
          const rect = event.currentTarget.getBoundingClientRect()
          stickOrigin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
          event.currentTarget.setPointerCapture(event.pointerId)
          updateStick(event.clientX, event.clientY)
        }}
        onPointerMove={(event) => {
          if (stickPointer.current !== event.pointerId) return
          updateStick(event.clientX, event.clientY)
        }}
        onPointerUp={(event) => {
          if (stickPointer.current !== event.pointerId) return
          stickPointer.current = null
          setKnob({ x: 0, y: 0 })
          setMobileMove(0, 0)
        }}
        onPointerCancel={() => {
          stickPointer.current = null
          setKnob({ x: 0, y: 0 })
          setMobileMove(0, 0)
        }}
      >
        <div className="mobile-joystick__ring">
          <div className="mobile-joystick__knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
        </div>
      </div>

      <div className="mobile-actions">
        <button type="button" className="mobile-action mobile-action--interact" onPointerDown={(event) => {
          event.preventDefault()
          triggerMobileInteract()
        }}>E</button>
        <button type="button" className="mobile-action" onPointerDown={(event) => {
          event.preventDefault()
          addMobileZoom(-4)
        }}>＋</button>
        <button type="button" className="mobile-action" onPointerDown={(event) => {
          event.preventDefault()
          addMobileZoom(4)
        }}>−</button>
        <button type="button" className="mobile-action mobile-action--reset" onPointerDown={(event) => {
          event.preventDefault()
          requestNavigation({ target: demoWorld.spawn, yaw: 0, label: 'ورودی بازار' })
        }}>R</button>
      </div>
    </div>
  )
}
