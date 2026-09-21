# v0.9 Debug report

## هدف

v0.9 دو مسئله را هم‌زمان حل می‌کند:

1. فضای عمومی v0.7/v0.8 بیش از حد آجری، تاریک و سنگین شده بود.
2. نوشته‌های محیطی مبتنی بر DOM حتی با room-scope هنوز حس «متن روی هوا» داشتند و occlusion طبیعی WebGL را رعایت نمی‌کردند.

## Root cause: floating labels

Drei `Html` یک DOM overlay روی Canvas است. حتی وقتی mount شدن آن به Room فعال محدود شود، متن جزئی از depth buffer سه‌بعدی نیست و از نظر ادراکی می‌تواند مستقل از سطح، دیوار و ویترین دیده شود.

### v0.9 fix

`WorldTextPanel` متن را با Canvas 2D به `CanvasTexture` تبدیل و روی یک plane mesh واقعی اعمال می‌کند.

نتیجه:
- depthTest طبیعی WebGL
- occlusion واقعی پشت دیوار/مغازه/محصول
- همان transform و perspective صحنه
- بدون DOM overlay داخل World
- HUD و Catalog Reader همچنان DOM هستند چون UI صفحه‌اند، نه آبجکت جهان

`RoomScopedHtml` از runtime حذف شد تا راه قدیمی دوباره استفاده نشود.

## Texture memory

تابلوهای بزرگ به canvas 1024px، پنل‌های متوسط 768px و برچسب‌های کوچک 512px محدود شده‌اند. ارتفاع نیز cap دارد تا shelf ticketهای کوچک texture بزرگ و پرهزینه تولید نکنند.

## Charsou-inspired environment pass

تغییرات محیط:
- porcelain tile روشن با grout grid
- سقف پنلی تخت و روشن
- linear light fixtures
- dark-metal reveal
- glass infill bays
- ستون‌های روشن با base فلزی
- آجر فقط به‌عنوان heritage accent محدود
- planter، bench و info kiosk در ورودی
- انتقال hand-cart و paper roll به حاشیه corridor

این یک بازسازی دقیق چارسو نیست؛ language بصری مدرن و روشن آن به‌عنوان reference direction استفاده شده است.

## Authored GLB v2

Artifact:
`public/models/iran-paper-authored-v2.glb`

Source:
`scripts/generate-authored-shop.mjs`

Detail additions:
- shelf front lips
- bundle straps
- glass counter shelf
- receipt printer
- tape dispenser
- pen cup + pens
- drawer fronts + handles
- outlet + cable trunk
- CCTV body/lens/arm
- HVAC vent + slots
- waste bin
- brochure holder
- service bell
- counter price tickets
- carton tape

Semantic nodes برای catalog / prices / products / management حفظ شده‌اند.

## Logic review

### Interaction
- node hotspots همچنان از business data مستقل‌اند.
- interaction به node name پایدار متصل است، نه mesh index یا triangle.
- pointer interaction از parent chain semantic action را resolve می‌کند.

### Room logic
- containment واقعی قبل از discovery radius بررسی می‌شود.
- discovery فقط fallback است و نزدیک‌ترین candidate انتخاب می‌شود.
- layout skin جدید World/Catalog/Document contract را تغییر نمی‌دهد.

### Server readiness
- هیچ متن فروشنده یا business field جدیدی وارد generator contract نشده است.
- World فقط asset URL/version/profile/hotspot را نگه می‌دارد.
- مدل آینده می‌تواند Blender-authored یا scan GLB باشد و همان node-hotspot contract را مصرف کند.

## Regression gates

CI باید موارد زیر را پاس کند:
- catalog/crawler tests
- world logic tests
- authored GLB structure/detail test
- ممنوعیت Drei Html و RoomScopedHtml در scene world files
- وجود CanvasTexture-backed world text
- TypeScript build
- Vite production build

## Visual trade-offs

`WorldTextPanel` برای Persian text به fontهای موجود سیستم مرورگر متکی است. در pipeline سروری آینده بهتر است typography رسمی برندها به textureهای baked یا atlasهای کنترل‌شده تبدیل شود؛ contract فعلی اجازه این تعویض را بدون تغییر Room می‌دهد.
