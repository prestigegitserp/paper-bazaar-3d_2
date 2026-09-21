import { ClampToEdgeWrapping, Texture, TextureLoader, SRGBColorSpace, WebGLRenderer } from 'three'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { resolveAssetUrl } from '../../assets/resolveAssetUrl'

const atlasPromises = new WeakMap<WebGLRenderer, Promise<Texture>>()
const fallbackLoader = new TextureLoader()

function configure(texture: Texture) {
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export function loadProductionMaterialAtlas(renderer: WebGLRenderer) {
  const cached = atlasPromises.get(renderer)
  if (cached) return cached

  const promise = (async () => {
    const ktx2 = new KTX2Loader()
      .setTranscoderPath(resolveAssetUrl('basis/'))
      .detectSupport(renderer)

    try {
      const texture = await ktx2.loadAsync(resolveAssetUrl('textures/production/market-material-atlas.ktx2'))
      return configure(texture)
    } catch {
      const texture = await fallbackLoader.loadAsync(resolveAssetUrl('textures/production/market-material-atlas.png'))
      return configure(texture)
    } finally {
      ktx2.dispose()
    }
  })()

  atlasPromises.set(renderer, promise)
  void promise.catch(() => {
    if (atlasPromises.get(renderer) === promise) atlasPromises.delete(renderer)
  })
  return promise
}


const tileVariants = new WeakMap<Texture, Map<number, Texture>>()

export function getProductionAtlasTile(source: Texture, tile: number) {
  let variants = tileVariants.get(source)
  if (!variants) {
    variants = new Map()
    tileVariants.set(source, variants)
  }

  const cached = variants.get(tile)
  if (cached) return cached

  const texture = source.clone()
  const col = tile % 4
  const row = Math.floor(tile / 4)
  const inset = 0.0015
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  texture.repeat.set(0.25 - inset * 2, 0.25 - inset * 2)
  texture.offset.set(col * 0.25 + inset, (3 - row) * 0.25 + inset)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  variants.set(tile, texture)
  return texture
}
