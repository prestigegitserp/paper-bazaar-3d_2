# Architecture

## هدف

معماری باید اجازه دهد سه چیز مستقل تغییر کنند: داده‌ی تجاری، مدل/اسکن سه‌بعدی، و runtime renderer. تغییر یکی نباید دیگری را مجبور به rewrite کند.

## Boundaryها

### Domain

`src/domain` هیچ اطلاعی از Three.js، مختصات یا renderer ندارد. `Vendor` و `Product` می‌توانند از WordPress، PostgreSQL، ERP یا crawler بیایند.

### World

`src/world` توصیف فضایی است. `WorldDefinition` شامل Roomها، transform، asset، hotspot و colliderهای عمومی است. `vendorId` فقط یک reference بین World و Catalog است.

### Engine

`src/engine` منطق runtime قابل تست را نگه می‌دارد: collision و resolution تعامل. این بخش نباید به UI وابسته شود.

### Renderer

`RoomRenderer` adapter بین World schema و React Three Fiber است. procedural booth فقط یکی از rendererهاست. GLTF/scan می‌تواند renderer دیگری داشته باشد.

### UI

HUD اطلاعات Catalog را نشان می‌دهد و فقط برای نمایش spatial metadata محدود به World دسترسی دارد. عملیات داده‌ای نباید در componentهای UI پیاده شود.

## قرارداد Room

یک Room در ساده‌ترین شکل:

```ts
{
  id,
  vendorId,
  position,
  rotationY,
  theme,
  asset,
  hotspots
}
```

`asset.kind` renderer را تعیین می‌کند. Hotspotها interaction semantic تولید می‌کنند؛ مثلاً «باز کردن محصول» به جای «کلیک روی mesh شماره 42».

این تفکیک برای Digital Twin مهم است چون mesh/node nameهای فایل اسکن ممکن است با هر export عوض شوند، اما action تجاری باید پایدار بماند.

## Hotspotها

دو نوع anchor تعریف شده است:

- `slot`: برای rendererهای procedural که slotهای شناخته‌شده مثل management desk دارند.
- `point`: برای GLTF/scan و خروجی آینده‌ی Hotspot Editor.

در نسخه‌ی بعد می‌توان anchorهای `node` یا `surface` را اضافه کرد؛ مثلاً اتصال به node نام‌دار GLTF یا مختصات barycentric روی یک triangle.

## Collision

collision فعلی lightweight و 2D است و برای prototype مناسب است. colliderها از `WorldDefinition` و layout procedural ساخته می‌شوند. وقتی اتاق‌های واقعی اضافه شدند، collider باید به asset metadata منتقل شود و احتمالاً Rapier یا یک navmesh جایگزین الگوریتم فعلی شود.

نکته‌ی مهم این است که PlayerController دیگر از Vendorها collider استخراج نمی‌کند؛ collision متعلق به World است.

## Data provider

frontend از `catalogClient.ts` استفاده می‌کند. Store فقط `Catalog` می‌بیند و نمی‌داند داده از HTTP یا seed آمده است. بعداً provider را می‌توان به WordPress REST، GraphQL یا endpoint داخلی تغییر داد.

## اصولی که باید حفظ شوند

- Vendor نباید مختصات سه‌بعدی داشته باشد.
- Product نباید reference مستقیم به mesh داشته باشد.
- Room نباید قیمت محصول را کپی کند.
- crawler نباید componentهای frontend را بشناسد.
- renderer نباید SQL/WordPress/API را بشناسد.
- hotspot باید action semantic داشته باشد، نه callback ذخیره‌شده در JSON.


## v0.6 runtime content boundary

App دیگر Catalog را جداگانه و World را با import مستقیم مصرف نمی‌کند. `loadRuntimeBundle()` repositoryها را compose می‌کند و یک snapshot سازگار از Catalog، World و Documents به store می‌دهد.

این boundary برای مهاجرت سرور مهم است: در آینده endpoint می‌تواند WorldDefinition و Document metadata را برگرداند و scene بدون تغییر rendererهای داخلی آن را مصرف کند.

## Retail profile boundary

Procedural booth renderer از `RoomDefinition.experience.profileId` استفاده می‌کند. profile یک template قابل‌استفاده مجدد است و vendor-specific business data در آن ذخیره نمی‌شود.

Surfaceهای profile نیز ID هستند، نه فایل hard-coded. material registry می‌تواند implementation را از procedural texture به PBR asset واقعی تغییر دهد.
