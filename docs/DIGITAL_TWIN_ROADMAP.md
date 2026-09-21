# Digital Twin roadmap

## مرحله 1 — یک اتاق واقعی

یک غرفه را با Blender یا اسکن موبایل به GLB تبدیل کنید. Room همان `vendorId` را حفظ می‌کند و فقط `asset` از procedural به `gltf` تغییر می‌کند. Hotspotها با point anchor روی مختصات محلی همان اتاق تعریف می‌شوند.

## مرحله 2 — Asset pipeline

برای هر asset metadata ذخیره شود:

- stable asset id
- version
- source type: authored / LiDAR / photogrammetry
- physical scale and origin
- bounding box
- LOD variants
- texture budget
- checksum
- collider/navmesh reference

این metadata باید مستقل از فایل binary و مستقل از Vendor باشد.

## مرحله 3 — Streaming

کل پاساژ نباید یک GLB بزرگ باشد. World به Room/Zone تقسیم شود و بر اساس فاصله، portal visibility یا navigation state load/unload شود. object storage + CDN برای assetهای سنگین مناسب‌تر از bundle اپ است.

## مرحله 4 — Hotspot Editor

پنل ادمین باید GLB را نمایش دهد و کاربر بتواند روی سطح مدل کلیک کند، action را انتخاب کند و point/node anchor بسازد. خروجی editor باید JSON WorldDefinition باشد، نه کد React.

## مرحله 5 — Physical twin data

وقتی سنسور یا ERP واقعی اضافه شد، telemetry باید با stable entity id به objectهای Digital Twin متصل شود. WebSocket یا MQTT فقط transport است؛ identity و schema مهم‌ترند.

## مرحله 6 — Scan formats

GLTF/GLB برای mesh pipeline انتخاب اصلی باقی بماند. Gaussian Splatting می‌تواند برای realism بعضی فضاها مفید باشد، ولی باید جداگانه از نظر browser support، GPU memory، mobile fallback، collision و hotspot authoring ارزیابی شود.

## معیار پذیرش هر اتاق جدید

هر Room قبل از publish باید scale درست، origin ثابت، load budget مشخص، collider معتبر، hotspotهای قابل تست، fallback مناسب و نسخه‌ی asset داشته باشد.
