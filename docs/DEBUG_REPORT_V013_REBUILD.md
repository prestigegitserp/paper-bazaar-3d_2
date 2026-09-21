# v0.13 Rebuild — Photoreal Performance Debug Report

## Base

این release عمداً از commit محفوظ `release/v0.12.0` ساخته شده است.

هدف:
1. افزایش سرعت بدون پایین آوردن fidelity.
2. واقعی‌تر شدن material/texture در فاصله نزدیک.
3. حفظ معماری ماژولار و قراردادهای scan/server.
4. جلوگیری از بازگشت باگ occlusion/interactions.

## Preserved from v0.12 and earlier

- progressive GLB preload/reveal
- authored GLB v3 with UV / bevel / cylinders
- physical labels, decals, scuffs and fingerprints
- instanced repeated authored meshes
- ref-counted PBR residency
- lazy Catalog Reader
- deferred intro GPU work
- AgX + PMREM
- collision, mobile controls and semantic hotspots
- World / Catalog / Documents / Scan separation

## Performance findings

### Static shadow waste

صحنه تقریباً static است ولی shadow map سینمایی لازم نیست هر frame ساخته شود.

v0.13:
```text
shadowMap.autoUpdate = false
start / quality / authored-room mount
        ↓
shadowMap.needsUpdate = true
```

حرکت دوربین به‌تنهایی shadow pass جدید نمی‌سازد.

### Repeated architecture

ستون‌ها و fixtureهای سقف geometry/material مشترک داشتند ولی draw جدا می‌خوردند.

اکنون:
- column shafts → Instances
- column bases/plates → Instances
- ceiling panels → Instances
- emissive light bars → Instances

### Invisible geometry cost

کف اصلی `PlaneGeometry` با subdivision زیاد ساخته شده بود، با اینکه displacement هندسی وجود نداشت. segmentهای اضافه حذف شدند؛ material/UV تکرارشونده همان است.

### Light count

13 fixture قابل‌دیدن حفظ شده‌اند.
فقط هر سومین fixture یک PointLight واقعی دارد و پوشش آن بزرگ‌تر شده است.

### Store / diagnostics

- DiagnosticsProbe فقط وقتی F3 فعال است mount می‌شود.
- موقعیت player تنها بعد از جابه‌جایی meaningful وارد Zustand می‌شود.
- GLB distance probe هر 10 frame اجرا می‌شود و squared-distance دارد.

## Texture pipeline

### Adaptive resolution

```text
Balanced / mobile / constrained device
  → 1K

Cinematic + desktop + enough memory/CPU + high-value surface
  → 2K candidate
  → automatic 1K fallback
```

2K سراسری نیست؛ چون هدف هم realism و هم سرعت است. در high-resolution plan فقط albedo به 2K می‌رود؛ normal و roughness روی 1K می‌مانند. micro-normal نزدیک نیز detail فرکانس‌بالا را بدون سه برابر کردن پهنای‌باند حفظ می‌کند.

### Decode / upload

- ImageBitmapLoader در مرورگرهای پشتیبان decode را از مسیر سنتی سبک‌تر می‌کند.
- TextureLoader fallback برای compatibility باقی مانده.
- GPU texture warm-up با `renderer.initTexture` در idle window و به صورت سریالی انجام می‌شود.
- PBR build concurrency همان سقف 2 job نسخه 0.12 را حفظ می‌کند.

### Micro detail

یک texture بزرگ دیگر برای micro detail دانلود نمی‌شود. detailهای 128px deterministic و cache-shared ساخته می‌شوند.

مسیر صحیح:
- porcelain/wood/metal صیقلی → `clearcoatNormalMap`
- paper/cardboard بدون PBR normal → `bumpMap + roughnessMap`
- PBR normal واقعی → authoritative `normalMap`

این طراحی از اشتباه رایج normalMap+bumpMap که در Three.js عملاً detail مورد انتظار را ترکیب نمی‌کند جلوگیری می‌کند.

## Interaction / occlusion

بهینه‌سازی aggressive «خاموش کردن raycast همه meshهای غیرتعاملی» رد شد.

چرا؟
چون اولین hit دیوار/قفسه برای جلوگیری از interaction پشت مانع لازم است.

v0.13 فقط batchهای تزئینی ریز و غیرساختاری را از raycast خارج می‌کند. structural geometry همچنان occluder می‌ماند.

## Validation

Regression suite جدید قفل می‌کند:
- base contracts v0.12
- static shadow behavior
- architecture instancing
- no useless floor subdivision
- reduced real-light policy
- diagnostics gating
- player store suppression
- throttled squared-distance streaming
- structural occlusion preservation
- adaptive 1K/2K policy
- ImageBitmap decode
- idle GPU warm-up
- material-channel-correct micro detail
- authored GLB v3/UV/bevel preservation

تمام تست‌های legacy نیز باید قبل از main/deploy سبز بمانند.


## Late deep-debug fixes

- GPU upload queue now recovers after a failed upload; one rejected texture can no longer poison every later upload job.
- idle upload explicitly propagates exceptions so PBR leases can be released rather than hanging.
- interaction Raycaster uses `far = INTERACTION_DISTANCE`, reducing unnecessary distant intersection work while preserving first-hit structural occlusion.
- file-backed renderer code is dynamically split and prefetched together with the GLB only near the relevant room.
