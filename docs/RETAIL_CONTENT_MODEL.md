# Retail content model

## هدف

v0.7 بین «داده‌ی مغازه» و «renderer مغازه» مرز مشخص می‌گذارد. سرور آینده نباید JSX یا نام component بداند؛ فقط شناسه‌های پایدار و داده‌های serializable را می‌فرستد.

## Room instance

هر Room می‌تواند یک experience profile داشته باشد:

```ts
experience: {
  profileId: 'mellat-editorial',
  catalogDocumentId: 'catalog:mellat-pub:2026'
}
```

`profileId` به registry سمت client اشاره می‌کند. registry تعیین می‌کند layout، fixtureها، material presetها و نور چطور باشند. این یعنی backend بعداً فقط profile انتخاب می‌کند، نه اینکه renderer را کنترل کند.

## Booth profile

Profile شامل این بخش‌هاست:

- template family
- surface preset IDs
- light color/intensity
- placement میز، board، catalog و product display
- feature toggles مثل roll rack / sample wall / book wall

Profile باید reusable باشد؛ vendor data داخل profile قرار نمی‌گیرد.

## Surface registry

Surface ID می‌تواند در v0.7 به PBR واقعی resolve شود و در صورت خطا procedural fallback داشته باشد:

```text
plaster-ivory
wood-walnut
brick-aged
terrazzo-cool
paper-white
metal-brass
```

بعداً implementation می‌تواند بدون تغییر Room یا fixture به asset واقعی تبدیل شود:

```text
surface id
  ↓
material registry
  ├─ current: Poly Haven 1K PBR + CanvasTexture fallback
  └─ future: owned CDN + KTX2 albedo/normal/ORM
```

## Documents

Interaction سه‌بعدی فقط `documentId` را حمل می‌کند. Reader سند را از DocumentRepository می‌گیرد.

```ts
type Interaction = {
  kind: 'document'
  vendorId: string
  documentId: string
  label: string
}
```

فعلاً کاتالوگ‌ها از Catalog فعلی generate می‌شوند. بعداً DocumentRepository می‌تواند PDF-derived pages، CMS content یا سند versioned دیتابیس را برگرداند.

## Runtime repositories

Composition فعلی:

```text
CatalogRepository
  API → fallback seed

WorldRepository
  seed TypeScript today
  API/JSON tomorrow

DocumentRepository
  generated documents today
  CMS/PDF/API tomorrow
```

UI و Scene فقط RuntimeBundle را می‌بینند.

## قانون توسعه

- business data داخل booth profile نرود.
- React component داخل JSON ذخیره نشود.
- URL texture مستقیم داخل vendor data پخش نشود؛ surface ID استفاده شود.
- document interaction به DOM/PDF viewer callback وابسته نشود.
- scan room باید بتواند همان semantic interactionها را با point hotspot مصرف کند.


## Market fixture modules

v0.7 procedural retail renderer is split into reusable fixture modules:

- `StockWall`: shelving, paper bundles and labels
- `ShopCounter`: glass sales counter, calculator and document prop
- `ProductDisplays`: price board and featured paper reams
- `MarketProps`: sample walls, roll racks, pallets, cartons, books, pegboard and fan
- `RetailShell`: shop envelope, shutter, metal frame, signage and lighting

The profile only toggles/configures these modules. Vendor data still lives in Catalog/Document repositories.
