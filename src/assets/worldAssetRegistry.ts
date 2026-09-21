import type { GltfAsset, ScanAsset, WorldAsset } from '../world/types'

export type WorldAssetKey =
  | 'hero-wholesale-v1'
  | 'hero-packaging-v1'
  | 'hero-paper-studio-v1'

const assets: Record<WorldAssetKey, WorldAsset> = {
  'hero-wholesale-v1': {
    kind: 'gltf',
    url: 'models/hero-wholesale-v1.glb',
    assetId: 'authored:hero-wholesale:v1',
    version: '1.0.0',
    metersPerUnit: 1,
    source: 'authored'
  },
  'hero-packaging-v1': {
    kind: 'gltf',
    url: 'models/hero-packaging-v1.glb',
    assetId: 'authored:hero-packaging:v1',
    version: '1.0.0',
    metersPerUnit: 1,
    source: 'authored'
  },
  'hero-paper-studio-v1': {
    kind: 'gltf',
    url: 'models/hero-paper-studio-v1.glb',
    assetId: 'authored:hero-paper-studio:v1',
    version: '1.0.0',
    metersPerUnit: 1,
    source: 'authored'
  }
}

export function getWorldAsset(key: WorldAssetKey): WorldAsset {
  return { ...assets[key] }
}

export function defineExternalGltfAsset(asset: GltfAsset): GltfAsset {
  return { ...asset }
}

export function defineScanAsset(asset: ScanAsset): ScanAsset {
  return { ...asset }
}
