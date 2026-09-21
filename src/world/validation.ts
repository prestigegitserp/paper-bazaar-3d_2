import type { Catalog } from '../domain/catalog'
import type { WorldDefinition } from './types'
import { hasBoothProfile } from './boothProfiles'

export function validateWorldDefinition(world: WorldDefinition, catalog: Catalog) {
  const errors: string[] = []
  const vendorIds = new Set(catalog.vendors.map((vendor) => vendor.id))
  const roomIds = new Set<string>()
  const hotspotIds = new Set<string>()

  if (!world.id.trim()) errors.push('world.id is required')
  if (world.bounds.minX >= world.bounds.maxX || world.bounds.minZ >= world.bounds.maxZ) errors.push('world bounds are invalid')

  for (const room of world.rooms) {
    if (roomIds.has(room.id)) errors.push(`duplicate room id: ${room.id}`)
    roomIds.add(room.id)

    if (room.vendorId && !vendorIds.has(room.vendorId)) errors.push(`${room.id} references missing vendor: ${room.vendorId}`)
    if (room.footprint[0] <= 0 || room.footprint[1] <= 0) errors.push(`${room.id} has invalid footprint`)
    if (room.discoveryRadius <= 0) errors.push(`${room.id} has invalid discoveryRadius`)
    if (!room.asset.assetId.trim() || !room.asset.version.trim()) errors.push(`${room.id} asset metadata is incomplete`)
    if (room.asset.kind === 'procedural' && (!room.experience?.profileId || !hasBoothProfile(room.experience.profileId))) {
      errors.push(`${room.id} has an unknown booth experience profile`)
    }

    if ((room.asset.kind === 'gltf' || room.asset.kind === 'scan') && !room.asset.url.trim()) {
      errors.push(`${room.id} asset URL is empty`)
    }

    for (const hotspot of room.hotspots) {
      if (hotspotIds.has(hotspot.id)) errors.push(`duplicate hotspot id: ${hotspot.id}`)
      hotspotIds.add(hotspot.id)

      if ('vendorId' in hotspot.action && room.vendorId && hotspot.action.vendorId !== room.vendorId) {
        errors.push(`${hotspot.id} points to a vendor different from its room`)
      }

      if ('vendorId' in hotspot.action && !vendorIds.has(hotspot.action.vendorId)) {
        errors.push(`${hotspot.id} references missing vendor: ${hotspot.action.vendorId}`)
      }

      if (hotspot.action.kind === 'product-slot' && hotspot.action.productIndex < 0) {
        errors.push(`${hotspot.id} has an invalid product index`)
      }

      if (hotspot.anchor.kind === 'node') {
        if (!hotspot.anchor.nodeName.trim()) errors.push(`${hotspot.id} has an empty node anchor`)
        const nodeCapable = room.asset.kind === 'gltf' || (room.asset.kind === 'scan' && room.asset.format === 'gltf')
        if (!nodeCapable) errors.push(`${hotspot.id} uses a node anchor on a non-GLTF room`)
      }

      if (hotspot.anchor.kind === 'slot' && room.asset.kind !== 'procedural') {
        errors.push(`${hotspot.id} uses a procedural slot anchor on a file-backed room`)
      }

      if (hotspot.anchor.kind === 'point' && hotspot.anchor.position.some((value) => !Number.isFinite(value))) {
        errors.push(`${hotspot.id} has invalid point coordinates`)
      }
    }

    for (const collider of room.colliders) {
      if (collider.kind === 'box' && (collider.size[0] <= 0 || collider.size[1] <= 0)) errors.push(`${room.id} has an invalid box collider`)
      if (collider.kind === 'circle' && collider.radius <= 0) errors.push(`${room.id} has an invalid circle collider`)
    }
  }

  return errors
}
