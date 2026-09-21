# Versioning

## Policy

- `main`: آخرین نسخه پایدار و منبع deploy production demo.
- `feat/*`: توسعه و PR.
- `release/vX.Y.Z`: snapshot خوانا و immutable از milestone پایدار.

## Snapshotهای موجود در GitHub

خط پایدار تاریخی که باید حفظ شود:

- `release/v0.3.0`
- `release/v0.4.0`
- `release/v0.5.0`
- `release/v0.6.0`
- `release/v0.7.0`
- `release/v0.8.0`
- `release/v0.9.0`
- `release/v0.10.0`
- `release/v0.11.0`
- `release/v0.12.0`
- `release/v0.13.0`

`v0.1` و `v0.2` قبل از release-snapshot policy فعلی ساخته شدند و branch مستقل `release/v0.1.0` یا `release/v0.2.0` در GitHub ندارند. بنابراین نباید ادعا شود که تمام نسخه‌ها از v0.1 به بعد به‌صورت release branch ذخیره شده‌اند.

پس از CI و merge هر milestone جدید، branch `release/vX.Y.Z` از همان commit stable ساخته می‌شود.

## چرا branch release؟

Git history نسخه‌ها را نگه می‌دارد، اما release branch checkout/deploy یک milestone را بدون پیدا کردن SHA ساده می‌کند. در آینده می‌توان همین snapshotها را با Git tags و GitHub Releases نیز mirror کرد.

## Rule

هیچ migration بصری، performance یا معماری نباید release branch قبلی را force-update کند. بهینه‌سازی‌های جدید باید روی branch جدید انجام شوند و snapshot قبلی بدون تغییر باقی بماند.


## v0.13 rebuild rule

v0.13 جدید باید از `release/v0.12.0` مشتق شود. branchها/PRهای آزمایشی post-v0.12 منبع حقیقت نیستند.

پس از سبز شدن CI:
- `main` به tree تأییدشده‌ی v0.13 جدید منتقل می‌شود.
- `release/v0.13.0` به commit نهایی جدید اشاره می‌کند.
- هیچ ref مربوط به `release/v0.3.0` تا `release/v0.12.0` force-update نمی‌شود.


## v0.14 rule

v0.14 از snapshot پایدار `release/v0.13.0` منشعب می‌شود. هیچ ref تاریخی تا v0.13 نباید برای ساخت v0.14 force-update شود.

پس از CI و deploy موفق:
- `main` به commit تاییدشده‌ی v0.14 منتقل می‌شود.
- `release/v0.14.0` از همان commit ساخته می‌شود.
- `release/v0.13.0` و تمام releaseهای قبل بدون تغییر باقی می‌مانند.


## v0.15 rule

v0.15 جدید باید مستقیماً از `release/v0.14.0` مشتق شود. branch آزمایشی قدیمی `feat/v0.15-static-render-texture-refinement` حفظ می‌شود اما چون از v0.14 عقب‌تر است ancestry این release نیست.

پس از CI و deploy موفق:
- `main` به commit تأییدشده‌ی v0.15 منتقل می‌شود.
- `release/v0.15.0` از همان commit ساخته می‌شود.
- `release/v0.14.0` و تمام releaseهای قبل بدون تغییر باقی می‌مانند.
