import { AdaptiveDpr } from '@react-three/drei'
import { useMemo } from 'react'
import Architecture from './Architecture'
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
  const quality = useAppStore((state) => state.quality)
  const vendorsById = useMemo(() => new Map(vendors.map((vendor) => [vendor.id, vendor])), [vendors])

  return (
    <>
      <color attach="background" args={['#c9c1b3']} />
      <fog attach="fog" args={['#bfb6a8', 34, 74]} />

      <ambientLight intensity={0.24} />
      <hemisphereLight intensity={0.42} color="#fff1d7" groundColor="#5f6664" />
      <directionalLight
        position={[5, 12, 8]}
        intensity={0.86}
        color="#ffe3bd"
        castShadow={started && quality === 'cinematic'}
        shadow-mapSize={[1024, 1024]}
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
