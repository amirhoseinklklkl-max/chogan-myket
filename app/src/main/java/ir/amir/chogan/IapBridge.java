package ir.amir.chogan;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import com.adivery.sdk.Adivery;
import com.adivery.sdk.AdiveryListener;

/**
 * پل جاوااسکریپت ← اندروید (نوشته‌شده با Java طبق نیاز پروژه)
 * ─────────────────────────────────────────────────────────────
 * از بازی (JavaScript):
 *   ChoganAndroid.purchase(sku)        → خرید درون‌برنامه‌ای مایکت
 *   ChoganAndroid.showRewardedAd()     → نمایش تبلیغ جایزه‌ای ادیوری
 *   ChoganAndroid.vibrate(ms)          → لرزش گوشی
 *   ChoganAndroid.isAndroid()          → شناسایی نسخهٔ اندروید
 *   ChoganAndroid.openUrl(url)         → باز کردن لینک (روبیکا و…)
 *   ChoganAndroid.openMyket(pkg)       → باز کردن صفحهٔ بازی در مایکت
 *
 * کال‌بک‌های برگشتی به بازی (با evaluateJavascript):
 *   CH.onIapResult(sku, ok)            → نتیجهٔ خرید مایکت
 *   CH.onAdResult(true/false/'unavailable') → نتیجهٔ تبلیغ ادیوری
 *     (true فقط وقتی است که تبلیغ تا انتها دیده شود → +۱۰۰ سکه در بازی)
 */
public class IapBridge {

    private static final String TAG = "ChoganBridge";

    /** شناسهٔ اپلیکیشن ادیوری (از پنل ناشران ادیوری) */
    public static final String ADIVERY_APP_ID = "ffdb2a70-ade5-40ed-907f-3f56a90be026";
    /** کلید تبلیغ‌گاه جایزه‌ای ادیوری */
    public static final String ADIVERY_REWARDED_PLACEMENT = "52c82955-9773-4b61-9a12-e04c6903ebf2";

    private final Activity activity;
    private final WebView webView;
    private final MyketIap myketIap;

    private static IapBridge sInstance;

    public IapBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        this.myketIap = new MyketIap(activity);
        sInstance = this;
    }

    /** برای دسترسی کال‌بک‌ها از کلاس‌های دیگر (MyketIap / MainActivity) */
    public static IapBridge getInstance() { return sInstance; }

    /** اجرای جاوااسکریپت در WebView بازی — باید روی UI Thread باشد */
    private void evalJs(final String js) {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    webView.evaluateJavascript(js, null);
                } catch (Exception e) {
                    Log.e(TAG, "evalJs failed", e);
                }
            }
        });
    }

    /* ═══════════════ خرید درون‌برنامه‌ای مایکت ═══════════════ */

    /** راه‌اندازی سرویس پرداخت مایکت (از MainActivity در onCreate) */
    public void setupBilling() {
        myketIap.setup();
    }

    /**
     * شروع خرید یک محصول — sku باید یکی از شناسه‌های تعریف‌شده در پنل مایکت باشد:
     * seke500 / seke1500 / seke4000 / almas15 / almas35 / almas80 / amazing
     */
    @JavascriptInterface
    public void purchase(final String sku) {
        try {
            myketIap.purchase(sku);
        } catch (Exception e) {
            Log.e(TAG, "purchase(" + sku + ") failed", e);
            notifyIapResult(sku, false);
        }
    }

    /** نتیجهٔ نهایی خرید به بازی برگردانده می‌شود */
    public void notifyIapResult(final String sku, final boolean ok) {
        Log.d(TAG, "notifyIapResult(" + sku + ", " + ok + ")");
        evalJs("if(window.CH&&CH.onIapResult)try{CH.onIapResult('" + sku + "'," + ok + ")}catch(e){}");
    }

    /* ═══════════════ تبلیغ جایزه‌ای ادیوری ═══════════════ */

    /** آماده‌سازی تبلیغ جایزه‌ای (از MainActivity در onCreate صدا زده می‌شود) */
    public void prepareRewardedAd() {
        try {
            Adivery.prepareRewardedAd(activity, ADIVERY_REWARDED_PLACEMENT);
        } catch (Exception e) {
            Log.e(TAG, "prepareRewardedAd failed", e);
        }
    }

    /** درخواست نمایش تبلیغ جایزه‌ای از سمت بازی — بدون هیچ محدودیت زمانی */
    @JavascriptInterface
    public void showRewardedAd() {
        try {
            if (Adivery.isLoaded(ADIVERY_REWARDED_PLACEMENT)) {
                Adivery.showAd(ADIVERY_REWARDED_PLACEMENT);
                // نتیجه از طریق listener (onRewardedAdClosed) → notifyAdResult برمی‌گردد
            } else {
                // تبلیغ هنوز آماده نیست — بدون سکه
                notifyAdResult("unavailable");
                // برای دفعات بعد فوراً درخواست آماده‌سازی مجدد
                prepareRewardedAd();
            }
        } catch (Exception e) {
            Log.e(TAG, "showRewardedAd failed", e);
            notifyAdResult("unavailable");
        }
    }

    /**
     * اطلاع‌رسانی نتیجهٔ تبلیغ به بازی:
     *  true          → تبلیغ تا انتها دیده شد → بازی ۱۰۰ سکه می‌دهد
     *  false         → تبلیغ ناقص بسته شد → بدون جایزه
     *  "unavailable" → تبلیغی آماده نبود
     */
    public void notifyAdResult(final Object ok) {
        Log.d(TAG, "notifyAdResult(" + ok + ")");
        final String jsArg = (ok instanceof Boolean) ? ok.toString() : ("'" + ok + "'");
        evalJs("if(window.CH&&CH.onAdResult)try{CH.onAdResult(" + jsArg + ")}catch(e){}");
    }

    /** listener سراسری ادیوری (از MainActivity در onCreate اضافه می‌شود) */
    public void attachAdiveryListener() {
        try {
            Adivery.addGlobalListener(new AdiveryListener() {
                @Override
                public void onRewardedAdClosed(String placementId, boolean isRewarded) {
                    // فقط اگر کاربر تبلیغ را کامل دیده باشد جایزه می‌گیرد
                    notifyAdResult(isRewarded);
                    // ادیوری خودش تبلیغ بعدی را آماده می‌کند؛ برای اطمینان دوباره درخواست می‌کنیم
                    prepareRewardedAd();
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "attachAdiveryListener failed", e);
        }
    }

    /* ═══════════════ ابزارهای عمومی ═══════════════ */

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

    /** باز کردن یک URL بیرونی (مثل کانال روبیکا) */
    @JavascriptInterface
    public void openUrl(String url) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(i);
        } catch (Exception e) {
            Log.e(TAG, "openUrl failed: " + url, e);
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(activity, "مرورگری برای باز کردن لینک پیدا نشد", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    /** باز کردن صفحهٔ بازی در مایکت؛ اگر اپ مایکت نبود، سایت */
    @JavascriptInterface
    public void openMyket(String pkg) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse("myket://comment?id=" + pkg));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(i);
        } catch (Exception e) {
            openUrl("https://myket.ir/app/" + pkg);
        }
    }

    /** پاس دادن نتیجهٔ Activity به جریان خرید (از MainActivity.onActivityResult) */
    public boolean handleActivityResult(int requestCode, int resultCode, Intent data) {
        return myketIap.handleActivityResult(requestCode, resultCode, data);
    }

    /** آزادسازی منابع (از MainActivity.onDestroy) */
    public void dispose() {
        myketIap.dispose();
        if (sInstance == this) sInstance = null;
    }
}
