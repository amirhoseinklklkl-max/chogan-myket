package ir.amir.chogan;

import android.app.Activity;
import android.util.Log;

import java.util.ArrayList;
import java.util.List;

import ir.amir.chogan.iap.IabHelper;
import ir.amir.chogan.iap.IabResult;
import ir.amir.chogan.iap.Inventory;
import ir.amir.chogan.iap.Purchase;

/**
 * مدیر پرداخت درون‌برنامه‌ای مایکت
 * ─────────────────────────────────────────────────────────────
 * طبق مستندات رسمی مایکت (نمونهٔ TrivialDrive با پکیج سرویس ir.mservices.market):
 *  ۱) اتصال به سرویس پرداخت با کلید عمومی برنامه (Public Key از پنل مایکت)
 *  ۲) استعلام موجودی و مصرف خودکار خریدهای مصرف‌نشدهٔ قبلی (بازیابی پس از کرش)
 *  ۳) اجرای جریان خرید launchPurchaseFlow
 *  ۴) پس از خرید موفق → مصرف (consume) آیتم چون سکه/الماس مصرف‌شدنی هستند
 *  ۵) نتیجهٔ نهایی به جاوااسکریپت برگردانده می‌شود: CH.onIapResult(sku, ok)
 *
 * شناسهٔ محصولات (Product IDs) در پنل مایکت تعریف شده‌اند:
 *   seke500, seke1500, seke4000, almas15, almas35, almas80, amazing
 */
public class MyketIap {

    private static final String TAG = "MyketIap";

    /** کلید عمومی برنامه در مایکت — به‌صورت تکه‌تکه (توصیهٔ مایکت برای جلوگیری از مهندسی معکوس) */
    private static final String PUBLIC_KEY_PART_1 =
            "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCJ125BTlz9Kq6mqgX8ShGULpjnRXjYYmemgpJgPgwuuJljewvcJhnAk7tzY0VyA";
    private static final String PUBLIC_KEY_PART_2 =
            "/ZuzO2Z1y1jLRTlva8w32xIJRTkjDzdQDxKjjm5HmXVNOO8K58BZ1Z9/ATAH7RqFW7WKHGuZIHvASzvN5qnUFU0zxSsL66KQVYYpen6vxy";
    private static final String PUBLIC_KEY_PART_3 =
            "96QIDAQAB";

    private static String publicKey() {
        return PUBLIC_KEY_PART_1 + PUBLIC_KEY_PART_2 + PUBLIC_KEY_PART_3;
    }

    /** شناسهٔ محصولات — باید با CH.SHOP.iap در بازی (js/story-data.js) هماهنگ باشد */
    public static final String[] SKUS = {
            "seke500", "seke1500", "seke4000",
            "almas15", "almas35", "almas80",
            "amazing"
    };

    private final Activity activity;
    private IabHelper mHelper;
    private boolean ready = false;

    public MyketIap(Activity activity) {
        this.activity = activity;
    }

    /** راه‌اندازی اتصال به سرویس پرداخت مایکت */
    public void setup() {
        try {
            mHelper = new IabHelper(activity, publicKey());
            mHelper.enableDebugLogging(true, TAG);
            mHelper.startSetup(new IabHelper.OnIabSetupFinishedListener() {
                public void onIabSetupFinished(IabResult result) {
                    if (!result.isSuccess()) {
                        Log.d(TAG, "Problem setting up Myket In-app Billing: " + result);
                        return;
                    }
                    Log.d(TAG, "Myket IAB is fully set up.");
                    ready = true;
                    // بازیابی خریدهای مصرف‌نشدهٔ قبلی (مثلاً بعد از خروج ناگهانی)
                    recoverUnconsumedPurchases();
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "setup exception", e);
        }
    }

    public boolean isReady() { return ready && mHelper != null && !mHelper.isDisposed(); }

    /** استعلام خریدهای قبلی و مصرف آن‌ها + اهدای جایزه به بازی (رفع خریدهای نیمه‌کاره) */
    private void recoverUnconsumedPurchases() {
        if (!isReady()) return;
        try {
            List<String> skuList = new ArrayList<String>();
            for (String s : SKUS) skuList.add(s);
            mHelper.queryInventoryAsync(true, skuList, new IabHelper.QueryInventoryFinishedListener() {
                @Override
                public void onQueryInventoryFinished(IabResult result, Inventory inv) {
                    if (result.isFailure()) {
                        Log.d(TAG, "queryInventory failed: " + result);
                        return;
                    }
                    for (String sku : SKUS) {
                        Purchase p = inv.getPurchase(sku);
                        if (p != null) {
                            // خرید انجام شده ولی مصرف نشده → مصرف و اهدا
                            Log.d(TAG, "Found unconsumed purchase: " + sku);
                            consumeAndNotify(p);
                        }
                    }
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "recover exception", e);
        }
    }

    /** شروع جریان خرید */
    public void purchase(final String sku) {
        if (!isReady()) {
            Log.e(TAG, "IAB not ready — cannot purchase " + sku);
            IapBridge.getInstance().notifyIapResult(sku, false);
            return;
        }
        try {
            mHelper.launchPurchaseFlow(activity, sku, IabHelper.RC_REQUEST,
                    new IabHelper.OnIabPurchaseFinishedListener() {
                        @Override
                        public void onIabPurchaseFinished(IabResult result, Purchase info) {
                            if (result.isFailure()) {
                                Log.d(TAG, "Purchase failed: " + result);
                                IapBridge.getInstance().notifyIapResult(sku, false);
                                return;
                            }
                            Log.d(TAG, "Purchase successful: " + info.getSku());
                            consumeAndNotify(info);
                        }
                    });
        } catch (Exception e) {
            Log.e(TAG, "purchase exception", e);
            IapBridge.getInstance().notifyIapResult(sku, false);
        }
    }

    /** مصرف آیتم (سکه/الماس مصرف‌شدنی هستند) و سپس اهدا به بازی */
    private void consumeAndNotify(final Purchase p) {
        try {
            mHelper.consumeAsync(p, new IabHelper.OnConsumeFinishedListener() {
                @Override
                public void onConsumeFinished(Purchase purchase, IabResult result) {
                    if (result.isFailure()) {
                        Log.e(TAG, "Consume failed for " + purchase.getSku() + ": " + result);
                        return; // دفعهٔ بعد از طریق recoverUnconsumedPurchases دوباره اهدا می‌شود
                    }
                    Log.d(TAG, "Consume successful: " + purchase.getSku());
                    IapBridge.getInstance().notifyIapResult(purchase.getSku(), true);
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "consume exception", e);
        }
    }

    /** پاس دادن نتیجهٔ Activity به IabHelper (از MainActivity.onActivityResult) */
    public boolean handleActivityResult(int requestCode, int resultCode, android.content.Intent data) {
        return mHelper != null && mHelper.handleActivityResult(requestCode, resultCode, data);
    }

    /** آزادسازی منابع */
    public void dispose() {
        if (mHelper != null) {
            try { mHelper.dispose(); } catch (Exception ignored) { }
            mHelper = null;
            ready = false;
        }
    }
}
