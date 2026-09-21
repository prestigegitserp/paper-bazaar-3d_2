# Data ingestion and crawling

## هدف

قیمت و محصول داده‌ی متغیر است. World سه‌بعدی نباید با هر تغییر قیمت rebuild شود. API یک Catalog پایدار برمی‌گرداند و renderer فقط آن را مصرف می‌کند.

## وضعیت فعلی

`server/scrape.mjs` orchestration است. شبکه در `crawling/fetch-html.mjs` و استخراج در Source Adapterها قرار دارد. این separation برای fixture testing و تغییر parser بدون دست‌زدن به scheduler لازم است.

## Adapter اختصاصی

برای هر فروشگاه مهم، adapter جدا بهتر از selector عمومی است. هر adapter باید حداقل این موارد را داشته باشد:

```js
{
  id: 'vendor-id',
  supports(url) {},
  extractPrice({ html, product, vendor }) {}
}
```

بهتر است همراه هر adapter یک HTML fixture کوچک و تست regression وجود داشته باشد. اگر DOM سایت تغییر کرد، شکست فقط همان adapter را درگیر می‌کند.

## سیاست خطا

Crawler نباید از داده‌ی مبهم قیمت بسازد. اگر extraction مطمئن نیست:

- `seed-fallback`: صفحه دریافت شده اما قیمت معتبر پیدا نشده.
- `fetch-failed`: شبکه/HTTP/content-type شکست خورده.
- `updated`: قیمت استخراج و timestamp ثبت شده.

قیمت قبلی در حالت fallback حفظ می‌شود و UI باید وضعیت stale بودن را نشان دهد.

## قبل از production

- Terms of Service و robots.txt هر دامنه بررسی شود.
- نرخ crawl برای هر host مستقل محدود شود.
- retry با backoff و jitter اضافه شود.
- ETag/Last-Modified در صورت پشتیبانی منبع استفاده شود.
- snapshotها در database با تاریخچه ذخیره شوند، نه فقط یک JSON live.
- validation و anomaly detection برای جهش غیرعادی قیمت اضافه شود.
- job scheduling از web server جدا شود.
