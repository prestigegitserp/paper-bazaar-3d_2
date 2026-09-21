import { RoundedBox } from '@react-three/drei'
import type { ReactNode } from 'react'

export default function BeveledBox({
  args,
  position,
  rotation,
  radius = 0.025,
  smoothness = 2,
  castShadow,
  receiveShadow,
  children
}: {
  args: [number, number, number]
  position?: [number, number, number]
  rotation?: [number, number, number]
  radius?: number
  smoothness?: number
  castShadow?: boolean
  receiveShadow?: boolean
  children: ReactNode
}) {
  const safeRadius = Math.min(radius, Math.min(...args) * 0.28)

  return (
    <RoundedBox
      args={args}
      position={position}
      rotation={rotation}
      radius={safeRadius}
      smoothness={smoothness}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      {children}
    </RoundedBox>
  )
}
