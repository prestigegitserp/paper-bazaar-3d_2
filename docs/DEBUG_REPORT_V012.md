# v0.12 Progressive Loading / Performance Debug Report

## Constraint

هدف این نسخه کاهش هزینه‌ی startup و فشار runtime است، نه پایین آوردن fidelity.

قواعد غیرقابل‌مذاکره:
- authored GLB v3 حفظ شود
- UV / bevel / cylinder / decal / labels حفظ شوند
- PBR albedo + normal + roughness در Cinematic حفظ شوند
- AgX و environment reflections حفظ شوند
- semantic hotspots، catalog reader، collision و mobile controls حفظ شوند
- World / Catalog / Documents / Scan contracts تغییر نکنند

## Baseline v0.11

GitHub Pages build:
- transformed modules: 653
- main JS: 1,247.22 kB
- main JS gzip: 352.51 kB
- CSS: 31.96 kB / 7.68 kB gzip
- authored GLB v3: 97,412 bytes
- Vite build time in that CI run: 4.84s

این اعداد bundle/build هستند؛ زمان واقعی شبکه به cache، دستگاه و CDN وابسته است.

## 1. File-backed room streaming

قبلاً `useGLTF` برای authored room در mount اولیه اجرا می‌شد.

v0.12:
- تا قبل از start فایل GLB درخواست نمی‌شود.
- در فاصله 24m از room، `useGLTF.preload` شروع می‌شود.
- در فاصله 18m مدل اجازه mount/reveal می‌گیرد.
- اگر کاربر با minimap سریع وارد room شود، local Suspense proxy صحنه را نگه می‌دارد.
- پس از load، مدل resident می‌ماند تا رفت‌وبرگشت باعث decode مجدد نشود.

این contract برای GLTF scan آینده هم قابل استفاده است.

## 2. Authored mesh batching

GLB v3 جزئیات زیادی دارد ولی بسیاری از stock meshها geometry/material مشترک دارند.

`batchStaticAuthoredMeshes`:
- meshهای non-interactive را بر اساس geometry + material + shadow state گروه‌بندی می‌کند.
- فقط گروه‌های 3+ عضوی را instanced می‌کند.
- hotspotهای semantic حذف یا merge نمی‌شوند.
- materialهای transparent برای جلوگیری از مشکل sorting batch نمی‌شوند.
- transform کامل هر mesh با matrix instance حفظ می‌شود.

نتیجه: silhouette و material عوض نمی‌شود، اما draw-callهای تکراری کمتر می‌شوند.

## 3. PBR residency

v0.10/v0.11 source-image cache داشت، اما هر consumer هنوز texture variant جدا clone می‌کرد.

v0.12:
- cache variant بر اساس surface/repeat/anisotropy/full-mode
- ref-count برای lifecycle
- release وقتی آخرین consumer خارج شود
- source downloads همچنان shared هستند
- ساخت variantها حداکثر 2 job هم‌زمان است

این کار burst شبکه/GPU upload را کنترل می‌کند و duplicate residency را کم می‌کند.

## 4. Progressive material phases

هر `SurfaceMaterial` سه phase دارد:

```text
fallback → albedo → full
```

- قبل از start: فقط surfaceهای critical معماری real albedo می‌گیرند.
- بعد از start: noncritical albedoها با delay deterministic پخش می‌شوند.
- Cinematic: normal + roughness در idle callback یا fallback timer فعال می‌شوند.
- Balanced: همان مسیر سبک قبلی حفظ می‌شود.

هیچ mapی از Cinematic حذف نشده؛ فقط زمان درخواست آن تغییر کرده است.

## 5. Startup GPU work

تا قبل از ورود:
- Canvas demand-mode است.
- DPR پایین‌تر است.
- shadow-map کامل غیرفعال است.
- PMREM RoomEnvironment ساخته نمی‌شود.
- 1024px floor-imperfection canvas ساخته نمی‌شود.
- SoftShadows inject نمی‌شود.

بعد از ورود همه‌ی این‌ها دوباره فعال می‌شوند.

## 6. Code split

`CatalogReader` دیگر static import نیست. chunk آن فقط وقتی interaction از نوع `document` انتخاب شود درخواست می‌شود.

## Regression gates

CI بررسی می‌کند:
- dynamic catalog import
- demand-mode intro
- deferred shadows/PMREM/floor wear
- distance-based GLB preload
- local room Suspense
- InstancedMesh batching
- semantic hotspot exclusion from batching
- PBR concurrency cap
- ref-counted texture residency
- idle PBR upgrade
- authored GLB v3 / UV / bevel / PBR stack همچنان موجود باشد
- تمام تست‌های قبلی + TypeScript + Vite production build
