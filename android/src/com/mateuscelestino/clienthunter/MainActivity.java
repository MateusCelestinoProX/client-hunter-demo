package com.mateuscelestino.clienthunter;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MainActivity extends Activity {

    public static final String DEVICE_SIGNATURE = "CLIENT-HUNTER-ANDROID-PRO-2026-MATEUS-CELESTINO";
    public static final String TAILSCALE_NODE_ID = "s22-ultra-de-mateus";

    // Rotas de Conexão em ordem de prioridade
    private static final String URL_LOCALHOST = "http://localhost:3333";
    private static final String URL_TAILSCALE_DNS = "https://instance-20260907-0637.tail798a9b.ts.net:3333";
    private static final String URL_LAN_WIFI = "http://192.168.15.23:3333";
    private static final String URL_TAILSCALE_IP = "https://100.99.207.96:3333";

    private final List<String> serverCandidates = new ArrayList<>();
    private int currentCandidateIndex = 0;
    private String currentUrl = URL_LOCALHOST;

    private WebView mWebView;
    private ProgressBar mProgressBar;
    private FrameLayout mRootLayout;
    private ScrollView mErrorScrollView;
    private LinearLayout mErrorLayout;
    private TextView mErrorDetailsText;
    private boolean mHasLoadedSuccessfully = false;
    private long mLastBackPressTime = 0;

    private ValueCallback<Uri[]> mFilePathCallback;
    private static final int FILECHOOSER_RESULTCODE = 1001;

    private String mCurrentAccentColorHex = "#FA4200";
    private String mCurrentSecondaryColorHex = "#FF7733";
    private int mCurrentAccentColor = Color.parseColor("#FA4200");
    private int mCurrentSecondaryColor = Color.parseColor("#FF7733");

    private final Handler mHandler = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Carrega cores salvas do SharedPreferences
        try {
            SharedPreferences prefs = getSharedPreferences("client_hunter_prefs", Context.MODE_PRIVATE);
            mCurrentAccentColorHex = prefs.getString("accent_color", "#FA4200");
            mCurrentSecondaryColorHex = prefs.getString("secondary_color", "#FF7733");
            mCurrentAccentColor = Color.parseColor(mCurrentAccentColorHex);
            mCurrentSecondaryColor = Color.parseColor(mCurrentSecondaryColorHex);
        } catch (Exception ignored) {
        }

        // Inicializa candidatos de rota (Tailscale DNS prioritário para conexão instantânea na VPS)
        serverCandidates.add(URL_TAILSCALE_DNS);
        serverCandidates.add(URL_LOCALHOST);
        serverCandidates.add(URL_LAN_WIFI);
        serverCandidates.add(URL_TAILSCALE_IP);

        currentUrl = serverCandidates.get(0);

        // Desperta / Conecta Tailscale VPN proativamente para acesso à VPS
        conectarTailscaleSeNecessario();

        // Configuração de Sistema e Estilo Imersivo Dark
        configurarBarraDeSistema();

        // Raiz da View
        mRootLayout = new FrameLayout(this);
        mRootLayout.setBackgroundColor(Color.parseColor("#080a0f"));

        // 1. WebView Principal com Hardware Acceleration
        configurarWebView();
        mRootLayout.addView(mWebView);

        // 2. Barra de Progresso Cyber Hunter
        mProgressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        mProgressBar.setMax(100);
        mProgressBar.setProgress(0);
        int initialAccentColor = mCurrentSecondaryColor != 0 ? mCurrentSecondaryColor : mCurrentAccentColor;
        mProgressBar.getProgressDrawable().setColorFilter(
                initialAccentColor,
                android.graphics.PorterDuff.Mode.SRC_IN
        );
        FrameLayout.LayoutParams progParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                dpToPx(3)
        );
        progParams.gravity = Gravity.TOP;
        mProgressBar.setLayoutParams(progParams);
        mRootLayout.addView(mProgressBar);

        // 3. Layout de Erro / Diagnóstico de Conexão
        configurarLayoutDeErro();
        mRootLayout.addView(mErrorScrollView);

        setContentView(mRootLayout);

        // Inicia carregamento
        carregarUrl(currentUrl);
    }

    private void configurarBarraDeSistema() {
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.parseColor("#080a0f"));
        window.setNavigationBarColor(Color.parseColor("#080a0f"));

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(true);
        }
    }

    private void configurarWebView() {
        mWebView = new WebView(this);
        mWebView.setBackgroundColor(Color.TRANSPARENT);
        mWebView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        FrameLayout.LayoutParams webParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        );
        mWebView.setLayoutParams(webParams);

        WebSettings s = mWebView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setLoadWithOverviewMode(false);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMediaPlaybackRequiresUserGesture(false);

        // User Agent Oficial
        String ua = s.getUserAgentString();
        s.setUserAgentString(ua + " ClientHunterMobile/2.0 (Android; SM-S908E; Authorized)");

        // Cookies
        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(mWebView, true);

        // Permite inspeção remota via Chrome DevTools (chrome://inspect)
        WebView.setWebContentsDebuggingEnabled(true);

        // Adiciona Bridge JavaScript Nativo
        mWebView.addJavascriptInterface(new NativeBridge(this), "AndroidApp");

        // WebChromeClient para barra de progresso, console e file chooser
        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    mProgressBar.setVisibility(View.VISIBLE);
                    mProgressBar.setProgress(newProgress);
                } else {
                    mProgressBar.setVisibility(View.GONE);
                }
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                android.util.Log.d("ClientHunterJS", consoleMessage.message() + " ["
                        + consoleMessage.sourceId() + ":" + consoleMessage.lineNumber() + "]");
                return true;
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                              FileChooserParams fileChooserParams) {
                if (mFilePathCallback != null) {
                    mFilePathCallback.onReceiveValue(null);
                }
                mFilePathCallback = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILECHOOSER_RESULTCODE);
                } catch (Exception e) {
                    mFilePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        // WebViewClient para controle de navegação e tratamento de erros
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                mProgressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                mProgressBar.setVisibility(View.GONE);
                mHasLoadedSuccessfully = true;
                esconderErro();

                // Sincroniza cores entre localStorage e native Android (a cor secundária é absoluta)
                view.evaluateJavascript(
                        "(function() {" +
                        "  try {" +
                        "    var sec = localStorage.getItem('client_hunter_secondary_color');" +
                        "    var pri = localStorage.getItem('client_hunter_accent_color');" +
                        "    if (sec && window.AndroidApp && window.AndroidApp.setColors) {" +
                        "      window.AndroidApp.setColors(sec, sec);" +
                        "    } else if (pri && window.AndroidApp && window.AndroidApp.setColors) {" +
                        "      window.AndroidApp.setColors(pri, pri);" +
                        "    } else {" +
                        "      if (!localStorage.getItem('client_hunter_accent_color')) {" +
                        "        localStorage.setItem('client_hunter_accent_color', '" + mCurrentAccentColorHex + "');" +
                        "      }" +
                        "      if (!localStorage.getItem('client_hunter_secondary_color')) {" +
                        "        localStorage.setItem('client_hunter_secondary_color', '" + mCurrentSecondaryColorHex + "');" +
                        "      }" +
                        "    }" +
                        "  } catch(e) {}" +
                        "})()", null);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    android.util.Log.w("ClientHunterNet", "Erro no frame principal: " + error.getDescription() + " em " + currentUrl);
                    tentarProximaRotaOuErro("Erro de Conexão: " + error.getDescription());
                }
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                // Permite certificados internos da rede Tailscale
                handler.proceed();
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String url = uri != null ? uri.toString() : "";

                // Permite links internos no WebView
                if (url.startsWith("http://localhost:3333") ||
                    url.startsWith("http://127.0.0.1:3333") ||
                    url.startsWith("https://instance-20260907-0637") ||
                    url.startsWith("http://192.168.15.23:3333") ||
                    url.startsWith("https://100.99.207.96:3333") ||
                    (currentUrl != null && !currentUrl.isEmpty() && url.startsWith(currentUrl)) ||
                    url.startsWith("file:///android_asset/")) {
                    return false;
                }

                // Trata intents específicos (whatsapp, intent://, tel:, mailto:) e links externos
                try {
                    if (url.startsWith("intent://")) {
                        Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                        if (intent != null) {
                            String fallbackUrl = intent.getStringExtra("browser_fallback_url");
                            if (getPackageManager().resolveActivity(intent, 0) != null) {
                                startActivity(intent);
                                return true;
                            } else if (fallbackUrl != null) {
                                view.loadUrl(fallbackUrl);
                                return true;
                            }
                        }
                    }
                    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                    startActivity(intent);
                } catch (Exception ignored) {
                }
                return true;
            }
        });
    }

    private void tentarProximaRotaOuErro(String motivo) {
        currentCandidateIndex++;
        if (currentCandidateIndex < serverCandidates.size()) {
            currentUrl = serverCandidates.get(currentCandidateIndex);
            if (currentUrl.equals(URL_TAILSCALE_DNS) || currentUrl.equals(URL_TAILSCALE_IP)) {
                conectarTailscaleSeNecessario();
            }
            android.util.Log.i("ClientHunterNet", "Alternando para rota secundária: " + currentUrl);
            mHandler.post(new Runnable() {
                @Override
                public void run() {
                    carregarUrl(currentUrl);
                }
            });
        } else {
            // Se todas as rotas falharam e não tínhamos carregado antes, mostra tela de diagnóstico
            if (!mHasLoadedSuccessfully) {
                mHandler.post(new Runnable() {
                    @Override
                    public void run() {
                        exibirErro(motivo);
                    }
                });
            }
        }
    }

    public void conectarTailscaleSeNecessario() {
        try {
            Intent vpnIntent = new Intent("com.tailscale.ipn.CONNECT_VPN");
            vpnIntent.setComponent(new android.content.ComponentName("com.tailscale.ipn", "com.tailscale.ipn.IPNReceiver"));
            sendBroadcast(vpnIntent);
            android.util.Log.i("ClientHunterNet", "Broadcast CONNECT_VPN enviado para Tailscale");
        } catch (Exception e) {
            android.util.Log.w("ClientHunterNet", "Falha ao enviar broadcast para Tailscale: " + e.getMessage());
        }
    }

    private void carregarUrl(String url) {
        currentUrl = url;
        esconderErro();
        mProgressBar.setVisibility(View.VISIBLE);

        Map<String, String> headers = new HashMap<>();
        headers.put("X-Client-Signature", DEVICE_SIGNATURE);
        headers.put("X-Tailscale-Node-Id", TAILSCALE_NODE_ID);
        headers.put("X-Client-Authorized", "MateusCelestinoProX");

        mWebView.loadUrl(url, headers);
    }

    private void configurarLayoutDeErro() {
        mErrorScrollView = new ScrollView(this);
        FrameLayout.LayoutParams scrollParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        );
        mErrorScrollView.setLayoutParams(scrollParams);
        mErrorScrollView.setBackgroundColor(Color.parseColor("#0c0a08"));
        mErrorScrollView.setVisibility(View.GONE);

        mErrorLayout = new LinearLayout(this);
        mErrorLayout.setOrientation(LinearLayout.VERTICAL);
        mErrorLayout.setGravity(Gravity.CENTER_HORIZONTAL);
        mErrorLayout.setPadding(dpToPx(24), dpToPx(48), dpToPx(24), dpToPx(48));

        // Ícone / Badge
        TextView logoBadge = new TextView(this);
        logoBadge.setText("🎯");
        logoBadge.setTextSize(48);
        logoBadge.setGravity(Gravity.CENTER);
        mErrorLayout.addView(logoBadge);

        // Título
        TextView title = new TextView(this);
        title.setText("Client Hunter PRO");
        title.setTextSize(22);
        title.setTypeface(null, Typeface.BOLD);
        title.setTextColor(mCurrentAccentColor);
        title.setGravity(Gravity.CENTER);
        title.setPadding(0, dpToPx(8), 0, dpToPx(4));
        mErrorLayout.addView(title);

        // Subtítulo
        TextView subtitle = new TextView(this);
        subtitle.setText("Central de Conectividade do Engine B2B");
        subtitle.setTextSize(13);
        subtitle.setTextColor(Color.parseColor("#9ca3af"));
        subtitle.setGravity(Gravity.CENTER);
        subtitle.setPadding(0, 0, 0, dpToPx(20));
        mErrorLayout.addView(subtitle);

        // Detalhes do Erro
        mErrorDetailsText = new TextView(this);
        mErrorDetailsText.setText("Aguardando resposta do servidor...");
        mErrorDetailsText.setTextSize(12);
        mErrorDetailsText.setTextColor(Color.parseColor("#e5e7eb"));
        mErrorDetailsText.setBackgroundColor(Color.parseColor("#161311"));
        mErrorDetailsText.setPadding(dpToPx(16), dpToPx(12), dpToPx(16), dpToPx(12));
        mErrorDetailsText.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams detParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
        detParams.setMargins(0, 0, 0, dpToPx(24));
        mErrorDetailsText.setLayoutParams(detParams);
        mErrorLayout.addView(mErrorDetailsText);

        // Botão Tentar Novamente (Cor de Destaque Dinâmica)
        Button btnRetry = criarBotao("Tentar Novamente (Auto-Detectar)", mCurrentAccentColorHex, "#ffffff", new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                currentCandidateIndex = 0;
                carregarUrl(serverCandidates.get(0));
            }
        });
        mErrorLayout.addView(btnRetry);

        // Botão Rota 1: Localhost (ADB Reverse)
        Button btnLocalhost = criarBotao("Conectar via Localhost (ADB Reverse)", "#1f1c19", mCurrentAccentColorHex, new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                carregarUrl(URL_LOCALHOST);
            }
        });
        mErrorLayout.addView(btnLocalhost);

        // Botão Rota 2: Tailscale MagicDNS
        Button btnTailscale = criarBotao("Conectar via Tailscale MagicDNS (VPS Segura)", "#1f1c19", "#38bdf8", new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                conectarTailscaleSeNecessario();
                Toast.makeText(MainActivity.this, "Ativando Tailscale VPN e conectando...", Toast.LENGTH_SHORT).show();
                mHandler.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        carregarUrl(URL_TAILSCALE_DNS);
                    }
                }, 600);
            }
        });
        mErrorLayout.addView(btnTailscale);

        // Botão Rota 3: Wi-Fi LAN
        Button btnWifi = criarBotao("Conectar via Wi-Fi Local (192.168.15.23)", "#1f1c19", "#10b981", new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                carregarUrl(URL_LAN_WIFI);
            }
        });
        mErrorLayout.addView(btnWifi);

        // Campo para IP Personalizado
        TextView customLabel = new TextView(this);
        customLabel.setText("Ou insira uma URL personalizada:");
        customLabel.setTextSize(12);
        customLabel.setTextColor(Color.parseColor("#9ca3af"));
        customLabel.setPadding(0, dpToPx(20), 0, dpToPx(8));
        mErrorLayout.addView(customLabel);

        final EditText editCustomUrl = new EditText(this);
        editCustomUrl.setHint("http://192.168.15.23:3333");
        editCustomUrl.setHintTextColor(Color.parseColor("#6b7280"));
        editCustomUrl.setTextColor(Color.parseColor("#ffffff"));
        editCustomUrl.setTextSize(13);
        editCustomUrl.setBackgroundColor(Color.parseColor("#1f1c19"));
        editCustomUrl.setPadding(dpToPx(14), dpToPx(12), dpToPx(14), dpToPx(12));
        LinearLayout.LayoutParams editParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
        editParams.setMargins(0, 0, 0, dpToPx(12));
        editCustomUrl.setLayoutParams(editParams);
        mErrorLayout.addView(editCustomUrl);

        Button btnCustom = criarBotao("Conectar nesta URL", "#2a2420", "#ffffff", new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String input = editCustomUrl.getText().toString().trim();
                if (!input.isEmpty()) {
                    if (!input.startsWith("http://") && !input.startsWith("https://")) {
                        input = "http://" + input;
                    }
                    carregarUrl(input);
                }
            }
        });
        mErrorLayout.addView(btnCustom);

        mErrorScrollView.addView(mErrorLayout);
    }

    private Button criarBotao(String texto, String corBg, String corTexto, View.OnClickListener listener) {
        Button btn = new Button(this);
        btn.setText(texto);
        btn.setTextSize(13);
        btn.setTypeface(null, Typeface.BOLD);
        btn.setTextColor(Color.parseColor(corTexto));
        btn.setBackgroundColor(Color.parseColor(corBg));
        btn.setPadding(dpToPx(16), dpToPx(14), dpToPx(16), dpToPx(14));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, dpToPx(10));
        btn.setLayoutParams(params);
        btn.setOnClickListener(listener);
        return btn;
    }

    private void exibirErro(String detalhes) {
        mErrorDetailsText.setText(detalhes + "\n\nÚltima tentativa em:\n" + currentUrl);
        mErrorScrollView.setVisibility(View.VISIBLE);
        mWebView.setVisibility(View.GONE);
    }

    private void esconderErro() {
        mErrorScrollView.setVisibility(View.GONE);
        mWebView.setVisibility(View.VISIBLE);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            if (mErrorScrollView.getVisibility() == View.VISIBLE) {
                currentCandidateIndex = 0;
                carregarUrl(serverCandidates.get(0));
                return true;
            }
            if (mWebView.canGoBack()) {
                mWebView.goBack();
                return true;
            }
            long currentTime = System.currentTimeMillis();
            if (currentTime - mLastBackPressTime < 2000) {
                finish();
            } else {
                mLastBackPressTime = currentTime;
                Toast.makeText(this, "Pressione novamente para sair do Client Hunter", Toast.LENGTH_SHORT).show();
            }
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (mFilePathCallback != null) {
                Uri[] results = null;
                if (resultCode == Activity.RESULT_OK && data != null) {
                    String dataString = data.getDataString();
                    ClipData clipData = data.getClipData();
                    if (clipData != null) {
                        results = new Uri[clipData.getItemCount()];
                        for (int i = 0; i < clipData.getItemCount(); i++) {
                            results[i] = clipData.getItemAt(i).getUri();
                        }
                    } else if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    }
                }
                mFilePathCallback.onReceiveValue(results);
                mFilePathCallback = null;
            }
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    private int dpToPx(int dp) {
        return (int) TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                dp,
                getResources().getDisplayMetrics()
        );
    }

    public void setAccentColor(final String hex) {
        setColors(hex, mCurrentSecondaryColorHex);
    }

    public void setSecondaryColor(final String hex) {
        setColors(hex, hex);
    }

    public void setColors(final String primaryHex, final String secondaryHex) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    String activeHex = (secondaryHex != null && !secondaryHex.isEmpty()) ? secondaryHex : primaryHex;
                    if (activeHex != null && !activeHex.isEmpty()) {
                        mCurrentAccentColorHex = activeHex;
                        mCurrentSecondaryColorHex = activeHex;
                        mCurrentAccentColor = Color.parseColor(activeHex);
                        mCurrentSecondaryColor = Color.parseColor(activeHex);
                        if (mProgressBar != null && mProgressBar.getProgressDrawable() != null) {
                            mProgressBar.getProgressDrawable().setColorFilter(mCurrentSecondaryColor, android.graphics.PorterDuff.Mode.SRC_IN);
                        }
                    }
                    SharedPreferences p = getSharedPreferences("client_hunter_prefs", Context.MODE_PRIVATE);
                    p.edit()
                            .putString("accent_color", mCurrentAccentColorHex)
                            .putString("secondary_color", mCurrentSecondaryColorHex)
                            .apply();
                } catch (Exception ignored) {
                }
            }
        });
    }

    // =========================================================================
    // Native Bridge (JavaScript Interface exposta como window.AndroidApp)
    // =========================================================================
    public static class NativeBridge {
        private final MainActivity mActivity;

        public NativeBridge(MainActivity activity) {
            this.mActivity = activity;
        }

        @JavascriptInterface
        public void setAccentColor(final String hex) {
            mActivity.setAccentColor(hex);
        }

        @JavascriptInterface
        public void setSecondaryColor(final String hex) {
            mActivity.setSecondaryColor(hex);
        }

        @JavascriptInterface
        public void setColors(final String primaryHex, final String secondaryHex) {
            mActivity.setColors(primaryHex, secondaryHex);
        }

        @JavascriptInterface
        public void vibrate(long milliseconds) {
            try {
                Vibrator v = (Vibrator) mActivity.getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && v.hasVibrator()) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        v.vibrate(VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE));
                    } else {
                        v.vibrate(milliseconds);
                    }
                }
            } catch (Exception ignored) {
            }
        }

        @JavascriptInterface
        public void toast(final String message) {
            mActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(mActivity, message, Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void copyToClipboard(final String text) {
            mActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    ClipboardManager clipboard = (ClipboardManager) mActivity.getSystemService(Context.CLIPBOARD_SERVICE);
                    ClipData clip = ClipData.newPlainText("Client Hunter", text);
                    clipboard.setPrimaryClip(clip);
                    Toast.makeText(mActivity, "Copiado para a área de transferência!", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public String getDeviceModel() {
            return Build.MODEL;
        }

        @JavascriptInterface
        public String getAppVersion() {
            return "2.0.0";
        }

        @JavascriptInterface
        public void reload() {
            mActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mActivity.carregarUrl(mActivity.currentUrl);
                }
            });
        }

        @JavascriptInterface
        public void connectVpn() {
            mActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mActivity.conectarTailscaleSeNecessario();
                }
            });
        }

        @JavascriptInterface
        public void share(final String title, final String text, final String url) {
            mActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        Intent shareIntent = new Intent(Intent.ACTION_SEND);
                        shareIntent.setType("text/plain");
                        shareIntent.putExtra(Intent.EXTRA_SUBJECT, title);
                        shareIntent.putExtra(Intent.EXTRA_TEXT, text + (url != null ? " " + url : ""));
                        mActivity.startActivity(Intent.createChooser(shareIntent, "Compartilhar lead"));
                    } catch (Exception ignored) {
                    }
                }
            });
        }
    }
}
