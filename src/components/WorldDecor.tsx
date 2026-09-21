import { Instance, Instances } from '@react-three/drei'
import BeveledBox from './BeveledBox'

function HandCart({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.12, 0]}>
      <BeveledBox args={[1.1, 0.14, 1.55]} radius={0.028} position={[0, 0.43, 0]} castShadow>
        <meshStandardMaterial color="#78614f" roughness={0.72} />
      </BeveledBox>
      {[
        [-0.46, 0.14, -0.52],
        [0.46, 0.14, -0.52],
        [-0.46, 0.14, 0.52],
        [0.46, 0.14, 0.52]
      ].map((wheel, index) => (
        <mesh key={index} position={wheel as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.075, 14]} />
          <meshStandardMaterial color="#282b2c" roughness={0.72} />
        </mesh>
      ))}
      {[0.63, 0.79, 0.95].map((y, index) => (
        <BeveledBox key={y} args={[0.98 - index * 0.04, 0.12, 1.32 - index * 0.06]} radius={0.018} position={[0, y, 0]} castShadow>
          <meshStandardMaterial color={index === 1 ? '#d7c7a8' : '#efebe2'} roughness={0.86} />
        </BeveledBox>
      ))}
    </group>
  )
}

function ModernPlanter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.33, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.46, 0.66, 18]} />
        <meshStandardMaterial color="#4e5558" roughness={0.42} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.67, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.08, 18]} />
        <meshStandardMaterial color="#4c4034" roughness={0.9} />
      </mesh>
      {Array.from({ length: 9 }, (_, index) => {
        const a = (index / 9) * Math.PI * 2
        return (
          <mesh key={index} position={[Math.cos(a) * 0.12, 1.0 + (index % 3) * 0.08, Math.sin(a) * 0.12]} rotation={[0.1, a, (index % 2 ? 1 : -1) * 0.28]}>
            <boxGeometry args={[0.08, 0.8, 0.22]} />
            <meshStandardMaterial color={index % 2 ? '#55745a' : '#668865'} roughness={0.82} />
          </mesh>
        )
      })}
    </group>
  )
}

function MallBench({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <BeveledBox args={[1.8, 0.12, 0.52]} radius={0.028} position={[0, 0.48, 0]} castShadow>
        <meshStandardMaterial color="#a68c6f" roughness={0.58} />
      </BeveledBox>
      {[-0.66, 0.66].map((x) => (
        <mesh key={x} position={[x, 0.25, 0]}>
          <boxGeometry args={[0.08, 0.5, 0.42]} />
          <meshStandardMaterial color="#383e41" metalness={0.64} roughness={0.32} />
        </mesh>
      ))}
    </group>
  )
}

function InfoKiosk() {
  return (
    <group position={[0, 0, 15.05]} rotation={[0, -0.06, 0]}>
      <BeveledBox args={[1.18, 1.44, 0.62]} radius={0.055} position={[0, 0.72, 0]} castShadow>
        <meshPhysicalMaterial color="#f0f0ed" roughness={0.4} clearcoat={0.06} clearcoatRoughness={0.45} />
      </BeveledBox>
      <mesh position={[0, 1.02, -0.325]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.82, 0.55, 0.035]} />
        <meshStandardMaterial color="#243035" emissive="#55737b" emissiveIntensity={0.18} roughness={0.26} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[1.25, 0.12, 0.7]} />
        <meshStandardMaterial color="#444b4f" metalness={0.4} roughness={0.38} />
      </mesh>
    </group>
  )
}

function PaperRollRack({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.58, 0]}>
        <boxGeometry args={[1.45, 1.12, 0.52]} />
        <meshStandardMaterial color="#454c50" roughness={0.38} metalness={0.5} />
      </mesh>
      <Instances limit={5}>
        <cylinderGeometry args={[0.16, 0.16, 1.2, 14]} />
        <meshStandardMaterial roughness={0.88} vertexColors />
        {[-0.48, -0.24, 0, 0.24, 0.48].map((x, index) => (
          <Instance key={x} position={[x, 1.28, 0]} rotation={[0, 0, Math.PI / 2]} color={index % 2 ? '#e7e0d3' : '#d0bc99'} />
        ))}
      </Instances>
    </group>
  )
}

export default function WorldDecor() {
  return (
    <>
      <InfoKiosk />
      <ModernPlanter position={[-2.05, 0, 16.25]} />
      <ModernPlanter position={[2.05, 0, 16.25]} />
      <MallBench position={[-2.15, 0, 11.55]} rotationY={0.04} />
      <HandCart position={[2.12, 0, -16.7]} />
      <PaperRollRack position={[-2.1, 0, -17.4]} />
    </>
  )
}
