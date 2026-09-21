# Paper Bazaar 3D

نسخه فعلی: **v0.16.0**

یک prototype سه‌بعدی ماژولار برای بازار کاغذ ایران با React، TypeScript، Three.js و React Three Fiber. v0.15 مستقیماً روی snapshot پایدار v0.14 ساخته شده است: runtime سبک‌تر، hero shop authored v4 و تعامل‌هایی که بدون شکستن flow حرکت اجازه‌ی نمونه‌برداری، استعلام چندفروشنده و مقایسه می‌دهند. قراردادهای World/Catalog/Documents/Scan و تمام releaseهای قبلی حفظ شده‌اند.

## اجرا

```bash
npm install
npm run dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:8787/api/catalog`

## کنترل‌ها

| محیط | کنترل |
|---|---|
| Desktop | WASD / Mouse / Shift / E |
| Zoom desktop | Mouse wheel؛ داخل دوربین سه‌بعدی |
| Reset zoom | 0 |
| Reset position | R |
| Map | M |
| Quality | Q |
| Diagnostics | F3 |
| Mobile move | joystick سمت چپ |
| Mobile look | drag در نیمه راست |
| Mobile interact | E |
| Mobile zoom | pinch یا +/- |

## v0.16 — Production Art + Portable Asset Runtime

از v0.16 توسعه فقط در repository جدید `prestigegitserp/paper-bazaar-3d_2` ادامه پیدا می‌کند. repository قبلی frozen است و `release/v0.15.0` در این repo نقطه‌ی مهاجرت/rollback قبل از جراحی ساختاری است.

### جهش بصری
- سه Hero Shop مستقل: عمده‌فروشی رول و بندل، بسته‌بندی/کارتن، و استودیوی sample/fine-paper.
- هر Hero Shop geometry و prop dressing متفاوت دارد، اما semantic hotspot contract یکسان است.
- palette کل تجربه از cyber-blue به بازار گرم، کاغذی و صنعتی تغییر کرده است.
- نورپردازی هر Hero Shop profile مستقل key/fill/rim دارد و فقط هنگام residency همان room mount می‌شود.
- wear، labels و atlas dressing مستقل از business data و مستقل از topology هستند.

### Atlas / KTX2
- build یک material atlas مشترک 1024×1024 با 16 tile تولید می‌کند.
- CI با KTX-Software 4.4.2 atlas را به KTX2/ETC1S + mipmaps تبدیل می‌کند.
- runtime از KTX2Loader و Basis transcoder استفاده می‌کند و برای local/offline fallback PNG دارد.
- materialهای paper/cardboard/paint/silver/labels از tileهای مشترک atlas استفاده می‌کنند تا texture residency انفجاری نشود.

### معماری قابل‌تعویض
- `RoomDefinition` فقط asset + `presentationProfileId` را انتخاب می‌کند.
- `assetPresentationRegistry` LOD، material binding، shadow policy، lighting و dressing را تعریف می‌کند.
- افزودن GLB/scan جدید نیازمند fork کردن RoomRenderer نیست.
- scanهای GLTF از همان residency و interaction path عبور می‌کنند؛ topology و business data همچنان جدا هستند.
- texture set، lighting profile یا حتی کل asset یک غرفه می‌تواند مستقل تعویض شود.

### Performance
- file/scan residency با profile کنترل می‌شود؛ heroها می‌توانند prefetch بزرگ‌تر داشته باشند بدون سنگین‌کردن غرفه‌های procedural.
- v0.15 procedural wake/sleep یعنی 11.5m/15.5m حفظ شده است.
- tiny props و transparent props در Hero Shop به‌صورت پیش‌فرض shadow caster نیستند.
- repeated authored meshes همچنان در runtime batch می‌شوند.
- KTX2 و atlas برای کاهش texture bandwidth/residency به pipeline اضافه شده‌اند.
- Hero lighting هیچ shadow map اضافی تولید نمی‌کند.

## v0.15 — Human Market Runtime

این نسخه مستقیماً از `release/v0.14.0` ساخته شده و releaseهای قبلی immutable مانده‌اند.

### Performance
- GLBهای file-backed بعد از دورشدن دوباره به proxy برمی‌گردند، ولی asset prefetched در cache می‌ماند.
- procedural detail علاوه بر فاصله، بودجه‌ی جهت نگاه و forced-near radius دارد.
- شیشه‌های تزئینی راهرو transmission ندارند؛ transmission واقعی فقط در hero/authored shop نزدیک باقی می‌ماند.
- passive raycast از frame-count به pose/time scheduler منتقل شده تا روی نمایشگر 120/144Hz هزینه چندبرابر نشود.
- halo خاموش callback فریم ندارد و point light تعاملی حذف شده است.
- storefront proxy از text texture کم‌رزولوشن‌تر استفاده می‌کند.
- F3 حالا FPS، frame time، raycasts/s و تعداد proxy/detail/file room را نشان می‌دهد.

