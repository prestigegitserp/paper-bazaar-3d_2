import { Instance, Instances } from '@react-three/drei'
import { useMemo } from 'react'
import WorldTextPanel from './WorldTextPanel'
import SurfaceMaterial from '../scene/materials/SurfaceMaterial'
import { useAppStore } from '../store'

const MARKET_LENGTH = 39.6
const AISLE_WIDTH = 5.7

function TiledFloor() {
  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
        <planeGeometry args={[16.55, MARKET_LENGTH]} />
        <SurfaceMaterial
          surface="mall-porcelain"
          loadPriority="critical"
          allowHighResolution
          repeat={[4.15, 10]}
        />
      </mesh>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]}>
        <planeGeometry args={[AISLE_WIDTH, 38.8]} />
        <meshPhysicalMaterial
          color="#f4f4f0"
          roughness={0.24}
          metalness={0.015}
          clearcoat={0.22}
          clearcoatRoughness={0.2}
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}

function CeilingSystem() {
  const panels = useMemo(() => Array.from({ length: 13 }, (_, index) => -18 + index * 3), [])
  const evenPanels = useMemo(() => panels.filter((_, index) => index % 2 === 0), [panels])
  const oddPanels = useMemo(() => panels.filter((_, index) => index % 2 === 1), [panels])
  const realLights = useMemo(() => panels.filter((_, index) => index % 3 === 0), [panels])

  return (
    <>
      <mesh position={[0, 5.0, 0]} receiveShadow>
        <boxGeometry args={[16.4, 0.16, 39.2]} />
        <SurfaceMaterial
          surface="mall-plaster"
          loadPriority="critical"
          allowHighResolution
          repeat={[8, 16]}
        />
      </mesh>

      <Instances limit={evenPanels.length}>
        <boxGeometry args={[5.3, 0.08, 2.45]} />
        <meshStandardMaterial color="#f7f7f4" roughness={0.64} />
        {evenPanels.map((z) => <Instance key={z} position={[0, 4.88, z]} />)}
      </Instances>

      <Instances limit={oddPanels.length}>
        <boxGeometry args={[5.3, 0.08, 2.45]} />
        <meshStandardMaterial color="#e8e8e5" roughness={0.64} />
        {oddPanels.map((z) => <Instance key={z} position={[0, 4.88, z]} />)}
      </Instances>

      <Instances limit={panels.length}>
        <boxGeometry args={[3.85, 0.035, 0.085]} />
        <meshStandardMaterial
          color="#fffdf3"
          emissive="#fff7de"
          emissiveIntensity={4.1}
          toneMapped={false}
        />
        {panels.map((z) => <Instance key={z} position={[0, 4.82, z]} />)}
      </Instances>

      {realLights.map((z) => (
        <pointLight
          key={z}
          position={[0, 4.42, z]}
          color="#fff5df"
          intensity={13.5}
          distance={11.5}
          decay={2}
        />
      ))}

      {[-2.72, 2.72].map((x) => (
        <mesh key={x} position={[x, 4.84, 0]}>
          <boxGeometry args={[0.055, 0.06, 38.5]} />
          <meshStandardMaterial color="#34383b" metalness={0.58} roughness={0.44} />
        </mesh>
      ))}
    </>
  )
}

function ColumnSystem() {
  const columns = useMemo(() => [-16.5, -11.25, -6, -0.75, 4.5, 9.75, 15].flatMap((z) => [
    { x: -2.88, z },
    { x: 2.88, z }
  ]), [])

  return (
    <>
      <Instances limit={columns.length} castShadow receiveShadow>
        <boxGeometry args={[0.34, 4.9, 0.42]} />
        <SurfaceMaterial surface="mall-plaster" loadPriority="critical" repeat={[1, 3]} />
        {columns.map(({ x, z }) => <Instance key={`shaft:${x}:${z}`} position={[x, 2.45, z]} />)}
      </Instances>

      <Instances limit={columns.length}>
        <boxGeometry args={[0.39, 0.26, 0.47]} />
        <meshStandardMaterial color="#4d5357" roughness={0.38} metalness={0.18} />
        {columns.map(({ x, z }) => <Instance key={`base:${x}:${z}`} position={[x, 0.13, z]} />)}
      </Instances>

      <Instances limit={columns.length}>
        <boxGeometry args={[0.28, 0.52, 0.025]} />
        <meshStandardMaterial color="#d8d9d6" roughness={0.32} />
        {columns.map(({ x, z }) => <Instance key={`plate:${x}:${z}`} position={[x, 3.05, z + 0.218]} />)}
      </Instances>
    </>
  )
}

