import { useEffect, useRef, type ReactNode } from 'react'
import type { Interaction } from '../../domain/interaction'
import { interactionKey } from '../../engine/interactions'
import { registerInteractionTarget } from '../../engine/interactionTargets'
import { useAppStore } from '../../store'
import InteractionHalo from '../../components/InteractionHalo'

export default function InteractiveNode({
  interaction,
  accent,
  haloPosition,
  haloRadius,
  children,
  position = [0, 0, 0]
}: {
  interaction: Interaction | null
  accent: string
  haloPosition: [number, number, number]
  haloRadius?: number
  children: ReactNode
  position?: [number, number, number]
}) {
  const groupRef = useRef<import('three').Group>(null)
  const key = interactionKey(interaction)
  const active = useAppStore((state) => Boolean(interaction && interactionKey(state.nearby) === key))

  useEffect(() => {
    const group = groupRef.current
    if (!group || !interaction) return
    return registerInteractionTarget(group)
  }, [interaction])

  return (
    <group
      ref={groupRef}
      position={position}
      userData={interaction ? { interaction } : undefined}
    >
      {children}
      <InteractionHalo active={active} color={accent} position={haloPosition} radius={haloRadius} />
    </group>
  )
}
