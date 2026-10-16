package com.parsgames.chogan

import android.annotation.SuppressLint
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

/**
 * چوگان: میراث پارس — میزبان WebView بازی
 *
 * - قفل افقی (Landscape)
 * - تمام‌صفحه Immersive
 * - روشن ماندن صفحه هنگام بازی
 * - پل جاوااسکریپت: window.ChoganAndroid (برای خرید درون‌برنامه‌ای و لرزش)
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

        // پل خرید درون‌برنامه‌ای + لرزش (Kotlin → Java bridge)
        iapBridge = IapBridge(this)
        webView.addJavascriptInterface(iapBridge, "ChoganAndroid")

        webView.loadUrl("file:///android_asset/chogan/index.html")
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
        webView.destroy()
        super.onDestroy()
    }
}