function GlassBay({ x, z, rotationY, label, accent }: {
  x: number
  z: number
  rotationY: number
  label: string
  accent: string
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <mesh position={[2.72, 1.72, 0]}>
        <boxGeometry args={[0.05, 3.4, 2.7]} />
        <meshStandardMaterial
          color="#cbd9da"
          transparent
          opacity={0.18}
          roughness={0.16}
          metalness={0.04}
          envMapIntensity={0.82}
          depthWrite={false}
        />
      </mesh>
      {[-1.31, 1.31].map((zFrame) => (
        <mesh key={zFrame} position={[2.74, 1.72, zFrame]}>
          <boxGeometry args={[0.1, 3.45, 0.08]} />
          <meshPhysicalMaterial
            color="#24282b"
            metalness={0.82}
            roughness={0.28}
            clearcoat={0.08}
            clearcoatRoughness={0.24}
            envMapIntensity={1.45}
            anisotropy={0.32}
          />
        </mesh>
      ))}
      <mesh position={[2.74, 3.47, 0]}>
        <boxGeometry args={[0.11, 0.7, 2.82]} />
        <meshStandardMaterial color="#f2f2ef" roughness={0.52} />
      </mesh>
      <WorldTextPanel
        position={[2.805, 3.47, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={2.48}
        height={0.5}
        background="#f4f4f1"
        borderColor="rgba(30,35,38,.18)"
        lines={[
          { text: label, size: 68, color: '#2d3134', weight: 900 },
          { text: 'PAPER · PRINT · SUPPLY', size: 27, color: accent, weight: 800, direction: 'ltr' }
        ]}
      />
    </group>
  )
}

function EntrancePortal() {
  return (
    <group position={[0, 0, 19.25]}>
      {[-3.0, 3.0].map((x) => (
        <mesh key={x} position={[x, 2.45, 0]} castShadow>
          <boxGeometry args={[0.42, 4.9, 0.68]} />
          <SurfaceMaterial surface="mall-plaster" loadPriority="critical" repeat={[1, 3]} />
        </mesh>
      ))}
      <mesh position={[0, 4.52, 0]} castShadow>
        <boxGeometry args={[6.35, 0.58, 0.72]} />
        <meshStandardMaterial color="#f3f3f0" roughness={0.58} />
      </mesh>
      <WorldTextPanel
        position={[0, 4.52, -0.375]}
        width={5.45}
        height={0.48}
        background="#f3f3f0"
        borderColor="rgba(32,36,39,.14)"
        lines={[
          { text: 'راسته کاغذ و تحریر', size: 76, color: '#24282b', weight: 900 },
          { text: 'PAPER BAZAAR · MODERN TEHRAN PASSAGE', size: 28, color: '#64747b', weight: 800, direction: 'ltr' }
        ]}
      />
    </group>
  )
}

function HangingWayfinding({ z, label, sub }: { z: number; label: string; sub: string }) {
  return (
    <group position={[0, 4.25, z]}>
      {[-1.25, 1.25].map((x) => (
        <mesh key={x} position={[x, 0.36, 0]}>
          <boxGeometry args={[0.025, 0.72, 0.025]} />
          <meshStandardMaterial color="#353a3d" metalness={0.72} roughness={0.35} />
        </mesh>
      ))}
      <mesh castShadow>
        <boxGeometry args={[3.2, 0.62, 0.08]} />
        <meshStandardMaterial color="#303538" roughness={0.42} metalness={0.24} />
      </mesh>
      <WorldTextPanel
        position={[0, 0, 0.045]}
        width={2.92}
        height={0.46}
        background="#303538"
        borderColor="rgba(255,255,255,.08)"
        lines={[
          { text: label, size: 66, color: '#f6f5f1', weight: 900 },
          { text: sub, size: 28, color: '#bfc9ca', weight: 700, direction: 'ltr' }
        ]}
      />
    </group>
  )
}

function HeritageAccent() {
  return (
    <>
      {[-17.8, 17.8].map((z) => (
        <group key={z}>
          <mesh position={[-8.02, 2.05, z]}>
            <boxGeometry args={[0.08, 3.7, 1.7]} />
            <SurfaceMaterial surface="bazaar-brick" repeat={[1, 2.3]} />
          </mesh>
          <mesh position={[8.02, 2.05, z]}>
            <boxGeometry args={[0.08, 3.7, 1.7]} />
            <SurfaceMaterial surface="bazaar-brick" repeat={[1, 2.3]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

export default function Architecture() {
  const quality = useAppStore((state) => state.quality)

  return (
    <>
      <TiledFloor />

      <mesh position={[-8.25, 2.6, 0]} receiveShadow>
        <boxGeometry args={[0.3, 5.2, MARKET_LENGTH]} />
        <SurfaceMaterial
          surface="mall-plaster"
          loadPriority="critical"
          allowHighResolution
          repeat={[2, 12]}
        />
      </mesh>
      <mesh position={[8.25, 2.6, 0]} receiveShadow>
        <boxGeometry args={[0.3, 5.2, MARKET_LENGTH]} />
        <SurfaceMaterial
          surface="mall-plaster"
          loadPriority="critical"
          allowHighResolution
          repeat={[2, 12]}
        />
      </mesh>
      <mesh position={[0, 2.6, -19.55]} receiveShadow>
        <boxGeometry args={[16.55, 5.2, 0.3]} />
        <SurfaceMaterial
          surface="mall-plaster"
          loadPriority="critical"
          allowHighResolution
          repeat={[8, 3]}
        />
      </mesh>

      <CeilingSystem />
      <ColumnSystem />
      <HeritageAccent />

      {quality === 'cinematic' && (
        <>
          <spotLight
            position={[-1.9, 4.6, 7.3]}
            target-position={[-5.2, 1.7, 7.5]}
            color="#fff0d9"
            intensity={10}
            distance={9}
            angle={0.58}
            penumbra={0.92}
          />
          <spotLight
            position={[1.9, 4.6, -3]}
            target-position={[5.2, 1.7, -3]}
            color="#f2f7ff"
            intensity={9}
            distance={9}
            angle={0.58}
            penumbra={0.92}
          />
        </>
      )}

      <GlassBay x={-5.35} z={-8.25} rotationY={0} label="انبار کاغذ و مقوا" accent="#75886f" />
      <GlassBay x={5.35} z={-8.25} rotationY={Math.PI} label="صحافی و ملزومات" accent="#6b7e88" />
      <GlassBay x={-5.35} z={2.25} rotationY={0} label="چاپ و تحریر" accent="#8c6a62" />
      <GlassBay x={5.35} z={2.25} rotationY={Math.PI} label="کاغذ رنگی" accent="#637f9c" />
      <GlassBay x={-5.35} z={12.65} rotationY={0} label="فروش عمده" accent="#82755d" />
      <GlassBay x={5.35} z={12.65} rotationY={Math.PI} label="انبار سفارشات" accent="#647d7b" />

      <EntrancePortal />
      <HangingWayfinding z={10.4} label="کاغذ · مقوا · تحریر" sub="WHOLESALE PAPER PASSAGE" />
      <HangingWayfinding z={-9.4} label="فروش عمده و استعلام روز" sub="CATALOG · SAMPLE · ORDER" />
    </>
  )
}
