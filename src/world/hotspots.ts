import type { Vendor } from '../domain/catalog'
import type { Interaction } from '../domain/interaction'
import type { HotspotDefinition, HotspotSlot } from './types'

export function resolveHotspotInteraction(hotspot: HotspotDefinition, vendor: Vendor): Interaction | null {
  const action = hotspot.action
  if (action.kind !== 'product-slot') return action

  const product = vendor.products[action.productIndex]
  if (!product) return null
  return {
    kind: 'product',
    vendorId: vendor.id,
    productId: product.id,
    label: product.name
  }
}

export function findHotspot(hotspots: HotspotDefinition[], slot: HotspotSlot, index?: number) {
  return hotspots.find((hotspot) => {
    if (hotspot.anchor.kind !== 'slot' || hotspot.anchor.slot !== slot) return false
    return slot !== 'product-pedestal' || hotspot.anchor.index === index
  }) ?? null
}
