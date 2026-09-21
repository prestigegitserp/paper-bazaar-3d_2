const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'
const DIGIT_CLASS = `0-9${FA_DIGITS}${AR_DIGITS}`
const NUMBER_PATTERN = `(?:[${DIGIT_CLASS}]{1,3}(?:[٬,\\s][${DIGIT_CLASS}]{3})+|[${DIGIT_CLASS}]+)`
const PRICE_RE = new RegExp(`${NUMBER_PATTERN}\\s*(?:تومان|تومن)`, 'g')

export function normalizeText(value = '') {
  return String(value)
    .replace(/[يك]/g, (char) => (char === 'ي' ? 'ی' : 'ک'))
    .replace(/\u200c/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function toLatinDigits(value = '') {
  return String(value)
    .replace(/[۰-۹]/g, (digit) => String(FA_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(AR_DIGITS.indexOf(digit)))
}

export function priceToNumber(value = '') {
  const digitsOnly = toLatinDigits(value).replace(/[^0-9]/g, '')
  return digitsOnly ? Number(digitsOnly) : Number.NaN
}

export function extractPriceCandidates(value = '') {
  const matches = normalizeText(value).match(PRICE_RE) ?? []
  const unique = new Map()

  for (const raw of matches) {
    const text = normalizeText(raw)
    const numeric = priceToNumber(text)
    if (!Number.isFinite(numeric) || numeric <= 0) continue
    if (!unique.has(numeric)) unique.set(numeric, text)
  }

  return [...unique.entries()]
    .sort(([a], [b]) => a - b)
    .map(([numeric, text]) => ({ numeric, text }))
}

function productNameCandidates(productName) {
  const normalized = normalizeText(productName)
  const latinDigits = toLatinDigits(normalized)
  return [...new Set([normalized, latinDigits])].filter(Boolean)
}

export function findPriceNear(text, productName, windowSize = 900) {
  const haystack = normalizeText(text)
  if (!haystack) return null

  const candidates = productNameCandidates(productName)
  let index = -1
  for (const candidate of candidates) {
    index = toLatinDigits(haystack).indexOf(candidate)
    if (index >= 0) break
  }

  if (index < 0) return null
  const sample = haystack.slice(index, index + windowSize)
  const matches = [...sample.matchAll(PRICE_RE)]
  const seen = new Set()
  const prices = []
  for (const match of matches) {
    const text = normalizeText(match[0])
    const numeric = priceToNumber(text)
    if (!Number.isFinite(numeric) || numeric <= 0 || seen.has(numeric)) continue
    seen.add(numeric)
    prices.push({ text, numeric, index: match.index ?? 0, length: match[0].length })
    if (prices.length === 2) break
  }

  if (!prices.length) return null
  if (prices.length === 1) return prices[0].text

  const between = normalizeText(sample.slice(prices[0].index + prices[0].length, prices[1].index))
  const explicitRange = /تا|الی|[-–—~]/.test(between)
  return explicitRange ? `${prices[0].text} تا ${prices[1].text}` : prices[0].text
}
