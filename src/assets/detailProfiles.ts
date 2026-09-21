export type AssetDecalKind = 'smudge' | 'scuff' | 'fingerprint'

export type AssetDecalPlacement = {
  id: string
  kind: AssetDecalKind
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number]
  opacity: number
  seed: number
}

export type AssetLabelPlacement = {
  id: string
  position: [number, number, number]
  rotation: [number, number, number]
  width: number
  height: number
  title: string
  subtitle: string
  background: string
  accent: string
}

export type AssetDetailProfile = {
  id: string
  labels: AssetLabelPlacement[]
  decals: AssetDecalPlacement[]
}

const profiles: Record<string, AssetDetailProfile> = {
  'authored:iran-paper-net:store:v4': {
    id: 'iran-paper-authored-v4-details',
    labels: [
      {
        id: 'bundle-a4',
        position: [-1.705, 1.17, -2.53],
        rotation: [0, Math.PI / 2, 0],
        width: 0.34,
        height: 0.13,
        title: 'A4 COPY',
        subtitle: '80 GSM',
        background: '#f1efe8',
        accent: '#31504c'
      },
      {
        id: 'bundle-offset',
        position: [-1.705, 1.80, -1.52],
        rotation: [0, Math.PI / 2, -0.015],
        width: 0.34,
        height: 0.13,
        title: 'OFFSET',
        subtitle: '70 GSM',
        background: '#e9dfc7',
        accent: '#7e6037'
      },
      {
        id: 'bundle-gloss',
        position: [-1.705, 2.42, 0.50],
        rotation: [0, Math.PI / 2, 0.012],
        width: 0.34,
        height: 0.13,
        title: 'GLOSS',
        subtitle: 'COATED',
        background: '#eef0ee',
        accent: '#496a7c'
      },
      {
        id: 'bundle-color',
        position: [-1.705, 3.04, 2.51],
        rotation: [0, Math.PI / 2, -0.01],
        width: 0.34,
        height: 0.13,
        title: 'COLOR',
        subtitle: 'CUT SIZE',
        background: '#efe7dc',
        accent: '#8b5d5f'
      }
    ],
    decals: [
      {
        id: 'lower-wall-smudge',
        kind: 'smudge',
        position: [-2.565, 0.52, -1.65],
        rotation: [0, Math.PI / 2, 0],
        size: [1.08, 0.46],
        opacity: 0.46,
        seed: 117
      },
      {
        id: 'counter-fingerprint',
        kind: 'fingerprint',
        position: [1.371, 0.86, -0.68],
        rotation: [0, Math.PI / 2, 0],
        size: [0.44, 0.30],
        opacity: 0.22,
        seed: 219
      },
      {
        id: 'floor-scuff',
        kind: 'scuff',
        position: [0.20, 0.091, 1.15],
        rotation: [-Math.PI / 2, 0, 0.06],
        size: [1.55, 0.48],
        opacity: 0.34,
        seed: 331
      },
      {
        id: 'counter-kick-scuff',
        kind: 'smudge',
        position: [1.347, 0.27, -1.52],
        rotation: [0, Math.PI / 2, 0],
        size: [0.42, 0.22],
        opacity: 0.32,
        seed: 457
      }
    ]
  }
}

export function getAssetDetailProfile(assetId: string) {
  return profiles[assetId]
}
