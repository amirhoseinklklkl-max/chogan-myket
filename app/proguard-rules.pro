# چوگان: میراث پارس — قوانین ProGuard
# (کتابخانهٔ ادیوری قوانین خودش را به‌طور خودکار اضافه می‌کند)

# حفظ متدهای پل جاوااسکریپت (WebView)
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class ir.amir.chogan.IapBridge { *; }
-keep class ir.amir.chogan.MyketIap { *; }

# کلاس‌های پرداخت درون‌برنامه‌ای مایکت
-keep class ir.amir.chogan.iap.** { *; }
-keep class com.android.vending.billing.** { *; }

# ادیوری (محض اطمینان)
-keep class com.adivery.** { *; }
-keep interface com.adivery.** { *; }
