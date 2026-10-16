# چوگان: میراث پارس — پروژه اندروید

بازی دوبعدی چوگان با بخش داستانی، مسابقه، فروشگاه و خرید درون‌برنامه‌ای.

## ساختار پروژه

```
ChoganAndroid/
├── app/
│   ├── build.gradle                 تنظیمات ماژول (minSdk 21، targetSdk 34)
│   └── src/main/
│       ├── AndroidManifest.xml      افقی اجباری + تمام‌صفحه + مجوز لرزش
│       ├── java/com/parsgames/chogan/
│       │   ├── MainActivity.kt      میزبان WebView بازی (Kotlin)
│       │   └── IapBridge.java       پل خرید درون‌برنامه‌ای + لرزش (Java)
│       ├── assets/chogan/           ⭐ کل بازی HTML5 همین‌جاست
│       └── res/                     آیکون، تم، متن‌ها
├── build.gradle                     فایل ریشه (AGP 8.5.2، Kotlin 1.9.24)
└── settings.gradle
```

## ساخت APK — مرحله به مرحله

1. **Android Studio** (نسخه Hedgehog یا جدیدتر با JDK 17) را باز کنید
2. `File → Open` و پوشه `ChoganAndroid` را انتخاب کنید
3. صبر کنید تا **Gradle Sync** تمام شود (اینترنت لازم دارد — یک‌بار)
4. برای تست: دکمه **Run ▶** (با شبیه‌ساز یا گوشی)
5. برای خروجی APK: منوی `Build → Build App Bundle(s)/APK(s) → Build APK(s)`
   - مسیر خروجی: `app/build/outputs/apk/debug/app-debug.apk`

> اگر Android Studio نسخه Gradle Wrapper را خواست، خودش آن را می‌سازد؛ یا `File → Sync Project with Gradle Files` را بزنید.

## به‌روزرسانی بازی (نسخه وب → اندروید)

کل بازی یک سایت استاتیک داخل `app/src/main/assets/chogan/` است.
هر تغییری در فایل‌های بازی (html/js/css/audio) باید داخل همین پوشه کپی شود:

```
app/src/main/assets/chogan/
├── index.html
├── icon.png
├── css/style.css
├── fonts/  (وزیرمتن — آفلاین کار می‌کند)
└── js/     (کد بازی)
```

## افزودن صداگذاری (فایل‌های گوینده)

1. فایل `chogan-dialogues-voice.md` را بخوانید — همهٔ شناسه‌ها و مسیرها آنجاست
2. فایل‌ها را بگذارید در:
   `app/src/main/assets/chogan/audio/vo/<شناسه‌خط>.ogg`
3. برای افکت‌های صوتی ضبط‌شده: فایل‌ها در `assets/chogan/audio/sfx/` + فعال‌سازی نام‌ها در `js/audio-files.js`

## اتصال خرید درون‌برنامه‌ای واقعی (بعداً)

الان دکمه‌های «خرید الماس» در حالت **آزمایشی** کار می‌کنند (رایگان می‌دهد).
برای فعال‌سازی پرداخت واقعی فقط یک جا باید کد بزنید:

- فایل: `app/src/main/java/com/parsgames/chogan/IapBridge.java`
- داخل متد `purchase()` جریان واقعی Billing را صدا بزنید (کافه‌بازار / مایکت / گوگل‌پلی)
- شناسه‌های آماده در بازی: `iap_coin_1`، `iap_coin_2`، `iap_gem_1`، `iap_gem_2`، `iap_noads`
- فهرست کامل با قیمت‌ها: `assets/chogan/js/story-data.js` → بخش `CH.SHOP.iap`

پل جاوااسکریپت از طرف بازی از قبل آماده است: `window.ChoganAndroid.purchase(sku)`

## تنظیمات مهم بازی (همه در بازی هست)

- **گرافیک:** ضعیف / متوسط / قوی — از منوی تنظیمات
- **صدا:** موسیقی و جلوه‌ها با اسلایدر
- **جوی‌استیک چپ/راست:** برای چپ‌دست‌ها
- **پاک کردن پیشرفت:** در تنظیمات

## نسخه

- versionCode 1 / versionName 1.0.0
- minSdk 21 (اندروید ۵ به بالا) — targetSdk 34
