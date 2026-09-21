# Deployment

## GitHub Pages

برای اولین بار باید Pages برای repository فعال شود:

1. GitHub repository → Settings
2. Pages
3. Build and deployment
4. Source → GitHub Actions

این مرحله یک‌بار است.

بعد از آن workflow `.github/workflows/pages.yml` روی هر push به `main` اجرا می‌شود:

1. checkout
2. npm install
3. tests
4. Vite production build با base path پروژه
5. upload artifact
6. deploy Pages

اجرای دستی:

Actions → Deploy latest to GitHub Pages → Run workflow

## Static mode

Pages سرور Express اجرا نمی‌کند. build با `VITE_STATIC_DEMO=true` از seed catalog استفاده می‌کند و درخواست ناموفق /api ایجاد نمی‌کند.

برای crawler/API آنلاین، frontend و Node API را می‌توان بعداً روی host مناسب جدا کرد.
