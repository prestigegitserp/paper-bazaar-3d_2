import { Texture, TextureLoader, SRGBColorSpace, WebGLRenderer } from 'three'
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
