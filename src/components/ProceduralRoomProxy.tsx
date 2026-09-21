import WorldTextPanel from './WorldTextPanel'
import type { Vendor } from '../domain/catalog'
import { getBoothProfile } from '../world/boothProfiles'
import type { RoomDefinition } from '../world/types'

export default function ProceduralRoomProxy({ room, vendor }: { room: RoomDefinition; vendor?: Vendor }) {
  const profile = getBoothProfile(room.experience?.profileId)

  return (
    <group position={room.position as [number, number, number]} rotation={[0, room.rotationY, 0]}>
      <mesh position={[-2.7, 2.05, 0]}>
        <boxGeometry args={[0.12, 4.1, 7]} />
        <meshStandardMaterial color={room.theme.secondary} roughness={0.9} />
      </mesh>

      <mesh position={[0.15, 2.0, 0]}>
        <boxGeometry args={[5.2, 3.75, 6.7]} />
        <meshStandardMaterial color="#2b2d2d" roughness={0.95} />
      </mesh>

      {[-3.16, 3.16].map((z) => (
        <mesh key={z} position={[2.68, 2.05, z]}>
          <boxGeometry args={[0.14, 4.05, 0.13]} />
          <meshStandardMaterial color={profile.shopfront.frameColor} metalness={0.68} roughness={0.34} />
        </mesh>
      ))}

      <mesh position={[2.68, 4.02, 0]}>
        <boxGeometry args={[0.14, 0.14, 6.45]} />
        <meshStandardMaterial color={profile.shopfront.frameColor} metalness={0.68} roughness={0.34} />
      </mesh>

      {[-1.72, 0, 1.72].map((z, index) => (
        <mesh key={z} position={[1.92, 1.45 + index * 0.22, z]}>
          <boxGeometry args={[0.52, 1.75, 1.12]} />
          <meshStandardMaterial
            color={index === 1 ? room.theme.primary : '#77736b'}
            roughness={0.82}
          />
        </mesh>
      ))}

      <mesh position={[2.69, 1.72, 0]}>
        <boxGeometry args={[0.035, 3.25, 5.85]} />
        <meshStandardMaterial
          color="#dfe9e8"
          transparent
          opacity={0.1}
          roughness={0.2}
          depthWrite={false}
        />
      </mesh>

      <group position={[2.69, 3.55, 0]}>
        <mesh>
          <boxGeometry args={[0.18, 0.72, 5.22]} />
          <meshStandardMaterial color={profile.shopfront.signColor} roughness={0.48} />
        </mesh>
        <WorldTextPanel
          position={[0.105, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          width={4.82}
          height={0.54}
          background={profile.shopfront.signColor}
          borderColor="rgba(255,255,255,.1)"
          resolutionScale={0.45}
          lines={[
            { text: vendor?.name ?? room.label, size: 68, color: profile.shopfront.signText, weight: 900 },
            { text: vendor?.shortName ?? 'DIGITAL TWIN / SCAN SPACE', size: 28, color: room.theme.accent, weight: 800, direction: 'ltr' }
          ]}
        />
      </group>
    </group>
  )
}
