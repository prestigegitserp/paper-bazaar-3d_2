import type { Texture, WebGLRenderer } from 'three'
import type { PbrTextureSet } from './pbrTextureCache'

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number }
  ) => number
}

let uploadTail: Promise<void> = Promise.resolve()

function idleUpload(task: () => void) {
  return new Promise<void>((resolve, reject) => {
    const run = () => {
      try {
        task()
        resolve()
      } catch (error) {
        reject(error)
      }
    }

    if (typeof window === 'undefined') {
      run()
      return
    }

    const idleWindow = window as IdleWindow
    if (idleWindow.requestIdleCallback) {
      idleWindow.requestIdleCallback(run, { timeout: 850 })
      return
    }

    window.setTimeout(run, 16)
  })
}

function queueTextureUpload(renderer: WebGLRenderer, texture: Texture) {
  const job = uploadTail
    .catch(() => undefined)
    .then(() => idleUpload(() => {
      renderer.initTexture(texture)
    }))

  uploadTail = job.catch(() => undefined)
  return job
}

export async function warmPbrTextureSet(renderer: WebGLRenderer, set: PbrTextureSet) {
  const textures = [set.map, set.normalMap, set.roughnessMap].filter(Boolean) as Texture[]
  for (const texture of textures) await queueTextureUpload(renderer, texture)
}
