import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import { PlaneGeometry, Texture } from 'three'
import { getAssetPresentationProfile } from '../presentation/assetPresentationRegistry'
import { useAppStore } from '../store'
import type { RoomDefinition } from '../world/types'

const geometryCache = new Map<number, PlaneGeometry>()

function tileGeometry(tile: number) {
  const cached = geometryCache.get(tile)
  if (cached) return cached

  const geometry = new PlaneGeometry(1, 1)
  const uv = geometry.getAttribute('uv')
  const col = tile % 4
  const row = Math.floor(tile / 4)

  for (let index = 0; index < uv.count; index += 1) {
    const u = uv.getX(index)
    const v = uv.getY(index)
    uv.setXY(index, (col + u) / 4, (3 - row + v) / 4)
  }

  uv.needsUpdate = true
  geometryCache.set(tile, geometry)
  return geometry
}

export default function HeroRoomArtDirection({ room }: { room: RoomDefinition }) {
  const gl = useThree((state) => state.gl)
  const invalidate = useThree((state) => state.invalidate)
  const performanceCurrent = useThree((state) => state.performance.current)
  const activeRoomId = useAppStore((state) => state.activeRoomId)
  const quality = useAppStore((state) => state.quality)
  const [atlas, setAtlas] = useState<Texture | null>(null)
  const profile = useMemo(() => getAssetPresentationProfile(room), [room])
  const hero = profile.hero

  useEffect(() => {
    if (!hero) return
    let active = true
    void import('../scene/materials/productionAtlas')
      .then(({ loadProductionMaterialAtlas }) => loadProductionMaterialAtlas(gl))
      .then((texture) => {
        if (!active) return
        setAtlas(texture)
        invalidate()
      })
      .catch(() => {
        // Hero dressing remains readable as colored geometry if texture loading fails.
      })
    return () => {
      active = false
    }
  }, [gl, hero, invalidate])

  if (!hero) return null

  return (
    <group>
      {activeRoomId === room.id && quality === 'cinematic' && performanceCurrent > 0.86 && (
        <spotLight
          position={hero.lighting.key.position}
          target-position={[0.7, 1.0, -0.65]}
          color={hero.lighting.key.color}
          intensity={hero.lighting.key.intensity * 0.82}
          distance={6.5}
          angle={hero.lighting.key.angle}
          penumbra={0.94}
          decay={2}
          castShadow={false}
        />
      )}

      {hero.atlasDressing.map((item, index) => (
        <mesh
          key={index}
          geometry={tileGeometry(item.tile)}
          position={item.position}
          rotation={item.rotation}
          scale={[item.size[0], item.size[1], 1]}
          raycast={() => undefined}
          renderOrder={3}
        >
          <meshStandardMaterial
            map={atlas ?? undefined}
            color={atlas ? '#ffffff' : '#b8a271'}
            roughness={0.62}
            metalness={0}
            emissive={item.emissive ? '#8fa8a0' : '#000000'}
            emissiveIntensity={item.emissive ?? 0}
          />
        </mesh>
      ))}
    </group>
  )
}
