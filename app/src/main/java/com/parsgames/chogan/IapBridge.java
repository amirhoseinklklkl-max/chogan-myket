package com.parsgames.chogan;

import android.app.Activity;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

/**
 * پل جاوااسکریپت ← اندروید (نوشته‌شده با Java طبق نیاز پروژه)
 *
 * از بازی (JavaScript):
 *   ChoganAndroid.purchase("iap_coin_1")  → خرید درون‌برنامه‌ای
 *   ChoganAndroid.vibrate("120")          → لرزش گوشی
 *   ChoganAndroid.isAndroid()             → شناسایی نسخه اندروید
 *
 * ─────────────────────────────────────────────────────────────
 * TODO (اتصال پرداخت واقعی — بعداً):
 *   ۱) کتابخانه را اضافه کنید:
 *      - کافه‌بازار:  implementation("com.github.cafebazaar:bazaarclient:2.0.1")  یا IAB قدیمی
 *      - مایکت:      mtop sdk
 *      - گوگل‌پلی:   implementation("com.android.billingclient:billing-ktx:7.0.0")
 *   ۲) داخل متد purchase() به‌جای پاسخ آزمایشی، جریان واقعی billing را صدا بزنید
 *      و نتیجه را به بازی برگردانید: {"ok":true,"sku":"...","demo":false}
 *   ۳) آیتم‌های قابل خرید همین الان در بازی تعریف شده‌اند:
 *      iap_coin_1, iap_coin_2, iap_gem_1, iap_gem_2, iap_noads
 *      (فهرست کامل: public/chogan/js/story-data.js → CH.SHOP.iap)
 */
public class IapBridge {

    private final Activity activity;

    public IapBridge(Activity activity) {
        this.activity = activity;
    }

    /** خرید درون‌برنامه‌ای — فعلاً حالت آزمایشی */
    @JavascriptInterface
    public String purchase(final String sku) {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Toast.makeText(activity, "خرید آزمایشی: " + sku, Toast.LENGTH_SHORT).show();
            }
        });
        // TODO: اتصال به درگاه واقعی (کافه‌بازار / مایکت / گوگل‌پلی)
        return "{\"ok\":true,\"sku\":\"" + sku + "\",\"demo\":true}";
    }

    /** لرزش گوشی به میلی‌ثانیه */
    @JavascriptInterface
    public void vibrate(String ms) {
        try {
            Vibrator v = (Vibrator) activity.getSystemService(Activity.VIBRATOR_SERVICE);
            if (v == null) return;
            long duration = Long.parseLong(ms);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                v.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                v.vibrate(duration);
            }
        } catch (Exception ignored) {
        }
    }

    /** بازی با این متد می‌فهمد داخل اندروید است */
    @JavascriptInterface
    public boolean isAndroid() {
        return true;
    }
}
