import { getAssetDetailProfile } from '../assets/detailProfiles'
import type { RoomDefinition } from '../world/types'
import SurfaceDecal from './SurfaceDecal'
import WorldTextPanel from './WorldTextPanel'

export default function AuthoredSurfaceDetails({ room }: { room: RoomDefinition }) {
  const profile = getAssetDetailProfile(room.asset.assetId)
  if (!profile) return null

  return (
    <group>
      {profile.decals.map((decal) => (
        <SurfaceDecal key={decal.id} {...decal} />
      ))}

      {profile.labels.map((label) => (
        <WorldTextPanel
          key={label.id}
          position={label.position}
          rotation={label.rotation}
          width={label.width}
          height={label.height}
          background={label.background}
          borderColor="rgba(35,38,39,.18)"
          lines={[
            { text: label.title, size: 74, color: '#232628', weight: 900, direction: 'ltr' },
            { text: label.subtitle, size: 42, color: label.accent, weight: 800, direction: 'ltr' }
          ]}
        />
      ))}
    </group>
  )
}
