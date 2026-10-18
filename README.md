# چوگان: میراث پارس — پروژه اندروید

بازی دوبعدی چوگان با بخش داستانی ۹ فصلی، ۱۲ مرحله، فروشگاه، **خرید درون‌برنامه‌ای مایکت** و **تبلیغ جایزه‌ای ادیوری**.

- **پکیج‌نیم:** `ir.amir.chogan`
- **لینک مایکت:** https://myket.ir/app/ir.amir.chogan

## ساختار پروژه

```
ChoganAndroid/
├── app/
│   ├── build.gradle                      applicationId: ir.amir.chogan + SDK ادیوری
│   ├── proguard-rules.pro                قوانین keep برای پل JS و IAP
│   └── src/main/
│       ├── AndroidManifest.xml           مجوز BILLING مایکت + <queries>
│       ├── aidl/com/android/vending/billing/
│       │   └── IInAppBillingService.aidl سرویس پرداخت (طبق مستندات مایکت)
│       ├── java/ir/amir/chogan/
│       │   ├── MainActivity.kt           میزبان WebView + راه‌اندازی ادیوری/مایکت
│       │   ├── IapBridge.java            پل JS: خرید، تبلیغ، لرزش، لینک‌ها
│       │   ├── MyketIap.java             مدیر پرداخت مایکت (کلید عمومی + جریان خرید)
│       │   └── iap/                      کلاس‌های TrivialDrive (IabHelper و…)
│       ├── assets/chogan/                ⭐ کل بازی HTML5 همین‌جاست
│       └── res/                          آیکون، تم، متن‌ها
├── build.gradle                          فایل ریشه (AGP 8.5.2، Kotlin 1.9.24)
└── settings.gradle                       mavenCentral (برای ادیوری)
```

## ساخت APK — مرحله به مرحله

1. **Android Studio** (نسخه Hedgehog یا جدیدتر با JDK 17) را باز کنید
2. `File → Open` و پوشه `ChoganAndroid` را انتخاب کنید
3. صبر کنید تا **Gradle Sync** تمام شود (اینترنت لازم دارد — یک‌بار)
4. برای تست: دکمه **Run ▶** (با شبیه‌ساز یا گوشی — برای خرید واقعی، مایکت باید نصب باشد)
5. برای خروجی APK: منوی `Build → Build App Bundle(s)/APK(s) → Build APK(s)`
   - مسیر خروجی: `app/build/outputs/apk/debug/app-debug.apk`

## تبلیغ جایزه‌ای ادیوری (Adivery)

پیاده‌سازی طبق مستندات رسمی: **docs.adivery.com/android**

- وابستگی: `com.adivery:sdk:4.9.0` (مخزن mavenCentral) + `play-services-ads-identifier`
- شناسهٔ اپلیکیشن: در `IapBridge.java → ADIVERY_APP_ID`
- کلید تبلیغ‌گاه جایزه‌ای: `IapBridge.java → ADIVERY_REWARDED_PLACEMENT`
- جریان کار:
  1. `Adivery.configure(application, APP_ID)` در onCreate
  2. `Adivery.prepareRewardedAd(context, placement)` — ادیوری بعد از هر نمایش، تبلیغ بعدی را خودش آماده می‌کند
  3. بازی → `ChoganAndroid.showRewardedAd()` → اگر `Adivery.isLoaded` → `Adivery.showAd(placement)`
  4. `AdiveryListener.onRewardedAdClosed(placement, isRewarded)`:
     - `isRewarded = true` → بازی از طریق `CH.onAdResult(true)` **۱۰۰ سکه** می‌دهد
     - `isRewarded = false` → بدون جایزه (`CH.onAdResult(false)`)
- **بدون هیچ محدودیتی**: کاربر می‌تواند پشت‌سرهم تبلیغ ببیند؛ فقط تبلیغِ کاملِ دیده‌شده جایزه دارد.

## خرید درون‌برنامه‌ای مایکت

پیاده‌سازی طبق مستندات رسمی مایکت (نمونهٔ TrivialDrive با سرویس `ir.mservices.market`):

- کلید عمومی برنامه در `MyketIap.java` (تکه‌تکه برای امنیت بیشتر)
- شناسهٔ محصولات (باید عیناً در پنل مایکت تعریف شده باشند):

| محصول | SKU | مبلغ | جایزه در بازی |
|---|---|---|---|
| کیسهٔ سکه | `seke500` | ۵٬۰۰۰ تومان | ۵۰۰ سکه |
| صندوق سکه | `seke1500` | ۱۰٬۰۰۰ تومان | ۱٬۵۰۰ سکه |
| خزانهٔ سلطنتی سکه | `seke4000` | ۳۰٬۰۰۰ تومان | ۴٬۰۰۰ سکه |
| کیسهٔ الماس | `almas15` | ۱۰٬۰۰۰ تومان | ۱۵ الماس |
| صندوق الماس | `almas35` | ۲۵٬۰۰۰ تومان | ۳۵ الماس |
| خزانهٔ الماس | `almas80` | ۶۰٬۰۰۰ تومان | ۸۰ الماس |
| پیشنهاد شگفت‌انگیز | `amazing` | ۸۹٬۰۰۰ تومان | ۱٬۰۰۰ سکه + ۱۰۰ الماس |

- جریان: `ChoganAndroid.purchase(sku)` → `launchPurchaseFlow` → صحت‌سنجی امضا با کلید عمومی → **consume** (چون سکه/الماس مصرف‌شدنی‌اند) → `CH.onIapResult(sku, true)` → بازی آیتم را اهدا می‌کند
- خریدهای نیمه‌کارهٔ قبلی (مثلاً بعد از کرش) هنگام شروع بازی به‌طور خودکار استعلام، مصرف و اهدا می‌شوند
- «ثبت نظر در مایکت» (پایان داستان): intent رسمی `myket://comment?id=ir.amir.chogan`

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

## تنظیمات مهم بازی (همه در بازی هست)

- **گرافیک:** ضعیف / متوسط / قوی — از منوی تنظیمات
- **صدا:** موسیقی و جلوه‌ها با اسلایدر
- **جوی‌استیک چپ/راست:** برای چپ‌دست‌ها
- **پاک کردن پیشرفت:** در تنظیمات

## نسخه

- versionCode 1 / versionName 1.0.0
- minSdk 21 (اندروید ۵ به بالا) — targetSdk 34