### Human interaction
- `E`: بررسی کامل interaction
- `F`: برداشت سریع نمونه بدون خروج از حرکت
- `C`: اضافه/حذف سریع کالا از سبد استعلام
- `G`: راهنمای نزدیک‌ترین غرفه‌ی کشف‌نشده
- سبد استعلام چندفروشنده با مقایسه قیمت/واحد، حذف، پاک‌کردن و کپی پیش‌نویس
- feedback کوتاه برای sample/favorite/quote به‌جای mutation خاموش

### Hero shop v4
- GLB authored جدید با clipboard سفارش، مهر، ink pad، ترازو، tape roll با torus واقعی، hand-truck و sample-bookهای بیشتر
- نور hero محلی فقط وقتی FileRoomRenderer نزدیک mount است

جزئیات فنی: [docs/DEBUG_REPORT_V015_HUMAN_RUNTIME.md](docs/DEBUG_REPORT_V015_HUMAN_RUNTIME.md)

## v0.14 — Living Market / Root Treatment

این نسخه مستقیماً روی snapshot پایدار `release/v0.13.0` ساخته شده است و هیچ release branch قبلی بازنویسی نمی‌شود.

### Performance
- غرفه‌های procedural دور با storefront proxy سبک نمایش داده می‌شوند و جزئیات داخلی فقط در شعاع تعامل mount می‌شوند.
- wake/sleep با hysteresis انجام می‌شود تا هنگام حرکت بین غرفه‌ها mount/unmount مداوم رخ ندهد.
- decalهای wear یک cache کوچک مشترک دارند و canvas آن‌ها از 512×256 به 256×128 کاهش یافته است.
- تمام بهینه‌سازی‌های v0.13 شامل Adaptive DPR، static shadows، idle shader warm-up، GLB streaming و staged PBR حفظ شده‌اند.

### Texture / material realism
- `wood-walnut` به Poly Haven Walnut Veneer و `wood-oak` به Oak Wood Planks متصل شده‌اند.
- fallbackهای procedural چوب، plaster و metal دیگر فقط noise یکنواخت نیستند؛ knot، broad blotch و scratch اضافه شده است.
- micro roughness روی تمام fallback surfaceها فعال است.
- هر غرفه‌ی نزدیک floor scuff، wall smudge، fingerprint و clutter کم‌هزینه‌ی روزمره می‌گیرد: فنجان، رسید، کارتن چسب‌خورده و حلقه‌ی چسب.

### Interaction / gamification
- یک sample rail تا سه محصول هر فروشگاه را مستقیماً در فضای سه‌بعدی قابل تعامل می‌کند.
- لیست محصولات به‌جای پرتاب فوری به وب، ابتدا محصول را داخل تجربه باز می‌کند.
- کاربر می‌تواند نمونه بردارد، محصول را برای مقایسه ذخیره کند و برای کشف غرفه/کالا امتیاز بگیرد.
- پنل «ماموریت بازارگرد» پیشرفت بازدید غرفه‌ها، بررسی محصولات و جمع‌آوری نمونه‌ها را نشان می‌دهد.

جزئیات فنی: [docs/DEBUG_REPORT_V014_LIVING_MARKET.md](docs/DEBUG_REPORT_V014_LIVING_MARKET.md)

## v0.13 — Photoreal Performance Rebuild

این نسخه **از release/v0.12.0** ساخته شده و v0.13/v0.14/v0.15 آزمایشی قبلی مبنای آن نیستند.

### Performance
- shadow map سینمایی برای صحنه‌ی ثابت event-driven شده و هر فریم دوباره render نمی‌شود.
- پنل‌های سقف، چراغ‌های قابل‌دیدن و ستون‌های تکراری با instancing رسم می‌شوند.
- subdivision بی‌استفاده‌ی کف حذف شده؛ ظاهر و UV material عوض نشده است.
- هر 13 fixture سقف دیده می‌شود، اما فقط هر سومین fixture یک PointLight واقعی دارد.
- probe فاصله‌ی GLB هر 10 فریم و با squared-distance انجام می‌شود.
- transformهای authored ثابت freeze می‌شوند.
- diagnostics فقط وقتی F3 باز است frame callback دارد.
- store موقعیت بازیکن هنگام سکون بی‌جهت update نمی‌شود.
- texture decode مسیر ImageBitmap دارد و GPU uploadها در idle window سریالی warm می‌شوند.
- هنگام حرکت/چرخش دوربین فقط pixel ratio موقتاً regress می‌شود و بعد از توقف به fidelity کامل برمی‌گردد.
- shader variantها در idle با compileAsync گرم می‌شوند تا hitch ناشی از compile دیرهنگام کمتر شود.
- PMREM فقط هنگام start ساخته می‌شود؛ تغییر Quality دیگر environment را از صفر regenerate نمی‌کند.

