import test from 'node:test'
import assert from 'node:assert/strict'
import { readCatalogFile, seedPath, validateCatalog } from './catalog.mjs'

test('seed catalog is valid', async () => {
  const catalog = await readCatalogFile(seedPath)
  assert.ok(catalog.vendors.length >= 1)
})

test('catalog validation rejects malformed critical fields', () => {
  const errors = validateCatalog({
    title: 'x', generatedAt: '2026-09-20', currency: 'IRT', disclaimer: 'demo', vendors: [
      {
        id: 'a', name: 'A', shortName: 'A', tagline: 'A', website: 'https://example.com', sourceLabel: 'example.com', products: []
      },
      {
        id: 'a', name: 'B', shortName: 'B', tagline: 'B', website: 'https://example.org', sourceLabel: 'example.org', products: []
      }
    ]
  })
  assert.ok(errors.some((x) => x.includes('unique')))
  assert.ok(errors.some((x) => x.includes('products must be non-empty')))
})

test('catalog domain does not require spatial booth data', () => {
  const errors = validateCatalog({
    title: 'x', generatedAt: '2026-09-20', currency: 'IRT', disclaimer: 'demo', vendors: [
      {
        id: 'vendor', name: 'Vendor', shortName: 'V', tagline: 'Paper', website: 'https://example.com', sourceLabel: 'example.com',
        products: [{ id: 'p1', name: 'Paper', priceText: '۱۰۰ تومان', unit: 'demo', sourceUrl: 'https://example.com/p1', observedAt: '2026-09-20' }]
      }
    ]
  })
  assert.deepEqual(errors, [])
})
