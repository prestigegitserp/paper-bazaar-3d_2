# Mobile and touch

## هدف

نسخه موبایل از همان World, collision و interaction دسکتاپ استفاده می‌کند؛ کنترل لمس فقط یک input adapter است و منطق gameplay جدا نشده است.

## کنترل

- joystick چپ: حرکت
- drag نیمه راست: نگاه
- E: interaction روی crosshair
- + / -: تغییر FOV
- pinch دو انگشتی روی canvas: تغییر FOV
- R: برگشت به spawn

Canvas دارای `touch-action: none` است تا gesture داخل تجربه مدیریت شود. zoom سه‌بعدی با تغییر FOV انجام می‌شود و قرار نیست layout DOM را scale کند.

## Performance

روی coarse pointer یا viewport باریک، کیفیت پیش‌فرض Balanced است:

- DPR پایین‌تر
- real-time shadows خاموش
- antialias سبک‌تر
- sparkle/dust cinematic خاموش
- geometryهای تکراری instanced

کاربر همچنان می‌تواند با Q به Cinematic برگردد.

## تست پیشنهادی

حداقل روی این کلاس‌ها تست شود:

- iPhone Safari
- Android Chrome میان‌رده
- Android Chrome ضعیف‌تر با 4GB RAM
- iPad / tablet
- touch laptop

معیارها: input latency، FPS، thermal throttling، memory growth، orientation change و بازگشت از background.
