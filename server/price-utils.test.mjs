import test from 'node:test'
import assert from 'node:assert/strict'
import { extractPriceCandidates, findPriceNear, priceToNumber, toLatinDigits } from './price-utils.mjs'

test('normalizes Persian and Arabic digits', () => {
  assert.equal(toLatinDigits('۱۲۳٤٥'), '12345')
  assert.equal(priceToNumber('۱٬۴۸۰٬۰۰۰ تومان'), 1480000)
})


test('accepts whitespace inside formatted price tokens', () => {
  assert.equal(priceToNumber('۱ ۴۸۰ ۰۰۰ تومان'), 1480000)
  assert.deepEqual(extractPriceCandidates('قیمت ۱ ۴۸۰ ۰۰۰ تومان').map((x) => x.numeric), [1480000])
})

test('deduplicates and sorts price candidates', () => {
  assert.deepEqual(
    extractPriceCandidates('قیمت ۹۵۰٬۰۰۰ تومان و قبلی ۱٬۱۰۰٬۰۰۰ تومان و دوباره ۹۵۰٬۰۰۰ تومان').map((x) => x.numeric),
    [950000, 1100000]
  )
})

test('finds the price after a product title without pulling a preceding product price', () => {
  const text = 'محصول دیگر ۵۰۰٬۰۰۰ تومان ... کاغذ A4 دابل A قیمت ۹۵۰٬۰۰۰ تومان ارسال عمده'
  assert.equal(findPriceNear(text, 'کاغذ A4 دابل A'), '۹۵۰٬۰۰۰ تومان')
})

test('preserves an explicit price range', () => {
  const text = 'تحریر ۷۰ گرم ۶۰×۹۰ ۱٬۴۸۰٬۰۰۰ تومان – ۳۱٬۰۸۰٬۰۰۰ تومان'
  assert.equal(findPriceNear(text, 'تحریر ۷۰ گرم ۶۰×۹۰'), '۱٬۴۸۰٬۰۰۰ تومان تا ۳۱٬۰۸۰٬۰۰۰ تومان')
})

test('does not invent a range from two unrelated nearby prices', () => {
  const text = 'کاغذ ویژه ۱٬۱۰۰٬۰۰۰ تومان قیمت همکار ۹۵۰٬۰۰۰ تومان'
  assert.equal(findPriceNear(text, 'کاغذ ویژه'), '۱٬۱۰۰٬۰۰۰ تومان')
})
