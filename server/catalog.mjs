import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const seedPath = path.join(__dirname, 'data', 'catalog.seed.json')
export const livePath = path.join(__dirname, 'data', 'catalog.live.json')

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isHttpUrl(value) {
  if (!isNonEmptyString(value)) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateCatalog(catalog) {
  const errors = []
  if (!catalog || typeof catalog !== 'object') return ['catalog must be an object']
  if (!isNonEmptyString(catalog.title)) errors.push('title is required')
  if (!isNonEmptyString(catalog.generatedAt) || Number.isNaN(Date.parse(catalog.generatedAt))) errors.push('generatedAt must be a valid date')
  if (!['IRR', 'IRT'].includes(catalog.currency)) errors.push('currency must be IRR or IRT')
  if (!isNonEmptyString(catalog.disclaimer)) errors.push('disclaimer is required')
  if (!Array.isArray(catalog.vendors) || !catalog.vendors.length) errors.push('vendors must be a non-empty array')

  const vendorIds = new Set()
  for (const [vendorIndex, vendor] of (catalog.vendors ?? []).entries()) {
    const prefix = `vendors[${vendorIndex}]`
    if (!isNonEmptyString(vendor.id)) errors.push(`${prefix}.id is required`)
    else if (vendorIds.has(vendor.id)) errors.push(`${prefix}.id must be unique`)
    else vendorIds.add(vendor.id)

    if (!isNonEmptyString(vendor.name)) errors.push(`${prefix}.name is required`)
    if (!isNonEmptyString(vendor.shortName)) errors.push(`${prefix}.shortName is required`)
    if (!isNonEmptyString(vendor.tagline)) errors.push(`${prefix}.tagline is required`)
    if (!isHttpUrl(vendor.website)) errors.push(`${prefix}.website must be an http(s) URL`)
    if (!isNonEmptyString(vendor.sourceLabel)) errors.push(`${prefix}.sourceLabel is required`)
    if (!Array.isArray(vendor.products) || !vendor.products.length) errors.push(`${prefix}.products must be non-empty`)

    const productIds = new Set()
    for (const [productIndex, product] of (vendor.products ?? []).entries()) {
      const productPrefix = `${prefix}.products[${productIndex}]`
      if (!isNonEmptyString(product.id)) errors.push(`${productPrefix}.id is required`)
      else if (productIds.has(product.id)) errors.push(`${productPrefix}.id must be unique within vendor`)
      else productIds.add(product.id)
      if (!isNonEmptyString(product.name)) errors.push(`${productPrefix}.name is required`)
      if (!isNonEmptyString(product.priceText)) errors.push(`${productPrefix}.priceText is required`)
      if (!isNonEmptyString(product.unit)) errors.push(`${productPrefix}.unit is required`)
      if (!isHttpUrl(product.sourceUrl)) errors.push(`${productPrefix}.sourceUrl must be an http(s) URL`)
      if (!isNonEmptyString(product.observedAt) || Number.isNaN(Date.parse(product.observedAt))) errors.push(`${productPrefix}.observedAt must be a valid date`)
    }
  }

  return errors
}

export async function readCatalogFile(filePath) {
  const catalog = JSON.parse(await fs.readFile(filePath, 'utf8'))
  const errors = validateCatalog(catalog)
  if (errors.length) throw new Error(`Invalid catalog: ${errors.join('; ')}`)
  return catalog
}

export async function readCatalog() {
  try {
    return await readCatalogFile(livePath)
  } catch (liveError) {
    if (liveError?.code !== 'ENOENT') console.warn(`[catalog] live catalog ignored: ${liveError.message}`)
    return readCatalogFile(seedPath)
  }
}
