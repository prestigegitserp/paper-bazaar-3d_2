import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import { PlaneGeometry, Texture } from 'three'
import { getAssetPresentationProfile } from '../presentation/assetPresentationRegistry'
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
      <spotLight
        position={hero.lighting.key.position}
        target-position={[0.7, 1.0, -0.65]}
        color={hero.lighting.key.color}
        intensity={hero.lighting.key.intensity}
        distance={7}
        angle={hero.lighting.key.angle}
        penumbra={0.9}
        decay={2}
        castShadow={false}
      />
      <pointLight
        position={hero.lighting.fill.position}
        color={hero.lighting.fill.color}
        intensity={hero.lighting.fill.intensity}
        distance={hero.lighting.fill.distance}
        decay={2}
        castShadow={false}
      />
      <spotLight
        position={hero.lighting.rim.position}
        target-position={[0.4, 1.35, 1.0]}
        color={hero.lighting.rim.color}
        intensity={hero.lighting.rim.intensity}
        distance={6}
        angle={hero.lighting.rim.angle}
        penumbra={0.95}
        decay={2}
        castShadow={false}
      />

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
