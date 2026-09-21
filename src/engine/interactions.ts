import type { Object3D } from 'three'
import type { Interaction } from '../domain/interaction'

export function interactionFromObject(object: Object3D | null): Interaction | null {
  let current = object
  while (current) {
    const interaction = current.userData?.interaction as Interaction | undefined
    if (interaction) return interaction
    current = current.parent
  }
  return null
}

export function interactionKey(value: Interaction | null) {
  if (!value) return ''
  const suffix = 'productId' in value
    ? value.productId
    : 'documentId' in value
      ? value.documentId
      : ''
  return `${value.kind}:${value.vendorId}:${suffix}`
}
