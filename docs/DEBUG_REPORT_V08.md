# v0.8 Debug report

## هدف

این pass بعد از اضافه‌شدن اولین authored GLB انجام شده و هم runtime فنی و هم منطق تجربه‌ی کاربر را پوشش می‌دهد.

## Visual regression

مشکل گزارش‌شده: labelهای HTML داخل غرفه‌ها به‌علت ماهیت DOM overlay از غرفه‌های دیگر هم قابل مشاهده بودند و حس عمق/آرامش صحنه را خراب می‌کردند.

اصلاح:
- component جدید `RoomScopedHtml`
- شرط visibility بر اساس `started && activeRoomId === roomId`
- migration همه‌ی labelهای داخلی StockWall، ProductDisplays، ShopCounter و MarketProps
- storefront sign از این محدودیت مستثنا است چون بخشی از wayfinding راسته است
- تست `visual-regression.test.mjs` مانع بازگشت `<Html>` خام به fixtureهای داخلی می‌شود

## Active room logic

ایراد قبلی:
`findActiveRoom` برای هر Room ابتدا containment و بلافاصله discovery را بررسی می‌کرد. در نتیجه یک Room زودتر در array می‌توانست فقط به‌دلیل discovery radius انتخاب شود، در حالی که بازیکن واقعاً داخل Room بعدی قرار داشت.

اصلاح:
1. pass اول: containment واقعی همه Roomها
2. pass دوم: فقط اگر هیچ Room واقعی پیدا نشد، discovery
3. انتخاب نزدیک‌ترین candidate به‌جای اولین candidate

این رفتار با `world-logic.test.mjs` پوشش داده شده است.

## Authored GLB

Source-of-truth:
`scripts/generate-authored-shop.mjs`

Artifact:
`public/models/iran-paper-authored-v1.glb`

GLB هنگام build/dev تولید می‌شود و تست مستقل موارد زیر را بررسی می‌کند:
- GLB v2 header
- length header
- JSON chunk
- وجود nodeهای semantic interaction
- حداقل complexity مورد انتظار
- وجود material شیشه

## Semantic node hotspots

v0.8 نوع anchor جدید دارد:

```ts
{ kind: 'node', nodeName: 'hotspot_catalog' }
```

مزیت:
- interaction به triangle index وابسته نیست
- export مجدد مدل تا وقتی نام node semantic حفظ شود interaction را نمی‌شکند
- برای Blender-authored GLB و Digital Twin pipeline مناسب‌تر است
- point hotspot همچنان fallback باقی می‌ماند

## Validation hardening

World validator اکنون خطا می‌دهد اگر:
- node anchor روی procedural/non-GLTF asset باشد
- slot anchor روی file-backed room استفاده شود
- nodeName خالی باشد
- point coordinate غیرعددی/نامتناهی باشد
- vendor interaction با vendor Room ناسازگار باشد

## CI gates

قبل از merge باید این مراحل سبز باشند:
- crawler/catalog tests
- authored GLB test
- world logic tests
- visual regression test
- TypeScript project build
- Vite production build
