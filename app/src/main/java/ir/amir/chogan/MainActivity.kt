package ir.amir.chogan

import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.ActivityInfo
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.adivery.sdk.Adivery

/**
 * چوگان: میراث پارس — میزبان WebView بازی
 *
 * - قفل افقی (Landscape) + تمام‌صفحه Immersive
 * - روشن ماندن صفحه هنگام بازی
 * - پل جاوااسکریپت: window.ChoganAndroid
 *     · خرید درون‌برنامه‌ای مایکت (ir.mservices.market)
 *     · تبلیغ جایزه‌ای ادیوری (Adivery)
 *     · لرزش، باز کردن لینک‌ها
 * - پکیج‌نیم بازی: ir.amir.chogan
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var iapBridge: IapBridge

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // افقی اجباری (طبق طراحی بازی)
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        hideSystemBars()

        /* ── راه‌اندازی ادیوری (طبق مستندات docs.adivery.com/android) ── */
        Adivery.configure(application, IapBridge.ADIVERY_APP_ID)

        webView = WebView(this)
        setContentView(webView)

        webView.setBackgroundColor(ContextCompat.getColor(this, R.color.bg))
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true // ذخیره‌سازی پیشرفت بازی
            mediaPlaybackRequiresUserGesture = false // شروع خودکار صدا
            allowFileAccess = true
            allowContentAccess = true
            cacheMode = WebSettings.LOAD_DEFAULT
            textZoom = 100
        }

        webView.webViewClient = WebViewClient()
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(message: ConsoleMessage?): Boolean {
                android.util.Log.d(
                    "ChoganJS",
                    "[${message?.lineNumber()}] ${message?.message()}"
                )
                return true
            }
        }

        // پل خرید مایکت + تبلیغ ادیوری + لرزش (Kotlin → Java bridge)
        iapBridge = IapBridge(this, webView)
        webView.addJavascriptInterface(iapBridge, "ChoganAndroid")

        // اتصال سرویس پرداخت مایکت
        iapBridge.setupBilling()
        // listener ادیوری: نتیجهٔ تبلیغ جایزه‌ای به بازی برمی‌گردد (CH.onAdResult)
        iapBridge.attachAdiveryListener()
        // آماده‌سازی اولین تبلیغ جایزه‌ای (ادیوری بعد از هر نمایش، بعدی را خودش آماده می‌کند)
        iapBridge.prepareRewardedAd()

        webView.loadUrl("file:///android_asset/chogan/index.html")
    }

    /** نتیجهٔ صفحهٔ پرداخت مایکت به جریان خرید برگردانده می‌شود */
    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        iapBridge.handleActivityResult(requestCode, resultCode, data)
    }

    private fun hideSystemBars() {
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) hideSystemBars()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        // بازی تمام‌صفحه است؛ دکمه بازگشت برنامه را پس‌زمینه می‌کند نه خروج کامل
        moveTaskToBack(true)
    }

    override fun onDestroy() {
        iapBridge.dispose()
        webView.destroy()
        super.onDestroy()
    }
}
