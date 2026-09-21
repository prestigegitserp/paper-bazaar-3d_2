import test from 'node:test'
import assert from 'node:assert/strict'
import { refreshCatalogData } from './scrape.mjs'

const baseCatalog = {
  title: 'Test catalog',
  generatedAt: '2026-09-20T00:00:00Z',
  currency: 'IRT',
  disclaimer: 'demo',
  vendors: [
    {
      id: 'v1',
      name: 'Vendor',
      shortName: 'V',
      tagline: 'Paper',
      website: 'https://example.com',
      sourceLabel: 'example.com',
      products: [
        {
          id: 'p1',
          name: 'کاغذ A4 تست',
          priceText: '۱۰۰ تومان',
          numericPrice: 100,
          unit: 'demo',
          sourceUrl: 'https://example.com/product/p1',
          observedAt: '2026-09-19'
        }
      ]
    }
  ]
}

test('refreshCatalogData updates a product through the adapter registry', async () => {
  const html = '<html><body><h1>کاغذ A4 تست</h1><div class="price"><span class="woocommerce-Price-amount">۹۵۰٬۰۰۰ تومان</span></div></body></html>'
  const catalog = await refreshCatalogData(baseCatalog, {
    fetchHtmlFn: async () => html,
    delayFn: async () => {},
    requestDelayMs: 0,
    observedAt: '2026-09-20'
  })

  const product = catalog.vendors[0].products[0]
  assert.equal(product.priceText, '۹۵۰٬۰۰۰ تومان')
  assert.equal(product.numericPrice, 950000)
  assert.equal(product.observedAt, '2026-09-20')
  assert.equal(product.crawlStatus, 'updated')
})

test('refreshCatalogData preserves seed price when source has no trustworthy price', async () => {
  const catalog = await refreshCatalogData(baseCatalog, {
    fetchHtmlFn: async () => '<html><body><h1>کاغذ A4 تست</h1><p>برای قیمت تماس بگیرید</p></body></html>',
    delayFn: async () => {},
    requestDelayMs: 0,
    observedAt: '2026-09-20'
  })

  const product = catalog.vendors[0].products[0]
  assert.equal(product.priceText, '۱۰۰ تومان')
  assert.equal(product.crawlStatus, 'seed-fallback')
})
