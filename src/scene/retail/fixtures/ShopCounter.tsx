import BeveledBox from '../../../components/BeveledBox'
import type { Vendor } from '../../../domain/catalog'
import { findHotspot, resolveHotspotInteraction } from '../../../world/hotspots'
import type { BoothProfile } from '../../../world/boothProfiles'
import type { RoomDefinition } from '../../../world/types'
import SurfaceMaterial from '../../materials/SurfaceMaterial'
import InteractiveNode from '../InteractiveNode'

function Calculator({ accent }: { accent: string }) {
  return (
    <group position={[0.05, 1.15, 0.6]} rotation={[0, 0.08, 0]}>
      <BeveledBox args={[0.34, 0.07, 0.48]} radius={0.018} castShadow>
        <meshStandardMaterial color="#34383a" roughness={0.5} />
      </BeveledBox>
      <mesh position={[0, 0.045, -0.13]}>
        <boxGeometry args={[0.24, 0.012, 0.1]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      {Array.from({ length: 12 }, (_, index) => {
        const row = Math.floor(index / 4)
        const col = index % 4
        return (
          <mesh key={index} position={[-0.105 + col * 0.07, 0.048, 0.02 + row * 0.09]}>
            <boxGeometry args={[0.045, 0.012, 0.055]} />
            <meshStandardMaterial color={index > 8 ? '#b08c50' : '#8b8f8e'} roughness={0.65} />
          </mesh>
        )
      })}
    </group>
  )
}

function CounterGoods({ room }: { room: RoomDefinition }) {
  return (
    <group>
      {[-0.72, -0.22, 0.28, 0.78].map((z, index) => (
        <BeveledBox key={z} args={[0.46, 0.09, 0.34]} radius={0.014} position={[0, 0.71, z]} rotation={[0, 0, (index - 1.5) * 0.015]}>
          <meshStandardMaterial color={index === 2 ? room.theme.accent : index % 2 ? '#f3efe6' : '#ded5c6'} roughness={0.86} />
        </BeveledBox>
      ))}
      {[-0.58, 0, 0.58].map((z, index) => (
        <BeveledBox key={z} args={[0.34, 0.16, 0.34]} radius={0.018} position={[0.03, 0.52, z]}>
          <meshStandardMaterial color={index === 1 ? '#c7aa74' : '#ece7dc'} roughness={0.88} />
        </BeveledBox>
      ))}
    </group>
  )
}

function DeskDetails({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position={[-0.12, 1.15, -0.55]}>
        <boxGeometry args={[0.32, 0.11, 0.38]} />
        <meshStandardMaterial color="#e7e7e4" roughness={0.46} />
      </mesh>
      <mesh position={[-0.12, 1.215, -0.61]}>
        <boxGeometry args={[0.22, 0.02, 0.09]} />
        <meshStandardMaterial color="#8b9294" roughness={0.34} />
      </mesh>
      <mesh position={[0.18, 1.145, -0.74]}>
        <boxGeometry args={[0.2, 0.07, 0.31]} />
        <meshStandardMaterial color={accent} roughness={0.5} />
      </mesh>
      {[0, 0.06, 0.12].map((x) => (
        <mesh key={x} position={[-0.33 + x, 1.23, -0.85]}>
          <boxGeometry args={[0.018, 0.22, 0.018]} />
          <meshStandardMaterial color={x === 0.06 ? '#c24d42' : '#3f596b'} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function SalesCounter({ room, vendor, profile }: { room: RoomDefinition; vendor?: Vendor; profile: BoothProfile }) {
  const hotspot = vendor ? findHotspot(room.hotspots, 'management-desk') : null
  const interaction = vendor && hotspot ? resolveHotspotInteraction(hotspot, vendor) : null

  return (
    <InteractiveNode
      position={profile.layout.desk as [number, number, number]}
      interaction={interaction}
      accent={room.theme.accent}
      haloPosition={[0, 1.42, 0]}
      haloRadius={0.62}
    >
      <BeveledBox args={[0.78, 0.68, 2.55]} radius={0.035} position={[0, 0.34, 0]} castShadow>
        <SurfaceMaterial surface={profile.surfaces.counter} repeat={[1, 3]} />
      </BeveledBox>

      <CounterGoods room={room} />

      <BeveledBox args={[0.72, 0.58, 2.46]} radius={0.025} position={[0.02, 0.79, 0]} castShadow>
        <meshPhysicalMaterial color="#e8f1ed" transparent opacity={0.2} transmission={0.82} roughness={0.055} metalness={0} thickness={0.08} ior={1.46} depthWrite={false} />
      </BeveledBox>

      <BeveledBox args={[0.82, 0.075, 2.62]} radius={0.022} position={[0.4, 1.06, 0]} castShadow>
        <SurfaceMaterial surface={profile.surfaces.wood} repeat={[1, 3]} />
      </BeveledBox>

      {profile.features.calculator && <Calculator accent={room.theme.accent} />}
      <DeskDetails accent={room.theme.accent} />
    </InteractiveNode>
  )
}

export function CatalogProp({ room, vendor, profile }: { room: RoomDefinition; vendor?: Vendor; profile: BoothProfile }) {
  if (!vendor) return null
  const hotspot = findHotspot(room.hotspots, 'catalog-desk')
  const interaction = hotspot ? resolveHotspotInteraction(hotspot, vendor) : null

  return (
    <InteractiveNode
      position={profile.layout.catalog as [number, number, number]}
      interaction={interaction}
      accent={room.theme.accent}
      haloPosition={[0, 0.2, 0]}
      haloRadius={0.34}
    >
      <group rotation={[0.035, -0.12, 0.02]}>
        <mesh castShadow position={[0, 0.018, 0]}>
          <boxGeometry args={[0.72, 0.055, 0.52]} />
          <meshStandardMaterial color={room.theme.primary} roughness={0.46} />
        </mesh>
        <mesh position={[0, 0.054, 0]}>
          <boxGeometry args={[0.66, 0.018, 0.46]} />
          <SurfaceMaterial surface="paper-cream" repeat={[1, 1]} />
        </mesh>
        <mesh position={[0.02, 0.07, -0.225]}>
          <boxGeometry args={[0.62, 0.018, 0.02]} />
          <meshStandardMaterial color={room.theme.accent} roughness={0.58} />
        </mesh>
      </group>
    </InteractiveNode>
  )
}
