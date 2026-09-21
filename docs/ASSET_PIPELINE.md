# Asset and scan pipeline

## هدف

یک اسکن واقعی نباید فقط «فایل سه‌بعدی قابل نمایش» باشد. برای Digital Twin باید identity، scale، origin، collision، hotspot و version پایدار داشته باشد.

## قرارداد asset

هر asset حداقل باید این metadata را داشته باشد:

- `assetId`: شناسه پایدار که با rename فایل عوض نشود.
- `version`: نسخه asset برای cache invalidation و rollback.
- `metersPerUnit`: نسبت واحد فایل به متر.
- `kind`: procedural / gltf / scan.
- `url`: برای assetهای فایل‌محور.
- `capture`: برای scan، روش capture مثل LiDAR یا photogrammetry.

## pipeline پیشنهادی

```text
Capture
  ↓
Raw point cloud / photos / LiDAR
  ↓
Alignment + cleanup
  ↓
Mesh / reconstruction
  ↓
Decimation + texture bake
  ↓
GLB + compressed textures
  ↓
Scale/origin validation
  ↓
Collider authoring
  ↓
Hotspot authoring
  ↓
Asset registry / CDN
```

## Coordinate system

قبل از ورود asset، یک origin ثابت تعریف کن؛ مثلاً مرکز کف ورودی Room. مدل باید تا حد ممکن با Y-up و واحد متر normalize شود. جبران scale یا rotation اضطراری باید metadata باشد، نه transformهای پراکنده داخل componentها.

## Collision

Renderer و collider دو چیز جدا هستند. mesh اسکن می‌تواند میلیون‌ها triangle داشته باشد اما collider باید ساده باشد. `RoomDefinition.colliders` فعلاً box/circle سبک دارد؛ بعداً می‌تواند به navmesh یا physics collider reference توسعه پیدا کند.

## Hotspot

برای scan از mesh index یا triangle index خام به‌عنوان identity تجاری استفاده نکن. export مجدد مدل ممکن است topology را عوض کند. در نسخه فعلی هم `point` anchor و هم `node` anchor برای nodeهای نام‌دار GLTF پشتیبانی می‌شوند؛ برای asset authored، nodeهای semantic پایدار ترجیح داده می‌شوند.

## Error isolation

هر Room داخل `RoomAssetBoundary` است. failure در decode/load یک asset باید فقط همان Room را به fallback تبدیل کند و در F3 ثبت شود، نه اینکه کل React tree crash کند.

## Performance budget پیشنهادی برای شروع

- یک GLB مستقل برای هر Room.
- texture atlas محدود و power-of-two.
- نسخه desktop و در صورت نیاز LOD سبک‌تر.
- collision ساده مستقل از render mesh.
- hotspot JSON مستقل از فایل binary.

اعداد دقیق triangle/texture budget باید بعد از تست روی دستگاه‌های هدف تعیین شود؛ از یک عدد ثابت برای همه اسکن‌ها استفاده نکن.


## v0.7 material pipeline

Surface identity is stable and independent from the file host:

```text
BoothProfile.surfaceId
        ↓
SurfaceMaterial
   ├─ PBR registry hit
   │    ├─ color 1K
   │    ├─ normal 1K (Cinematic)
   │    └─ roughness 1K (Cinematic)
   └─ procedural fallback
```

This means moving from the current public CC0 CDN to an owned object store later is a registry change rather than a rewrite of rooms or fixtures.

Production server target:

```text
surfaceId
  ↓
Asset API / manifest
  ↓
CDN
  ├─ .ktx2 albedo
  ├─ .ktx2 normal
  ├─ .ktx2 ORM
  └─ LOD / mobile variants
```

Do not place vendor-specific URLs directly in React scene components.


## v0.11 geometry acceptance criteria

برای هر GLB authored یا scan-retopo که قرار است materialهای واقعی بگیرد:

- geometry باید UV معتبر داشته باشد؛ PBR بدون `TEXCOORD_0` قابل اتکا نیست.
- واحد و scale باید واقعی و ترجیحاً meter-based باشد.
- لبه‌های hard-surface مهم باید bevel واقعی داشته باشند؛ shader نمی‌تواند silhouette کاملاً تیز را جبران کند.
- objectهایی که ذاتاً گرد هستند باید geometry گرد داشته باشند، نه cube با texture.
- semantic node nameها مثل `hotspot_catalog` باید در export مجدد پایدار بمانند.
- collider و hotspot همچنان مستقل از render topology باقی می‌مانند.
- dirt/decal/branding نمایشی باید در asset detail profile یا texture layer باشد، نه business repository.
- scan خام قبل از runtime باید cleanup، retopo/decimation و texture bake شود.

Pipeline هدف:

```text
Blender / Scan / Photogrammetry
  ↓
Real scale + origin
  ↓
Retopo / authored bevels
  ↓
UV unwrap
  ↓
PBR bake / atlas
  ↓
Semantic node naming
  ↓
GLB/KTX2
  ↓
World assetId + version
  ↓
Independent collider + hotspot JSON
```
