import { AdaptiveDpr } from '@react-three/drei'
import { useMemo } from 'react'
import Architecture from './Architecture'
import FloorImperfections from './FloorImperfections'
import MaterialEnvironment from './MaterialEnvironment'
import MotionPerformanceController from './MotionPerformanceController'
import DiagnosticsProbe from './DiagnosticsProbe'
import ExperienceEffects from './ExperienceEffects'
import PlayerController from './PlayerController'
import RoomRenderer from './RoomRenderer'
import StaticShadowController from './StaticShadowController'
import SceneWarmup from './SceneWarmup'
import WorldDecor from './WorldDecor'
import { useAppStore } from '../store'

export default function MallScene() {
  const vendors = useAppStore((state) => state.catalog.vendors)
  const world = useAppStore((state) => state.world)
  const started = useAppStore((state) => state.started)
  const diagnosticsEnabled = useAppStore((state) => state.diagnosticsEnabled)
  const vendorsById = useMemo(() => new Map(vendors.map((vendor) => [vendor.id, vendor])), [vendors])

  return (
    <>
      <color attach="background" args={['#e7e8e6']} />
      <fog attach="fog" args={['#dcdedc', 35, 78]} />

      <ambientLight intensity={0.38} />
      <hemisphereLight intensity={0.56} color="#fffaf0" groundColor="#707779" />
      <directionalLight
        position={[5, 12, 8]}
        intensity={1.08}
        color="#fff6e6"
        castShadow={started}
        shadow-mapSize={[1536, 1536]}
        shadow-camera-near={1}
        shadow-camera-far={46}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.00035}
        shadow-normalBias={0.025}
      />

      <MaterialEnvironment />
      <AdaptiveDpr />
      <MotionPerformanceController />
      <SceneWarmup />
      <Architecture />
      {started && <FloorImperfections />}

      {world.rooms.map((room) => (
        <RoomRenderer
          key={room.id}
          room={room}
          vendor={room.vendorId ? vendorsById.get(room.vendorId) : undefined}
        />
      ))}

      <WorldDecor />
      <ExperienceEffects />
      <StaticShadowController />
      {diagnosticsEnabled && <DiagnosticsProbe />}
      <PlayerController world={world} />
    </>
  )
}
