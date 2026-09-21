import SurfaceDecal from '../../components/SurfaceDecal'
import SurfaceMaterial from '../materials/SurfaceMaterial'
import type { BoothProfile } from '../../world/boothProfiles'
import type { RoomDefinition } from '../../world/types'

function hash(value: string) {
  let h = 2166136261
  for (const char of value) {
    h ^= char.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export default function LivedInDetails({ room, profile }: { room: RoomDefinition; profile: BoothProfile }) {
  const variant = hash(room.id) % 4
  const desk = profile.layout.desk
  const floorX = -0.55 + variant * 0.34
  const floorZ = 0.6 - variant * 0.42

  return (
    <group>
      <SurfaceDecal
        kind="scuff"
        seed={110 + variant}
        position={[floorX, 0.053, floorZ]}
        rotation={[-Math.PI / 2, 0, -0.14 + variant * 0.07]}
        size={[2.5, 1.25]}
        opacity={0.92}
      />
      <SurfaceDecal
        kind="smudge"
        seed={210 + variant}
        position={[-2.626, 1.7, -1.25 + variant * 0.55]}
        rotation={[0, Math.PI / 2, 0]}
        size={[1.25, 1.05]}
        opacity={0.82}
      />
      <SurfaceDecal
        kind="fingerprint"
        seed={310 + variant}
        position={[desk[0] + 0.42, 1.102, desk[2] + 0.18]}
        rotation={[-Math.PI / 2, 0, 0.08]}
        size={[0.48, 0.34]}
        opacity={0.62}
      />

      <group position={[desk[0] + 0.33, 1.12, desk[2] - 0.78]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.075, 0.065, 0.16, 14]} />
          <meshStandardMaterial color="#e8dfd0" roughness={0.76} />
        </mesh>
        <mesh position={[0.088, 0.015, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.042, 0.012, 6, 14]} />
          <meshStandardMaterial color="#d4c6b5" roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.086, 0]}>
          <cylinderGeometry args={[0.058, 0.058, 0.01, 12]} />
          <meshStandardMaterial color="#593b29" roughness={0.58} />
        </mesh>
      </group>

      <group position={[desk[0] + 0.42, 1.112, desk[2] + 0.75]} rotation={[0, -0.18, 0]}>
        {[0, 0.016, 0.032].map((y, index) => (
          <mesh key={y} position={[0, y, index * 0.025]} rotation={[-Math.PI / 2, 0, (index - 1) * 0.035]}>
            <planeGeometry args={[0.28 + index * 0.03, 0.18]} />
            <SurfaceMaterial surface={index === 2 ? 'paper-cream' : 'paper-white'} repeat={[1, 1]} />
          </mesh>
        ))}
      </group>

      <group position={[1.95, 0.16, 2.84]} rotation={[0.04, -0.2 + variant * 0.04, -0.08]}>
        <mesh castShadow>
          <boxGeometry args={[0.72, 0.28, 0.62]} />
          <meshStandardMaterial color="#a77f54" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.68, 0.018, 0.08]} />
          <meshStandardMaterial color="#c4a16c" roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.15, 0.18]}>
          <boxGeometry args={[0.68, 0.018, 0.055]} />
          <meshStandardMaterial color="#d7bd87" roughness={0.8} />
        </mesh>
      </group>

      <group position={[-1.55, 0.075, 2.95]} rotation={[Math.PI / 2, 0, 0.18]}>
        <mesh>
          <torusGeometry args={[0.11, 0.032, 8, 20]} />
          <meshPhysicalMaterial color="#c6ad75" transparent opacity={0.78} roughness={0.42} />
        </mesh>
      </group>
    </group>
  )
}
