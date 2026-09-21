import type { SurfacePresetId } from '../../world/boothProfiles'

export type PbrResolution = '1k' | '2k'

export type PbrSurfaceAsset = {
  id: SurfacePresetId
  sourceLabel: string
  sourceUrl: string
  slug: string
  normalScale?: number
}

const ph = (slug: string, suffix: string, resolution: PbrResolution) =>
  `https://dl.polyhaven.org/file/ph-assets/Textures/jpg/${resolution}/${slug}/${slug}_${suffix}_${resolution}.jpg`

function asset(
  id: SurfacePresetId,
  slug: string,
  sourceLabel: string,
  sourceUrl: string,
  normalScale?: number
): PbrSurfaceAsset {
  return { id, slug, sourceLabel, sourceUrl, normalScale }
}

export const pbrSurfaceRegistry: Partial<Record<SurfacePresetId, PbrSurfaceAsset>> = {
  'mall-porcelain': asset(
    'mall-porcelain',
    'floor_tiles_04',
    'Poly Haven · Floor Tiles 04 · CC0',
    'https://polyhaven.com/a/floor_tiles_04',
    0.34
  ),
  'mall-plaster': asset(
    'mall-plaster',
    'white_plaster_02',
    'Poly Haven · White Plaster 02 · CC0',
    'https://polyhaven.com/a/white_plaster_02',
    0.28
  ),
  'bazaar-brick': asset(
    'bazaar-brick',
    'worn_brick_wall',
    'Poly Haven · Worn Brick Wall · CC0',
    'https://polyhaven.com/a/worn_brick_wall',
    0.72
  ),
  'bazaar-plaster': asset(
    'bazaar-plaster',
    'worn_plaster_wall',
    'Poly Haven · Worn Plaster Wall · CC0',
    'https://polyhaven.com/a/worn_plaster_wall',
    0.52
  ),
  'bazaar-floor': asset(
    'bazaar-floor',
    'worn_tile_floor',
    'Poly Haven · Worn Tile Floor · CC0',
    'https://polyhaven.com/a/worn_tile_floor',
    0.46
  ),
  'bazaar-shutter': asset(
    'bazaar-shutter',
    'painted_metal_shutter',
    'Poly Haven · Painted Metal Shutter · CC0',
    'https://polyhaven.com/a/painted_metal_shutter',
    0.5
  ),
  'wood-walnut': asset(
    'wood-walnut',
    'walnut_veneer',
    'Poly Haven · Walnut Veneer · CC0',
    'https://polyhaven.com/a/walnut_veneer',
    0.28
  ),
  'wood-oak': asset(
    'wood-oak',
    'oak_wood_planks',
    'Poly Haven · Oak Wood Planks · CC0',
    'https://polyhaven.com/a/oak_wood_planks',
    0.3
  ),
  'bazaar-plywood': asset(
    'bazaar-plywood',
    'plywood',
    'Poly Haven · Plywood · CC0',
    'https://polyhaven.com/a/plywood',
    0.3
  )
}

export function getPbrSurfaceAsset(id: SurfacePresetId) {
  return pbrSurfaceRegistry[id]
}

export function getPbrSurfaceUrls(id: SurfacePresetId, resolution: PbrResolution = '1k') {
  const item = getPbrSurfaceAsset(id)
  if (!item) return null
  return {
    color: ph(item.slug, 'diff', resolution),
    normal: ph(item.slug, 'nor_gl', resolution),
    roughness: ph(item.slug, 'rough', resolution)
  }
}
