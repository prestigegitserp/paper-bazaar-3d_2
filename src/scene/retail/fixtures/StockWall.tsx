import { Instance, Instances } from '@react-three/drei'
import WorldTextPanel from '../../../components/WorldTextPanel'
import type { BoothProfile } from '../../../world/boothProfiles'
import type { RoomDefinition } from '../../../world/types'
import SurfaceMaterial from '../../materials/SurfaceMaterial'

const shelfLabels = ['تحریر ۷۰ گرم', 'گلاسه', 'کاغذ رنگی', 'مقوا و کرافت']

export default function StockWall({ room, profile }: { room: RoomDefinition; profile: BoothProfile }) {
  const dense = profile.features.denseShelves !== false
  const columns = dense ? 8 : 6
  const rows = dense ? 5 : 4
  const positions = Array.from({ length: columns * rows }, (_, index) => {
    const row = Math.floor(index / columns)
    const col = index % columns
    return {
      position: [-2.04, 0.55 + row * 0.63, -2.58 + col * (5.16 / Math.max(1, columns - 1))] as [number, number, number],
      color: index % 9 === 0
        ? room.theme.accent
        : index % 7 === 0
          ? '#c7a66b'
          : index % 5 === 0
            ? '#d7d0c1'
            : '#ece7dc'
    }
  })

  return (
    <group>
      {[0.32, 0.94, 1.57, 2.2, 2.83, 3.46].map((y) => (
        <group key={y}>
          <mesh position={[-2.23, y, 0]} castShadow={false}>
            <boxGeometry args={[0.34, 0.055, 6.25]} />
            <SurfaceMaterial surface={profile.surfaces.wood} repeat={[1, 5]} />
          </mesh>
          <mesh position={[-2.02, y + 0.055, 0]}>
            <boxGeometry args={[0.025, 0.045, 6.08]} />
            <meshStandardMaterial color="#72787a" metalness={0.5} roughness={0.42} />
          </mesh>
        </group>
      ))}

      {[-3.02, -2.02, -1.02, 0, 1.02, 2.02, 3.02].map((z) => (
        <mesh key={z} position={[-2.39, 1.87, z]} castShadow={false}>
          <boxGeometry args={[0.13, 3.55, 0.1]} />
          <SurfaceMaterial surface={profile.surfaces.metal} repeat={[1, 3]} />
        </mesh>
      ))}

      <Instances limit={positions.length} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[0.62, 0.27, 0.54]} />
        <meshStandardMaterial roughness={0.88} vertexColors />
        {positions.map(({ position, color }, index) => (
          <Instance key={index} position={position} color={color} />
        ))}
      </Instances>

      {profile.features.handwrittenLabels && shelfLabels.map((label, index) => (
        <WorldTextPanel
          key={label}
          position={[-1.72, 0.89 + index * 0.68, -2.46 + (index % 2) * 1.35]}
          rotation={[0, Math.PI / 2, index % 2 ? 0.02 : -0.02]}
          width={0.62}
          height={0.18}
          background={profile.shopfront.labelColor}
          borderColor="rgba(60,52,18,.24)"
          lines={[{ text: label, size: 78, color: '#342b16', weight: 900 }]}
        />
      ))}

      <mesh position={[-2.56, 1.9, 3.19]} castShadow>
        <boxGeometry args={[0.11, 3.65, 0.22]} />
        <meshStandardMaterial color="#34383a" roughness={0.42} metalness={0.62} />
      </mesh>
    </group>
  )
}
