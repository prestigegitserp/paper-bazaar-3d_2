import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

function ActiveInteractionHalo({
  color,
  position,
  radius
}: {
  color: string
  position: [number, number, number]
  radius: number
}) {
  const group = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!group.current) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 4.2) * 0.08
    group.current.scale.setScalar(pulse)
    group.current.rotation.y = clock.elapsedTime * 0.55
  })

  return (
    <group ref={group} position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => {}}>
        <torusGeometry args={[radius, 0.026, 8, 36]} />
        <meshBasicMaterial color={color} transparent opacity={0.86} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.32, 0]} raycast={() => {}}>
        <octahedronGeometry args={[0.075, 0]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function InteractionHalo({
  active,
  color,
  position = [0, 1.6, 0],
  radius = 0.62
}: {
  active: boolean
  color: string
  position?: [number, number, number]
  radius?: number
}) {
  if (!active) return null
  return <ActiveInteractionHalo color={color} position={position} radius={radius} />
}
