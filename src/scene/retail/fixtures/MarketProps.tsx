import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import type { BoothProfile } from '../../../world/boothProfiles'
import type { RoomDefinition } from '../../../world/types'
import SurfaceMaterial from '../../materials/SurfaceMaterial'

export function SampleWall({ room }: { room: RoomDefinition }) {
  const samples = ['#f4f0e6', '#e7dcc3', '#c89b5c', '#adc9c8', '#d9b9bd', '#c4c0d2']
  return (
    <group position={[-2.58, 2.1, 1.92]}>
      <mesh>
        <boxGeometry args={[0.075, 2.25, 2.45]} />
        <meshStandardMaterial color="#47423b" roughness={0.76} />
      </mesh>
      {samples.map((color, index) => {
        const row = Math.floor(index / 3)
        const col = index % 3
        return (
          <group key={color} position={[0.055, 0.53 - row * 0.98, -0.78 + col * 0.78]}>
            <mesh>
              <boxGeometry args={[0.026, 0.68, 0.58]} />
              <SurfaceMaterial surface="paper-cream" repeat={[1, 1]} />
            </mesh>
            <mesh position={[0.018, 0.03, 0]}>
              <boxGeometry args={[0.012, 0.46, 0.42]} />
              <meshStandardMaterial color={color} roughness={0.92} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function SwatchFan({ room, profile }: { room: RoomDefinition; profile: BoothProfile }) {
  return (
    <group position={[profile.layout.desk[0] - 0.1, 1.14, profile.layout.desk[2] - 0.72]} rotation={[0, 0.08, 0]}>
      {Array.from({ length: 7 }, (_, index) => (
        <mesh key={index} rotation={[0, -0.4 + index * 0.13, 0]} position={[0.02 * index, index * 0.005, 0]}>
          <boxGeometry args={[0.18, 0.016, 0.56]} />
          <meshStandardMaterial
            color={['#f0ede4', '#ded0af', '#c3975d', '#9fc0c3', '#d4afb3', '#beb9d0', room.theme.accent][index]}
            roughness={0.92}
          />
        </mesh>
      ))}
      <mesh position={[-0.08, 0.035, -0.25]}>
        <cylinderGeometry args={[0.03, 0.03, 0.07, 12]} />
        <meshStandardMaterial color="#71604a" metalness={0.48} roughness={0.46} />
      </mesh>
    </group>
  )
}

export function RollRack({ profile }: { profile: BoothProfile }) {
  return (
    <group position={[-1.28, 0, 2.72]}>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[1.25, 2.4, 0.15]} />
        <SurfaceMaterial surface={profile.surfaces.metal} repeat={[1, 3]} />
      </mesh>
      {[-0.39, 0, 0.39].map((x, index) => (
        <group key={x} position={[x, 1.15, -0.16]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 2.05, 18]} />
            <SurfaceMaterial surface={index === 1 ? 'paper-cream' : 'paper-white'} repeat={[1, 3]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 2.1, 10]} />
            <meshStandardMaterial color="#554a3b" roughness={0.82} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function PalletStack({ profile }: { profile: BoothProfile }) {
  return (
    <group position={[1.45, 0, 2.35]}>
      {[0, 0.42, 0.84].map((y, row) => (
        <group key={y} position={[0, y, 0]}>
          {[-0.38, 0.38].map((x, col) => (
            <mesh key={x} position={[x, 0.22, 0]} castShadow>
              <boxGeometry args={[0.66, 0.38, 0.9]} />
              <SurfaceMaterial surface={row === 2 && col === 1 ? 'paper-cream' : 'paper-white'} repeat={[1, 1]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.045, 0]}>
        <boxGeometry args={[1.65, 0.09, 1.12]} />
        <SurfaceMaterial surface={profile.surfaces.wood} repeat={[2, 1]} />
      </mesh>
    </group>
  )
}

export function CardboardStacks() {
  return (
    <group position={[0.25, 0, 2.82]}>
      {[
        [-0.42, 0.2, 0],
        [0.22, 0.18, 0.08],
        [-0.12, 0.58, 0.04],
        [0.45, 0.52, -0.02]
      ].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]} castShadow rotation={[0, (index - 1.5) * 0.08, 0]}>
          <boxGeometry args={[0.72, index % 2 ? 0.34 : 0.4, 0.7]} />
          <meshStandardMaterial color={index % 2 ? '#9f7950' : '#b88e5f'} roughness={0.94} />
        </mesh>
      ))}
    </group>
  )
}

export function BookWall({ room, profile }: { room: RoomDefinition; profile: BoothProfile }) {
  return (
    <group position={[-2.48, 1.9, 1.85]}>
      {[0, 0.78, 1.56].map((y) => (
        <mesh key={y} position={[0.02, y - 0.78, 0]}>
          <boxGeometry args={[0.14, 0.06, 2.45]} />
          <SurfaceMaterial surface={profile.surfaces.wood} repeat={[1, 2]} />
        </mesh>
      ))}
      {Array.from({ length: 18 }, (_, index) => (
        <mesh
          key={index}
          position={[0.1, -0.47 + Math.floor(index / 6) * 0.78, -0.98 + (index % 6) * 0.39]}
          rotation={[0, 0, (index % 3 - 1) * 0.018]}
        >
          <boxGeometry args={[0.15, 0.52, 0.27]} />
          <meshStandardMaterial
            color={[room.theme.primary, room.theme.accent, '#d8c6a7', '#765447'][index % 4]}
            roughness={0.76}
          />
        </mesh>
      ))}
    </group>
  )
}

export function Pegboard({ room }: { room: RoomDefinition }) {
  return (
    <group position={[-2.56, 2.0, 1.9]}>
      <mesh>
        <boxGeometry args={[0.065, 2.45, 2.55]} />
        <meshStandardMaterial color="#b8b0a1" roughness={0.9} />
      </mesh>
      {Array.from({ length: 24 }, (_, index) => {
        const row = Math.floor(index / 6)
        const col = index % 6
        return (
          <mesh key={index} position={[0.044, 0.82 - row * 0.52, -1 + col * 0.4]}>
            <circleGeometry args={[0.022, 8]} />
            <meshStandardMaterial color="#4a4a45" roughness={0.65} />
          </mesh>
        )
      })}
      {[0, 1, 2].map((index) => (
        <mesh key={index} position={[0.095, 0.48 - index * 0.68, -0.35 + index * 0.4]}>
          <boxGeometry args={[0.13, 0.44, 0.64]} />
          <meshStandardMaterial color={index === 1 ? room.theme.accent : '#e7dfd0'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function PrintFrames({ room }: { room: RoomDefinition }) {
  const colors = [room.theme.accent, '#aa6658', '#536e7d']
  return (
    <group position={[-2.57, 2.25, -2.02]}>
      {colors.map((color, index) => (
        <group key={color} position={[0, 0.68 - index * 0.7, -0.68 + index * 0.68]}>
          <mesh>
            <boxGeometry args={[0.07, 0.56, 0.54]} />
            <meshStandardMaterial color="#3e352e" roughness={0.68} />
          </mesh>
          <mesh position={[0.045, 0, 0]}>
            <boxGeometry args={[0.012, 0.44, 0.42]} />
            <meshStandardMaterial color={color} roughness={0.76} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function SideDisplay({ room, profile }: { room: RoomDefinition; profile: BoothProfile }) {
  return (
    <group position={[1.95, 0, 2.58]}>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.5, 2.3, 1.12]} />
        <SurfaceMaterial surface={profile.surfaces.metal} repeat={[1, 2]} />
      </mesh>
      {[0.45, 0.9, 1.35, 1.8].map((y, index) => (
        <mesh key={y} position={[-0.28, y, 0]}>
          <boxGeometry args={[0.08, 0.34, 0.92]} />
          <meshStandardMaterial color={index === 2 ? room.theme.accent : '#ede5d4'} roughness={0.88} />
        </mesh>
      ))}
    </group>
  )
}

export function CeilingFan() {
  const ref = useRef<Group>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 1.1
  })

  return (
    <group ref={ref} position={[0.2, 3.72, 0.25]}>
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 12]} />
        <meshStandardMaterial color="#44443f" metalness={0.48} roughness={0.58} />
      </mesh>
      {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((rotation) => (
        <mesh key={rotation} rotation={[0, rotation, 0]} position={[Math.cos(rotation) * 0.55, -0.06, Math.sin(rotation) * 0.55]}>
          <boxGeometry args={[0.9, 0.035, 0.16]} />
          <meshStandardMaterial color="#67645c" roughness={0.72} />
        </mesh>
      ))}
    </group>
  )
}

export function ScanLab({ room }: { room: RoomDefinition }) {
  return (
    <group position={[-0.2, 0, 0.75]}>
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[2.45, 2.6, 2.45]} />
        <meshStandardMaterial color={room.theme.primary} wireframe emissive={room.theme.accent} emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.45, 1.55, 40]} />
        <meshBasicMaterial color={room.theme.accent} toneMapped={false} />
      </mesh>
    </group>
  )
}
