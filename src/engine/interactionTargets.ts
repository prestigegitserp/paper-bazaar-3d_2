import type { Object3D } from 'three'

const targets = new Set<Object3D>()

export function registerInteractionTarget(object: Object3D) {
  targets.add(object)
  return () => {
    targets.delete(object)
  }
}

export function getInteractionTargets() {
  return Array.from(targets)
}

export function clearInteractionTargets() {
  targets.clear()
}
