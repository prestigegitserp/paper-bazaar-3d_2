# Debugging

## Runtime panel

کلید `F3` پنل diagnostics را باز می‌کند:

- player position
- current Room
- render quality
- WebGL draw calls
- triangle count
- geometry count
- texture count
- visited rooms
- asset error count

این panel مخصوصاً هنگام اضافه‌کردن GLB/scan برای مقایسه buildهای مختلف مفید است.

## Asset failures

`RoomAssetBoundary` خطای load/render را در سطح Room isolate می‌کند. در failure:

1. Room به placeholder wireframe تبدیل می‌شود.
2. خطا در console با prefix `room-asset` ثبت می‌شود.
3. شمارنده asset error در F3 افزایش پیدا می‌کند.

## World validation

در composition root، `validateWorldDefinition()` ارجاع Vendorها، شناسه‌های تکراری، footprint، metadata asset، hotspotها و colliderهای نامعتبر را بررسی می‌کند.

## CI

Pull Request باید حداقل این دو مرحله را پاس کند:

```bash
npm test
npm run build
```

Build شامل TypeScript project build و Vite production bundling است.

## Performance debugging

اگر draw call یا triangle count بعد از افزودن scan جهش شدید داشت:

- meshهای ثابت را merge/instance کن.
- texture/material count را کاهش بده.
- LOD اضافه کن.
- اتاق‌ها را lazy load کن.
- collider را از render mesh جدا نگه دار.
- ابتدا Balanced mode را baseline بگیر، بعد Cinematic را مقایسه کن.
