package com.example

import android.content.Context
import android.content.Intent
import android.inputmethodservice.InputMethodService
import android.os.Build
import android.view.View
import android.view.inputmethod.EditorInfo
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient

class FancyKeyboardService : InputMethodService() {

    private var keyboardWebView: WebView? = null

    inner class AndroidBridge {

        @JavascriptInterface
        fun typeText(text: String) {
            currentInputConnection?.commitText(text, 1)
        }

        @JavascriptInterface
        fun deleteChar(count: Int) {
            if (count <= 0) return
            val selectedText = currentInputConnection?.getSelectedText(0)
            if (!selectedText.isNull_or_empty()) {
                currentInputConnection?.commitText("", 1)
            } else {
                currentInputConnection?.deleteSurroundingText(count, 0)
            }
        }

        @JavascriptInterface
        fun switchToNextKeyboard() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                switchToNextInputMethod(false)
            } else {
                @Suppress("DEPRECATION")
                val token = window?.window?.attributes?.token
                val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as? android.view.inputmethod.InputMethodManager
                imm?.switchToNextInputMethod(token, false)
            }
        }

        @JavascriptInterface
        fun openSettings() {
            val intent = Intent(this@FancyKeyboardService, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
        }

        @JavascriptInterface
        fun requestSettingsUpdate() {
            sendSettingsToWebView()
        }
    }

    private fun CharSequence?.isNull_or_empty(): Boolean = this == null || this.isEmpty()

    override fun onCreateInputView(): View {
        val webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = true
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            setBackgroundColor(0x00000000)

            addJavascriptInterface(AndroidBridge(), "AndroidBridge")

            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    sendSettingsToWebView()
                }
            }

            loadUrl("file:///android_asset/keyboard.html")
        }

        keyboardWebView = webView
        return webView
    }

    override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
        super.onStartInputView(info, restarting)
        sendSettingsToWebView()
    }

    private fun sendSettingsToWebView() {
        keyboardWebView?.post {
            val prefs = getSharedPreferences("fancy_keyboard_prefs", Context.MODE_PRIVATE)
            val opacityPct = prefs.getInt("bg_opacity_pct", 85)
            val glassEnabled = prefs.getBoolean("glassmorphism_enabled", true)
            val accentHex = prefs.getString("accent_color_hex", "#8a2be2") ?: "#8a2be2"
            val gradientStart = prefs.getString("gradient_start", "#7b2cbf") ?: "#7b2cbf"
            val gradientEnd = prefs.getString("gradient_end", "#3a0ca3") ?: "#3a0ca3"

            val jsScript = "if (window.applySettings) { window.applySettings($opacityPct, $glassEnabled, '$accentHex', '$gradientStart', '$gradientEnd'); }"
            keyboardWebView?.evaluateJavascript(jsScript, null)
        }
    }

    override fun onDestroy() {
        keyboardWebView?.destroy()
        keyboardWebView = null
        super.onDestroy()
    }
}
