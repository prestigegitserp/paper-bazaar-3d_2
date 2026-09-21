import fs from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { livePath, readCatalogFile, seedPath } from './catalog.mjs'
import { fetchHtml } from './crawling/fetch-html.mjs'
import { getSourceAdapter } from './crawling/source-registry.mjs'
import { normalizeText, priceToNumber } from './price-utils.mjs'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function refreshCatalogData(inputCatalog, {
  fetchHtmlFn = fetchHtml,
  delayFn = delay,
  requestDelayMs = 650,
  observedAt = new Date().toISOString().slice(0, 10)
} = {}) {
  const catalog = structuredClone(inputCatalog)
  const cache = new Map()

  for (const vendor of catalog.vendors) {
    for (const product of vendor.products) {
      try {
        let html = cache.get(product.sourceUrl)
        if (!html) {
          html = await fetchHtmlFn(product.sourceUrl)
          cache.set(product.sourceUrl, html)
          if (requestDelayMs > 0) await delayFn(requestDelayMs)
        }

        const adapter = getSourceAdapter(product.sourceUrl)
        const price = adapter.extractPrice({ html, product, vendor })

        if (price) {
          product.priceText = normalizeText(price)
          product.observedAt = observedAt
          product.crawlStatus = 'updated'
          if (/تا|الی/.test(product.priceText)) delete product.numericPrice
          else {
            const numeric = priceToNumber(product.priceText)
            if (Number.isFinite(numeric)) product.numericPrice = numeric
          }
          delete product.crawlError
        } else {
          product.crawlStatus = 'seed-fallback'
          delete product.crawlError
        }
      } catch (error) {
        product.crawlStatus = 'fetch-failed'
        product.crawlError = String(error?.message ?? error).slice(0, 180)
      }
    }
  }

  catalog.generatedAt = new Date().toISOString()
  if (!catalog.disclaimer.includes('بروزرسانی خودکار آزمایشی')) {
    catalog.disclaimer += ' بروزرسانی خودکار آزمایشی است؛ قبل از استفاده تجاری، robots.txt و شرایط استفاده هر منبع را بررسی کنید.'
  }
  return catalog
}

export async function refreshCatalog(options = {}) {
  const seedCatalog = await readCatalogFile(seedPath)
  const catalog = await refreshCatalogData(seedCatalog, options)
  await fs.writeFile(livePath, JSON.stringify(catalog, null, 2), 'utf8')
  return catalog
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const catalog = await refreshCatalog()
  const products = catalog.vendors.flatMap((vendor) => vendor.products)
  const updated = products.filter((product) => product.crawlStatus === 'updated').length
  const failed = products.filter((product) => product.crawlStatus === 'fetch-failed').length
  console.log(`Refreshed ${updated}/${products.length} product prices (${failed} fetch failures). Wrote ${livePath}`)
}
