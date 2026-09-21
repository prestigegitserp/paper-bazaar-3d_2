import * as cheerio from 'cheerio'
import { findPriceNear, normalizeText } from '../price-utils.mjs'

function findPageLevelPrice($) {
  const selectorGroups = [
    '.price ins .woocommerce-Price-amount',
    '.summary .price .woocommerce-Price-amount',
    '.woocommerce-Price-amount',
    '[itemprop="price"]',
    '.price'
  ]

  for (const selector of selectorGroups) {
    const values = $(selector)
      .map((_, element) => normalizeText($(element).text()))
      .get()
      .filter((value) => /تومان|تومن/.test(value))

    if (values.length === 1) return values[0]
    if (values.length > 1) return `${values[0]} تا ${values[1]}`
  }

  return null
}

export const genericHtmlAdapter = {
  id: 'generic-html',
  supports: () => true,
  extractPrice({ html, product }) {
    const $ = cheerio.load(html)
    const isDedicatedProductPage = /\/product\//i.test(product.sourceUrl)
    const pageLevelPrice = isDedicatedProductPage ? findPageLevelPrice($) : null
    return pageLevelPrice || findPriceNear($('body').text(), product.name)
  }
}
