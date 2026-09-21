import {
  ImageBitmapLoader,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  TextureLoader
} from 'three'
import type { SurfacePresetId } from '../../world/boothProfiles'
import {
  getPbrSurfaceAsset,
  getPbrSurfaceUrls,
  type PbrResolution
} from './pbrSurfaceRegistry'

const bitmapLoader = new ImageBitmapLoader()
bitmapLoader.setCrossOrigin('anonymous')
bitmapLoader.setOptions({ imageOrientation: 'flipY', premultiplyAlpha: 'none' })

const textureLoader = new TextureLoader()
textureLoader.setCrossOrigin('anonymous')

const sourceTexturePromises = new Map<string, Promise<Texture>>()

type PbrLoadPriority = 'critical' | 'normal' | 'background'

const priorityWeight: Record<PbrLoadPriority, number> = {
  critical: 0,
  normal: 1,
  background: 2
}

type QueueItem<T> = {
  priority: number
  run: () => Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

const queue: QueueItem<unknown>[] = []
let activeBuilds = 0
const MAX_CONCURRENT_BUILDS = 2

function pumpQueue() {
  while (activeBuilds < MAX_CONCURRENT_BUILDS && queue.length) {
    queue.sort((a, b) => a.priority - b.priority)
    const item = queue.shift()
    if (!item) return

    activeBuilds += 1
    void item.run()
      .then(item.resolve)
      .catch(item.reject)
      .finally(() => {
        activeBuilds -= 1
        pumpQueue()
      })
  }
}

function schedule<T>(task: () => Promise<T>, priority: PbrLoadPriority) {
  return new Promise<T>((resolve, reject) => {
    queue.push({
      priority: priorityWeight[priority],
      run: task,
      resolve: resolve as (value: unknown) => void,
      reject
    })
    pumpQueue()
  })
}

function configureSourceTexture(texture: Texture, srgb: boolean) {
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  if (srgb) texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

async function decodeTexture(url: string, srgb: boolean) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await bitmapLoader.loadAsync(url)
      const texture = new Texture(bitmap)
      texture.flipY = false
      return configureSourceTexture(texture, srgb)
    } catch {
      // Safari/WebView/CORS edge cases fall back to the regular image loader.
    }
  }

  const texture = await textureLoader.loadAsync(url)
  return configureSourceTexture(texture, srgb)
}

function loadSharedTexture(url: string, srgb = false) {
  const key = `${url}|${srgb ? 'srgb' : 'linear'}`
  let promise = sourceTexturePromises.get(key)

  if (!promise) {
    promise = decodeTexture(url, srgb)
    sourceTexturePromises.set(key, promise)
    void promise.catch(() => {
      if (sourceTexturePromises.get(key) === promise) sourceTexturePromises.delete(key)
    })
  }

  return promise
}

async function loadWithFallback(primary: string, fallback: string, srgb = false) {
  if (primary === fallback) return loadSharedTexture(primary, srgb)
  try {
    return await loadSharedTexture(primary, srgb)
  } catch {
    return loadSharedTexture(fallback, srgb)
  }
}

function cloneTexture(source: Texture, repeat: [number, number], anisotropy: number, srgb = false) {
  const texture = source.clone()
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(repeat[0], repeat[1])
  texture.anisotropy = anisotropy
  if (srgb) texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export type PbrTextureSet = {
  map: Texture
  normalMap?: Texture
  roughnessMap?: Texture
  resolution: PbrResolution
}

export type PbrTextureLease = {
  key: string
  set: PbrTextureSet
}

type VariantEntry = {
  refs: number
  set?: PbrTextureSet
  promise: Promise<PbrTextureSet>
}

const variantCache = new Map<string, VariantEntry>()

function variantKey(
  surface: SurfacePresetId,
  repeat: [number, number],
  anisotropy: number,
  full: boolean,
  resolution: PbrResolution
) {
  return [
    surface,
    resolution,
    repeat[0].toFixed(3),
    repeat[1].toFixed(3),
    anisotropy.toFixed(2),
    full ? 'full' : 'albedo'
  ].join('|')
}

function disposeSet(set: PbrTextureSet) {
  set.map.dispose()
  set.normalMap?.dispose()
  set.roughnessMap?.dispose()
}

async function createPbrTextureSet(
  surface: SurfacePresetId,
  repeat: [number, number],
  anisotropy: number,
  full: boolean,
  resolution: PbrResolution
) {
  const asset = getPbrSurfaceAsset(surface)
  const colorUrls = getPbrSurfaceUrls(surface, resolution)
  const detailUrls = getPbrSurfaceUrls(surface, '1k')
  if (!asset || !colorUrls || !detailUrls) throw new Error(`No PBR asset registered for ${surface}`)

  const [sourceMap, sourceNormal, sourceRoughness] = await Promise.all([
    loadWithFallback(colorUrls.color, detailUrls.color, true),
    full ? loadSharedTexture(detailUrls.normal) : Promise.resolve(undefined),
    full ? loadSharedTexture(detailUrls.roughness) : Promise.resolve(undefined)
  ])

  return {
    map: cloneTexture(sourceMap, repeat, anisotropy, true),
    normalMap: sourceNormal ? cloneTexture(sourceNormal, repeat, anisotropy) : undefined,
    roughnessMap: sourceRoughness ? cloneTexture(sourceRoughness, repeat, anisotropy) : undefined,
    resolution
  }
}

export async function acquirePbrTextureSet(
  surface: SurfacePresetId,
  {
    repeat,
    anisotropy,
    full,
    priority = 'normal',
    resolution = '1k'
  }: {
    repeat: [number, number]
    anisotropy: number
    full: boolean
    priority?: PbrLoadPriority
    resolution?: PbrResolution
  }
): Promise<PbrTextureLease | null> {
  const asset = getPbrSurfaceAsset(surface)
  if (!asset) return null

  const key = variantKey(surface, repeat, anisotropy, full, resolution)
  let entry = variantCache.get(key)

  if (!entry) {
    const next: VariantEntry = {
      refs: 0,
      promise: Promise.resolve(null as unknown as PbrTextureSet)
    }

    next.promise = schedule(
      () => createPbrTextureSet(surface, repeat, anisotropy, full, resolution),
      priority
    )
      .then((set) => {
        next.set = set
        if (next.refs === 0) {
          disposeSet(set)
          if (variantCache.get(key) === next) variantCache.delete(key)
        }
        return set
      })
      .catch((error) => {
        if (variantCache.get(key) === next) variantCache.delete(key)
        throw error
      })

    entry = next
    variantCache.set(key, entry)
  }

  entry.refs += 1

  try {
    const set = await entry.promise
    return { key, set }
  } catch (error) {
    entry.refs = Math.max(0, entry.refs - 1)
    throw error
  }
}

export function releasePbrTextureSet(lease: PbrTextureLease | null | undefined) {
  if (!lease) return
  const entry = variantCache.get(lease.key)
  if (!entry) return

  entry.refs = Math.max(0, entry.refs - 1)
  if (entry.refs === 0 && entry.set) {
    disposeSet(entry.set)
    variantCache.delete(lease.key)
  }
}

export function getPbrResidencyStats() {
  return {
    sourceTextures: sourceTexturePromises.size,
    variants: variantCache.size,
    queuedBuilds: queue.length,
    activeBuilds
  }
}
