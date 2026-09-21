import type { Vendor } from '../../domain/catalog'
import WorldTextPanel from '../../components/WorldTextPanel'
import type { BoothProfile } from '../../world/boothProfiles'
import type { RoomDefinition } from '../../world/types'
import SurfaceMaterial from '../materials/SurfaceMaterial'

function ShopSign({ room, vendor, profile }: { room: RoomDefinition; vendor?: Vendor; profile: BoothProfile }) {
  return (
    <group position={[2.68, 3.55, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.18, 0.72, 5.22]} />
        <meshStandardMaterial color={profile.shopfront.frameColor} metalness={0.44} roughness={0.42} />
      </mesh>
      <WorldTextPanel
        position={[0.105, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={4.82}
        height={0.54}
        background={profile.shopfront.signColor}
        borderColor="rgba(255,255,255,.12)"
        lines={[
          { text: vendor?.name ?? room.label, size: 68, color: profile.shopfront.signText, weight: 900 },
          { text: vendor?.shortName ?? 'DIGITAL TWIN / SCAN SPACE', size: 28, color: room.theme.accent, weight: 800, direction: 'ltr' }
        ]}
      />
    </group>
  )
}

function ShopfrontFrame({ profile }: { profile: BoothProfile }) {
  return (
    <group>
      {[-3.16, 3.16].map((z) => (
        <mesh key={z} position={[2.68, 2.1, z]} castShadow>
          <boxGeometry args={[0.14, 4.15, 0.13]} />
          <meshStandardMaterial color={profile.shopfront.frameColor} metalness={0.72} roughness={0.32} />
        </mesh>
      ))}
      <mesh position={[2.68, 4.08, 0]} castShadow>
        <boxGeometry args={[0.14, 0.14, 6.45]} />
        <meshStandardMaterial color={profile.shopfront.frameColor} metalness={0.72} roughness={0.32} />
      </mesh>
      {[-2.1, 2.1].map((z) => (
        <mesh key={z} position={[2.695, 1.72, z]}>
          <boxGeometry args={[0.035, 3.25, 1.65]} />
          <meshPhysicalMaterial color="#dce8ea" transparent opacity={0.16} transmission={0.72} roughness={0.1} thickness={0.04} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function Shutter({ profile }: { profile: BoothProfile }) {
  if (profile.shopfront.shutter === 'open') return null

  if (profile.shopfront.shutter === 'rolled') {
    return (
      <group position={[2.72, 3.96, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.17, 0.17, 5.55, 18]} />
          <SurfaceMaterial surface="bazaar-shutter" repeat={[3, 1]} color="#9a9e9d" />
        </mesh>
        <mesh position={[-0.15, 0, 0]}>
          <boxGeometry args={[0.07, 0.42, 5.7]} />
          <meshStandardMaterial color="#565c5f" roughness={0.45} metalness={0.62} />
        </mesh>
      </group>
    )
  }

  return (
    <group position={[2.73, 3.34, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.08, 1.05, 5.55]} />
        <SurfaceMaterial surface="bazaar-shutter" repeat={[3, 1.6]} color="#a4a7a5" />
      </mesh>
    </group>
  )
}

function ShopLights({ profile }: { profile: BoothProfile }) {
  return (
    <group>
      {[-1.65, 0, 1.65].map((z, index) => (
        <group key={z} position={[0.15, 3.92, z]}>
          <mesh>
            <boxGeometry args={[2.15, 0.06, 0.14]} />
            <meshStandardMaterial color="#dadbd8" roughness={0.56} />
          </mesh>
          <mesh position={[0, -0.042, 0]}>
            <boxGeometry args={[1.92, 0.022, 0.065]} />
            <meshStandardMaterial color={profile.lighting.color} emissive={profile.lighting.color} emissiveIntensity={3.5} toneMapped={false} />
          </mesh>
          {index === 1 && (
            <pointLight position={[0, -0.32, 0]} color={profile.lighting.color} intensity={profile.lighting.intensity} distance={5.8} decay={2} />
          )}
        </group>
      ))}
    </group>
  )
}

function WallDetails() {
  return (
    <group>
      <mesh position={[-2.55, 3.25, -1.7]}>
        <boxGeometry args={[0.035, 0.035, 3.2]} />
        <meshStandardMaterial color="#747b7f" metalness={0.46} roughness={0.48} />
      </mesh>
      <mesh position={[-2.51, 2.85, -0.15]}>
        <boxGeometry args={[0.1, 0.24, 0.18]} />
        <meshStandardMaterial color="#e3e3df" roughness={0.5} />
      </mesh>
      <mesh position={[-2.5, 0.48, -2.65]}>
        <boxGeometry args={[0.06, 0.22, 0.32]} />
        <meshStandardMaterial color="#f0f0ec" roughness={0.5} />
      </mesh>
      {[-0.09, 0.09].map((z) => (
        <mesh key={z} position={[-2.46, 0.48, -2.65 + z]}>
          <boxGeometry args={[0.012, 0.055, 0.045]} />
          <meshStandardMaterial color="#6f7476" roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export default function RetailShell({ room, vendor, profile }: { room: RoomDefinition; vendor?: Vendor; profile: BoothProfile }) {
  return (
    <>
      <mesh position={[0, 0.045, 0]} receiveShadow>
        <boxGeometry args={[5.6, 0.09, 7.2]} />
        <SurfaceMaterial surface={profile.surfaces.floor} repeat={[4.4, 5.7]} />
      </mesh>

      <mesh position={[-2.74, 2.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 4.3, 7.2]} />
        <SurfaceMaterial surface={profile.surfaces.wall} repeat={[2, 4.4]} />
      </mesh>
      <mesh position={[0, 2.15, -3.48]} receiveShadow castShadow>
        <boxGeometry args={[5.6, 4.3, 0.18]} />
        <SurfaceMaterial surface="mall-plaster" repeat={[3.4, 2.6]} />
      </mesh>
      <mesh position={[0, 2.15, 3.48]} receiveShadow castShadow>
        <boxGeometry args={[5.6, 4.3, 0.18]} />
        <SurfaceMaterial surface="mall-plaster" repeat={[3.4, 2.6]} />
      </mesh>

      <mesh position={[-0.1, 4.18, 0]} receiveShadow>
        <boxGeometry args={[5.45, 0.15, 7.05]} />
        <meshStandardMaterial color="#eeeeea" roughness={0.68} />
      </mesh>

      <ShopfrontFrame profile={profile} />
      <Shutter profile={profile} />
      <ShopSign room={room} vendor={vendor} profile={profile} />
      <ShopLights profile={profile} />
      <WallDetails />
    </>
  )
}