### Texture / material realism
- PBR پایه همچنان 1K و progressive است.
- روی سیستم دسکتاپ مناسب در Cinematic، سطوح high-value و authored room اجازه‌ی 2K دارند.
- هر درخواست 2K در صورت خطا خودکار به 1K برمی‌گردد.
- micro normal مستقل برای clearcoat سطوح صیقلی اضافه شده است.
- کاغذ و مقوا micro bump + roughness اختصاصی دارند تا در نمای نزدیک تخت دیده نشوند.
- fiber albedo محلی و deterministic برای paper/cardboard روی UV واقعی GLB اضافه شده تا رنگ سطح کاملاً تخت نباشد.
- micro roughness در فاز albedo-only فاصله‌ی بین fallback و full PBR را بدون network asset اضافی پر می‌کند.
- normal واقعی PBR با bump جعلی overwrite نمی‌شود؛ کانال‌های detail با مسیر فیزیکی سازگار استفاده می‌شوند.
- AgX، PMREM، decals، fingerprints، UV، bevel و cylinderهای v0.11/v0.12 حفظ شده‌اند.

### Interaction safety
- بهینه‌سازی raycast فقط برای batchهای تزئینی ریز اعمال می‌شود.
- دیوار، قفسه و سطوح ساختاری همچنان occluder هستند؛ تعامل از پشت دیوار دوباره ایجاد نمی‌شود.

جزئیات فنی: [docs/DEBUG_REPORT_V013_REBUILD.md](docs/DEBUG_REPORT_V013_REBUILD.md) و [docs/DEBUG_REPORT_V013_DEEP_PERF.md](docs/DEBUG_REPORT_V013_DEEP_PERF.md)

## اجرا و تست کاتالوگ

داخل هر مغازه به کاتالوگ روی میز نگاه کن و `E` یا کلیک بزن. در Reader:

- `← / →` ورق زدن
- `Esc` بستن
- روی کارت محصول کلیک کن تا منبع محصول باز شود
- موبایل به حالت single-page reader می‌رود

## Versioning

نسخه‌های milestone روی branchهای release نگه داشته می‌شوند:

```text
release/v0.3.0 … release/v0.12.0
release/v0.13.0 → snapshot پایدار v0.13
release/v0.14.0 → snapshot پایدار v0.14
release/v0.15.0 → snapshot پایدار v0.15 پس از CI نهایی
main            → latest stable
```

milestoneهای پایدار روی `release/vX.Y.Z` snapshot می‌شوند؛ هر milestone پایدار بعد از CI و merge snapshot می‌شود. تاریخچه‌ی Git هم commitهای قبلی را نگه می‌دارد، بنابراین تغییر skin نسخه‌های قدیمی را حذف نمی‌کند.

جزئیات: [docs/VERSIONING.md](docs/VERSIONING.md)

## Deploy آخرین نسخه

Workflow: `.github/workflows/pages.yml`

یک‌بار در GitHub:

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

بعد از آن، هر merge/push به `main` به‌طور خودکار آخرین نسخه را build/test/deploy می‌کند. اجرای دستی هم از:

```text
Actions → Deploy latest to GitHub Pages → Run workflow
```

ممکن است.

آدرس استاندارد:

```text
https://prestigegitserp.github.io/paper-bazaar-3d/
```

GitHub Pages نسخه static را با seed catalog اجرا می‌کند؛ Express/crawler برای host سروری جدا است.

جزئیات: [docs/DEPLOY.md](docs/DEPLOY.md)

## Digital Twin / Scan

Business data از World مستقل است. Room می‌تواند procedural یا GLB/scan باشد و collider/hotspot خودش را داشته باشد:

```ts
asset: {
  kind: 'scan',
  format: 'gltf',
  capture: 'lidar',
  url: 'models/vendor-x/room.glb',
  assetId: 'scan:vendor-x:room',
  version: '2026.09.20',
  metersPerUnit: 1
}
```

مدل اسکن واقعی باید runtime asset بهینه باشد؛ raw photo set یا point cloud چندگیگابایتی نباید داخل repository اپ commit شود.

- [docs/ASSET_PIPELINE.md](docs/ASSET_PIPELINE.md)
- [docs/ASSET_CREDITS.md](docs/ASSET_CREDITS.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DEBUGGING.md](docs/DEBUGGING.md)
- [docs/MOBILE.md](docs/MOBILE.md)
- [CHANGELOG.md](CHANGELOG.md)


## Repository migration

- Legacy / frozen: `prestigegitserp/paper-bazaar-3d`
- Active v0.16+: `prestigegitserp/paper-bazaar-3d_2`
- Migrated baseline: `release/v0.15.0`
