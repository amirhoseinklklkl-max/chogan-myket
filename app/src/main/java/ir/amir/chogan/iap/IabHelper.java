/* Copyright (c) 2012 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IabHelper — طبق مستندات رسمی پرداخت درون‌برنامه‌ای مایکت (نمونهٔ TrivialDrive)
 * تنها تفاوت با نسخهٔ گوگل‌پلی: اتصال به سرویسِ برنامهٔ مایکت با نام پکیج
 * «ir.mservices.market» و اکشن «ir.mservices.market.InAppBillingService.BIND».
 * ─────────────────────────────────────────────────────────────────────────────
 */
package ir.amir.chogan.iap;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentSender.SendIntentException;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.RemoteException;
import android.text.TextUtils;
import android.util.Log;

import com.android.vending.billing.IInAppBillingService;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.List;

/**
 * Provides convenience methods for in-app billing (Myket flavor).
 */
public class IabHelper {
    // Debug tag
    static final String TAG = "IabHelper";
    public static final boolean DEBUG = false;

    // Is debug logging enabled?
    boolean mDebugLog = false;
    String mDebugTag = "IabHelper";

    // Is setup done?
    boolean mSetupDone = false;

    // Has this object been disposed of? (In which case we should ignore callbacks)
    boolean mDisposed = false;

    // Are we in the middle of an asynchronous operation?
    boolean mAsyncInProgress = false;

    // (for logging) what was the last operation requested?
    String mAsyncOperation = "";

    Context mContext;

    IInAppBillingService mService;
    ServiceConnection mServiceConn;

    // The request code used to launch purchase flow
    public static final int RC_REQUEST = 10001;

    // supported API version
    public static final int API_VERSION = 3;

    // The item type of the current purchase flow
    String mPurchasingItemType = null;

    // Context for the market client
    public static final String MARKET_PACKAGE_NAME = "ir.mservices.market";
    private static final String IAB_SERVICE_ACTION =
            MARKET_PACKAGE_NAME + ".InAppBillingService.BIND";

    // Billing response codes
    public static final int BILLING_RESPONSE_RESULT_OK = 0;
    public static final int BILLING_RESPONSE_RESULT_USER_CANCELED = 1;
    public static final int BILLING_RESPONSE_RESULT_SERVICE_UNAVAILABLE = 2;
    public static final int BILLING_RESPONSE_RESULT_BILLING_UNAVAILABLE = 3;
    public static final int BILLING_RESPONSE_RESULT_ITEM_UNAVAILABLE = 4;
    public static final int BILLING_RESPONSE_RESULT_DEVELOPER_ERROR = 5;
    public static final int BILLING_RESPONSE_RESULT_ERROR = 6;
    public static final int BILLING_RESPONSE_RESULT_ITEM_ALREADY_OWNED = 7;
    public static final int BILLING_RESPONSE_RESULT_ITEM_NOT_OWNED = 8;

    // IAB Helper error codes
    public static final int IABHELPER_ERROR_BASE = -1000;
    public static final int IABHELPER_REMOTE_EXCEPTION = -1001;
    public static final int IABHELPER_BAD_RESPONSE = -1002;
    public static final int IABHELPER_VERIFICATION_FAILED = -1003;
    public static final int IABHELPER_SEND_INTENT_FAILED = -1004;
    public static final int IABHELPER_INVALID_PURCHASE_RESPONSE = -1005;
    public static final int IABHELPER_MISSING_TOKEN = -1006;
    public static final int IABHELPER_UNKNOWN_ERROR = -1007;
    public static final int IABHELPER_SUBSCRIPTIONS_NOT_AVAILABLE = -1008;
    public static final int IABHELPER_INVALID_CONSUMPTION = -1010;

    // Keys for the responses from InAppBillingService
    public static final String RESPONSE_CODE = "RESPONSE_CODE";
    public static final String RESPONSE_GET_SKU_DETAILS_LIST = "DETAILS_LIST";
    public static final String RESPONSE_BUY_INTENT = "BUY_INTENT";
    public static final String RESPONSE_INAPP_PURCHASE_DATA = "INAPP_PURCHASE_DATA";
    public static final String RESPONSE_INAPP_PURCHASE_DATA_LIST = "INAPP_PURCHASE_DATA_LIST";
    public static final String RESPONSE_INAPP_PURCHASE_ITEM_LIST = "INAPP_PURCHASE_ITEM_LIST";
    public static final String RESPONSE_INAPP_SIGNATURE = "INAPP_DATA_SIGNATURE";
    public static final String RESPONSE_INAPP_SIGNATURE_LIST = "INAPP_DATA_SIGNATURE_LIST";
    public static final String INAPP_CONTINUATION_TOKEN = "INAPP_CONTINUATION_TOKEN";

    // Item types
    public static final String ITEM_TYPE_INAPP = "inapp";

    // some fields on the getSkuDetails response bundle
    public static final String GET_SKU_DETAILS_ITEM_LIST = "ITEM_ID_LIST";
    public static final String GET_SKU_DETAILS_ITEM_TYPE_LIST = "ITEM_TYPE_LIST";

    /**
     * Callback for setup process.
     */
    public interface OnIabSetupFinishedListener {
        void onIabSetupFinished(IabResult result);
    }

    /**
     * Callback to notify about in-app billing operations completion.
     */
    public interface OnIabPurchaseFinishedListener {
        void onIabPurchaseFinished(IabResult result, Purchase info);
    }

    /**
     * Listener for inventory queries.
     */
    public interface QueryInventoryFinishedListener {
        void onQueryInventoryFinished(IabResult result, Inventory inv);
    }

    /**
     * Callback that notifies when a consumption finishes successfully.
     */
    public interface OnConsumeFinishedListener {
        void onConsumeFinished(Purchase purchase, IabResult result);
    }

    /**
     * Callback that notifies when a multi-item consumption operation finishes.
     */
    public interface OnConsumeMultiFinishedListener {
        void onConsumeMultiFinished(List<Purchase> purchases, List<IabResult> results);
    }

    /**
     * Creates an instance with the given public key (کلید عمومی برنامه در مایکت).
     */
    public IabHelper(Context ctx, String base64PublicKey) {
        logDebug("IAB helper created.");
        mContext = ctx;
        mSignatureBase64 = base64PublicKey;
        logDebug("Starting IAB helper (Myket: " + MARKET_PACKAGE_NAME + ").");
    }

    String mSignatureBase64 = null;

    /**
     * Enable/disable debug logging.
     */
    public void enableDebugLogging(boolean enable, String tag) {
        checkNotDisposed();
        mDebugLog = enable;
        mDebugTag = tag;
    }

    public void enableDebugLogging(boolean enable) {
        checkNotDisposed();
        mDebugLog = enable;
    }

    /**
     * Callback for when a connection to the billing service has been established.
     */
    public void startSetup(final OnIabSetupFinishedListener listener) {
        checkNotDisposed();
        if (mSetupDone) throw new IllegalStateException("IAB helper is already set up.");

        logDebug("Starting in-app billing setup.");
        mServiceConn = new ServiceConnection() {
            @Override
            public void onServiceDisconnected(ComponentName name) {
                logDebug("Billing service disconnected.");
                mService = null;
            }

            @Override
            public void onServiceConnected(ComponentName name, IBinder service) {
                if (mDisposed) return;
                logDebug("Billing service connected.");
                mService = IInAppBillingService.Stub.asInterface(service);
                String packageName = mContext.getPackageName();
                try {
                    logDebug("Checking for in-app billing 3 support.");

                    int response = mService.isBillingSupported(API_VERSION, packageName, ITEM_TYPE_INAPP);
                    if (response != BILLING_RESPONSE_RESULT_OK) {
                        if (listener != null) listener.onIabSetupFinished(new IabResult(response,
                                "Error checking for billing v3 support."));

                        // if in-app purchases aren't supported at all, there's no point in polling.
                        mSetupDone = true;
                        return;
                    }
                    logDebug("In-app billing version 3 supported for " + packageName);
                } catch (RemoteException e) {
                    if (listener != null) {
                        listener.onIabSetupFinished(new IabResult(IABHELPER_REMOTE_EXCEPTION,
                                "RemoteException while setting up in-app billing."));
                    }
                    e.printStackTrace();
                    return;
                }

                mSetupDone = true;
                if (listener != null) {
                    listener.onIabSetupFinished(new IabResult(BILLING_RESPONSE_RESULT_OK, "Setup successful."));
                }
            }
        };

        Intent serviceIntent = new Intent(IAB_SERVICE_ACTION);
        serviceIntent.setPackage(MARKET_PACKAGE_NAME);
        if (!mContext.getPackageManager().queryIntentServices(serviceIntent, 0).isEmpty()) {
            // service available to handle that Intent
            try {
                mContext.bindService(serviceIntent, mServiceConn, Context.BIND_AUTO_CREATE);
            } catch (SecurityException e) {
                // در برخی نسخه‌ها permission BILLING لازم است — از Manifest تنظیم شده است
                logDebug("bindService SecurityException: " + e.getMessage());
                if (listener != null) {
                    listener.onIabSetupFinished(new IabResult(IABHELPER_SEND_INTENT_FAILED,
                            "SecurityException while binding to Myket billing service."));
                }
            }
        } else {
            // no service available to handle that Intent
            if (listener != null) {
                listener.onIabSetupFinished(new IabResult(BILLING_RESPONSE_RESULT_BILLING_UNAVAILABLE,
                        "Billing service unavailable on device. (مایکت نصب نیست؟)"));
            }
        }
    }

    /**
     * Dispose of object, releasing resources. It's very important to call this
     * method when you are done with this object.
     */
    public void dispose() {
        logDebug("Disposing.");
        mSetupDone = false;
        if (mServiceConn != null) {
            logDebug("Unbinding from service.");
            if (mContext != null) mContext.unbindService(mServiceConn);
            mServiceConn = null;
        }
        mDisposed = true;
        mContext = null;
        mService = null;
        mSignatureBase64 = null;
        logDebug("IAB helper disposed.");
    }

    void checkNotDisposed() {
        if (mDisposed) throw new IllegalStateException("IabHelper was disposed of, so it cannot be used.");
    }

    /** Returns whether or not the IAB helper is subscribed to the in-app billing service. */
    public boolean isBound() {
        return mService != null && mServiceConn != null;
    }

    /** آیا helper آزادسازی شده است؟ */
    public boolean isDisposed() { return mDisposed; }

    /**
     * Queries the inventory. This will query all owned items from the server,
     * as well as information on additional skus, if specified.
     */
    public Inventory queryInventory(boolean querySkuDetails, List<String> moreSkus)
            throws IabException {
        checkNotDisposed();
        try {
            Inventory inv = new Inventory();
            int r = queryPurchases(inv, ITEM_TYPE_INAPP);
            if (r != BILLING_RESPONSE_RESULT_OK) {
                throw new IabException(r, "Error refreshing inventory (querying owned items).");
            }

            if (querySkuDetails) {
                r = querySkuDetails(ITEM_TYPE_INAPP, inv, moreSkus);
                if (r != BILLING_RESPONSE_RESULT_OK) {
                    throw new IabException(r, "Error refreshing inventory (querying prices of items).");
                }
            }

            return inv;
        } catch (RemoteException e) {
            throw new IabException(IABHELPER_REMOTE_EXCEPTION, "Remote exception while refreshing inventory.", e);
        } catch (JSONException e) {
            throw new IabException(IABHELPER_BAD_RESPONSE, "Error parsing JSON response while refreshing inventory.", e);
        }
    }

    /**
     * Asynchronous wrapper for inventory query.
     */
    public void queryInventoryAsync(final boolean querySkuDetails,
                                    final List<String> moreSkus,
                                    final QueryInventoryFinishedListener listener) {
        final Handler handler = new Handler();
        checkNotDisposed();
        checkSetupDone("queryInventory");
        flagStartAsync("refresh inventory");
        (new Thread(new Runnable() {
            public void run() {
                IabResult result = new IabResult(BILLING_RESPONSE_RESULT_OK, "Inventory refresh successful.");
                Inventory inv = null;
                try {
                    inv = queryInventory(querySkuDetails, moreSkus);
                } catch (IabException ex) {
                    result = new IabResult(ex.getErrorCode(), ex.getMessage());
                }

                flagEndAsync();

                final IabResult result_f = result;
                final Inventory inv_f = inv;
                if (!mDisposed && listener != null) {
                    handler.post(new Runnable() {
                        public void run() {
                            listener.onQueryInventoryFinished(result_f, inv_f);
                        }
                    });
                }
            }
        })).start();
    }

    public void queryInventoryAsync(QueryInventoryFinishedListener listener) {
        queryInventoryAsync(true, null, listener);
    }

    /**
     * Initiate the UI flow for an in-app purchase.
     */
    public void launchPurchaseFlow(Activity act, String sku, int requestCode, OnIabPurchaseFinishedListener listener) {
        launchPurchaseFlow(act, sku, requestCode, listener, "");
    }

    public void launchPurchaseFlow(Activity act, String sku, int requestCode,
                                   OnIabPurchaseFinishedListener listener, String extraData) {
        checkNotDisposed();
        checkSetupDone("launchPurchaseFlow");
        flagStartAsync("launchPurchaseFlow");
        IabResult result;

        if (mPurchasingItemType != null) {
            result = new IabResult(IABHELPER_ERROR_BASE,
                    "Another asynchronous operation is already in progress");
            if (listener != null) listener.onIabPurchaseFinished(result, null);
            flagEndAsync();
            return;
        }
        mPurchasingItemType = ITEM_TYPE_INAPP;

        if (!isBound()) {
            result = new IabResult(IABHELPER_SEND_INTENT_FAILED, "Billing service is not bound.");
            if (listener != null) listener.onIabPurchaseFinished(result, null);
            flagEndAsync();
            mPurchasingItemType = null;
            return;
        }

        try {
            logDebug("Constructing buy intent for " + sku + ", item type: " + ITEM_TYPE_INAPP);
            Bundle buyIntentBundle = mService.getBuyIntent(API_VERSION, mContext.getPackageName(), sku, ITEM_TYPE_INAPP, extraData);
            int response = getResponseCodeFromBundle(buyIntentBundle);
            if (response != BILLING_RESPONSE_RESULT_OK) {
                logError("Unable to buy item, Error response: " + getResponseDesc(response));
                flagEndAsync();
                result = new IabResult(response, "Unable to buy item");
                if (listener != null) listener.onIabPurchaseFinished(result, null);
                mPurchasingItemType = null;
                return;
            }

            PendingIntent pendingIntent = buyIntentBundle.getParcelable(RESPONSE_BUY_INTENT);
            logDebug("Launching buy intent for " + sku + ". Request code: " + requestCode);
            if (pendingIntent != null) {
                act.startIntentSenderForResult(pendingIntent.getIntentSender(),
                        requestCode, new Intent(), 0, 0, 0);
            } else {
                flagEndAsync();
                result = new IabResult(IABHELPER_INVALID_PURCHASE_RESPONSE, "Null PendingIntent");
                if (listener != null) listener.onIabPurchaseFinished(result, null);
                mPurchasingItemType = null;
                return;
            }
        } catch (SendIntentException e) {
            logError("SendIntentException while launching purchase flow for sku " + sku);
            e.printStackTrace();
            flagEndAsync();
            result = new IabResult(IABHELPER_SEND_INTENT_FAILED, "Failed to send intent.");
            if (listener != null) listener.onIabPurchaseFinished(result, null);
            mPurchasingItemType = null;
            return;
        } catch (RemoteException e) {
            logError("RemoteException while launching purchase flow for sku " + sku);
            e.printStackTrace();
            flagEndAsync();
            result = new IabResult(IABHELPER_REMOTE_EXCEPTION, "Remote exception while starting purchase flow");
            if (listener != null) listener.onIabPurchaseFinished(result, null);
            mPurchasingItemType = null;
            return;
        }
        mPurchaseListener = listener;
    }

    OnIabPurchaseFinishedListener mPurchaseListener;

    /**
     * Handles an activity result that's part of the purchase flow in in-app billing.
     */
    public boolean handleActivityResult(int requestCode, int resultCode, Intent data) {
        IABResultHelper helper = new IABResultHelper();
        return helper.handleActivityResult(requestCode, resultCode, data);
    }

    // شفاف‌سازی رفتار handleActivityResult برای جلوگیری از کد تکراری
    private class IABResultHelper {
        boolean handleActivityResult(int requestCode, int resultCode, Intent data) {
            IabResult result;
            if (requestCode != RC_REQUEST) {
                logDebug("Wrong request code: " + requestCode + " (must be " + RC_REQUEST + ")");
                return false;
            }
            if (mPurchaseListener == null) {
                logError("handleActivityResult called, but purchase listener is null.");
                return false;
            }
            if (data == null) {
                logError("NULL data in IAB activity result.");
                result = new IabResult(IABHELPER_BAD_RESPONSE, "Null data in IAB result");
                if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, null);
                return true;
            }

            int responseCode = getResponseCodeFromIntent(data);
            String purchaseData = data.getStringExtra(RESPONSE_INAPP_PURCHASE_DATA);
            String dataSignature = data.getStringExtra(RESPONSE_INAPP_SIGNATURE);

            if (resultCode == Activity.RESULT_OK && responseCode == BILLING_RESPONSE_RESULT_OK) {
                logDebug("Successful resultcode from purchase activity.");
                logDebug("Purchase data: " + purchaseData);
                logDebug("Data signature: " + dataSignature);

                if (purchaseData == null || dataSignature == null) {
                    logError("BUG: either purchaseData or dataSignature is null.");
                    result = new IabResult(IABHELPER_UNKNOWN_ERROR, "IAB returned null purchaseData or dataSignature");
                    if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, null);
                    return true;
                }

                Purchase purchase = null;
                try {
                    purchase = new Purchase(ITEM_TYPE_INAPP, purchaseData, dataSignature);
                    String sku = purchase.getSku();

                    // Verify signature
                    if (!Security.verifyPurchase(mSignatureBase64, purchaseData, dataSignature)) {
                        logError("Purchase signature verification FAILED for sku " + sku);
                        result = new IabResult(IABHELPER_VERIFICATION_FAILED, "Signature verification failed for sku " + sku);
                        if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, purchase);
                        return true;
                    }
                    logDebug("Purchase signature successfully verified.");
                } catch (JSONException e) {
                    logError("Failed to parse purchase data.");
                    e.printStackTrace();
                    result = new IabResult(IABHELPER_BAD_RESPONSE, "Failed to parse purchase data.");
                    if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, null);
                    return true;
                }

                if (mPurchaseListener != null) {
                    mPurchaseListener.onIabPurchaseFinished(new IabResult(BILLING_RESPONSE_RESULT_OK, "Success"), purchase);
                }
            } else if (resultCode == Activity.RESULT_OK) {
                // result code was OK but in-app billing response was not OK.
                logDebug("Result code was OK but unexpected billing response from purchase activity: " + responseCode);
                result = new IabResult(responseCode, "Problem purchasing: " + getResponseDesc(responseCode));
                if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, null);
            } else if (resultCode == Activity.RESULT_CANCELED) {
                logDebug("Purchase canceled - Response: " + getResponseDesc(responseCode));
                result = new IabResult(BILLING_RESPONSE_RESULT_USER_CANCELED, "User canceled.");
                if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, null);
            } else {
                logError("Purchase failed. Result code: " + Integer.toString(resultCode)
                        + ". Response: " + getResponseDesc(responseCode));
                result = new IabResult(IABHELPER_UNKNOWN_ERROR, "Unknown purchasing response.");
                if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, null);
            }

            flagEndAsync();
            mPurchaseListener = null;
            mPurchasingItemType = null;
            return true;
        }
    }

    public Inventory queryInventory(boolean querySkuDetails, List<String> moreSkus, List<String> subSkus)
            throws IabException {
        return queryInventory(querySkuDetails, moreSkus);
    }

    /**
     * Consumes a given in-app product.
     */
    void consume(Purchase itemInfo) throws IabException {
        checkNotDisposed();
        checkSetupDone("consume");

        if (!itemInfo.mItemType.equals(ITEM_TYPE_INAPP)) {
            throw new IabException(IABHELPER_INVALID_CONSUMPTION,
                    "Items of type '" + itemInfo.mItemType + "' can't be consumed.");
        }

        try {
            String token = itemInfo.getToken();
            String sku = itemInfo.getSku();
            if (token == null || token.equals("")) {
                logError("Can't consume " + sku + ". No token.");
                throw new IabException(IABHELPER_MISSING_TOKEN, "PurchaseInfo is missing token for sku: "
                        + sku + " " + itemInfo);
            }

            logDebug("Consuming sku: " + sku + ", token: " + token);
            int response = mService.consumePurchase(API_VERSION, mContext.getPackageName(), token);
            if (response == BILLING_RESPONSE_RESULT_OK) {
                logDebug("Successfully consumed sku: " + sku);
            } else {
                logDebug("Error consuming consuming sku " + sku + ": " + getResponseDesc(response));
                throw new IabException(response, "Error consuming sku " + sku);
            }
        } catch (RemoteException e) {
            throw new IabException(IABHELPER_REMOTE_EXCEPTION, "Remote exception while consuming. PurchaseInfo: " + itemInfo, e);
        }
    }

    /**
     * Asynchronous wrapper to item consumption.
     */
    public void consumeAsync(Purchase purchase, OnConsumeFinishedListener listener) {
        checkNotDisposed();
        checkSetupDone("consume");
        List<Purchase> purchases = new ArrayList<Purchase>();
        purchases.add(purchase);
        consumeAsyncInternal(purchases, listener, null);
    }

    /**
     * Asynchronous wrapper to item consumption. Useful when you have an
     * asynchronous call and don't want to deal with synchronous calls.
     */
    public void consumeAsync(List<Purchase> purchases, OnConsumeMultiFinishedListener listener) {
        checkNotDisposed();
        checkSetupDone("consume");
        if (purchases == null || purchases.size() == 0) return;
        consumeAsyncInternal(purchases, null, listener);
    }

    void consumeAsyncInternal(final List<Purchase> purchases,
                              final OnConsumeFinishedListener singleListener,
                              final OnConsumeMultiFinishedListener multiListener) {
        final Handler handler = new Handler();
        flagStartAsync("consume");
        (new Thread(new Runnable() {
            public void run() {
                final List<IabResult> results = new ArrayList<IabResult>();
                for (Purchase purchase : purchases) {
                    try {
                        consume(purchase);
                        results.add(new IabResult(BILLING_RESPONSE_RESULT_OK, "Successful consume of sku " + purchase.getSku()));
                    } catch (IabException ex) {
                        results.add(new IabResult(ex.getErrorCode(), ex.getMessage()));
                    }
                }

                flagEndAsync();
                if (!mDisposed && singleListener != null) {
                    handler.post(new Runnable() {
                        public void run() {
                            singleListener.onConsumeFinished(purchases.get(0), results.get(0));
                        }
                    });
                }
                if (!mDisposed && multiListener != null) {
                    handler.post(new Runnable() {
                        public void run() {
                            multiListener.onConsumeMultiFinished(purchases, results);
                        }
                    });
                }
            }
        })).start();
    }

    // ─────────────── internal ───────────────

    int queryPurchases(Inventory inv, String itemType) throws JSONException, RemoteException {
        // Query purchases
        logDebug("Querying owned items...");
        logDebug("Package name: " + mContext.getPackageName());
        boolean verificationFailed = false;
        String continueToken = null;

        do {
            logDebug("Calling getPurchases with continuation token: " + continueToken);
            Bundle purchasesBundle = mService.getPurchases(API_VERSION, mContext.getPackageName(), itemType);

            int response = getResponseCodeFromBundle(purchasesBundle);
            logDebug("Owned items response: " + String.valueOf(response));
            if (response != BILLING_RESPONSE_RESULT_OK) {
                logDebug("getPurchases() failed: " + getResponseDesc(response));
                return response;
            }
            if (!purchasesBundle.containsKey(RESPONSE_INAPP_PURCHASE_ITEM_LIST)
                    || !purchasesBundle.containsKey(RESPONSE_INAPP_PURCHASE_DATA_LIST)
                    || !purchasesBundle.containsKey(RESPONSE_INAPP_SIGNATURE_LIST)) {
                logError("Bundle returned from getPurchases() doesn't contain required fields.");
                return IABHELPER_BAD_RESPONSE;
            }

            ArrayList<String> ownedSkus = purchasesBundle.getStringArrayList(
                    RESPONSE_INAPP_PURCHASE_ITEM_LIST);
            ArrayList<String> purchaseDataList = purchasesBundle.getStringArrayList(
                    RESPONSE_INAPP_PURCHASE_DATA_LIST);
            ArrayList<String> signatureList = purchasesBundle.getStringArrayList(
                    RESPONSE_INAPP_SIGNATURE_LIST);

            for (int i = 0; i < purchaseDataList.size(); ++i) {
                String purchaseData = purchaseDataList.get(i);
                String signature = signatureList.get(i);
                String sku = ownedSkus.get(i);
                if (Security.verifyPurchase(mSignatureBase64, purchaseData, signature)) {
                    logDebug("Sku is owned: " + sku);
                    Purchase purchase = new Purchase(itemType, purchaseData, signature);

                    if (TextUtils.isEmpty(purchase.getToken())) {
                        logWarn("BUG: empty/null token for purchase: " + purchase);
                        continue;
                    }

                    inv.addPurchase(purchase);
                } else {
                    logWarn("Purchase signature verification **FAILED**. Not adding purchase.");
                    verificationFailed = true;
                }
            }

            continueToken = purchasesBundle.getString(INAPP_CONTINUATION_TOKEN);
            logDebug("Continuation token: " + continueToken);
        } while (!TextUtils.isEmpty(continueToken));

        return verificationFailed ? IABHELPER_VERIFICATION_FAILED : BILLING_RESPONSE_RESULT_OK;
    }

    int querySkuDetails(String itemType, Inventory inv, List<String> moreSkus)
            throws JSONException, RemoteException {
        logDebug("Querying SKU details.");
        ArrayList<String> skuList = new ArrayList<String>();
        skuList.addAll(inv.getAllOwnedSkus());
        if (moreSkus != null) {
            logDebug("moreSkus: " + moreSkus);
            for (String sku : moreSkus) {
                if (!skuList.contains(sku)) {
                    skuList.add(sku);
                }
            }
        }

        if (skuList.size() == 0) {
            logDebug("queryPrices: nothing to do because there are no SKUs.");
            return BILLING_RESPONSE_RESULT_OK;
        }

        Bundle querySkus = new Bundle();
        querySkus.putStringArrayList(GET_SKU_DETAILS_ITEM_LIST, skuList);
        Bundle skuDetails = mService.getSkuDetails(API_VERSION, mContext.getPackageName(),
                itemType, querySkus);

        if (!skuDetails.containsKey(RESPONSE_GET_SKU_DETAILS_LIST)) {
            int response = getResponseCodeFromBundle(skuDetails);
            if (response != BILLING_RESPONSE_RESULT_OK) {
                logDebug("getSkuDetails() failed: " + getResponseDesc(response));
                return response;
            } else {
                logError("getSkuDetails() returned a bundle with neither an error nor a details list.");
                return IABHELPER_BAD_RESPONSE;
            }
        }

        ArrayList<String> responseList = skuDetails.getStringArrayList(
                RESPONSE_GET_SKU_DETAILS_LIST);

        for (String thisResponse : responseList) {
            SkuDetails d = new SkuDetails(itemType, thisResponse);
            logDebug("Got sku: " + d);
            inv.addSkuDetails(d);
        }
        return BILLING_RESPONSE_RESULT_OK;
    }

    int getResponseCodeFromBundle(Bundle b) {
        Object o = b.get(RESPONSE_CODE);
        if (o == null) {
            logDebug("Bundle with null response code, assuming OK (known issue)");
            return BILLING_RESPONSE_RESULT_OK;
        } else if (o instanceof Integer) return ((Integer) o).intValue();
        else if (o instanceof Long) return (int) ((Long) o).longValue();
        else {
            logError("Unexpected type for bundle response code.");
            logError(o.getClass().getName());
            throw new RuntimeException("Unexpected type for bundle response code: " + o.getClass().getName());
        }
    }

    void logDebug(String msg) {
        if (mDebugLog) Log.d(mDebugTag, "In-app billing helper " + msg);
        else Log.d(TAG, "In-app billing helper " + msg);
    }

    void logError(String msg) {
        Log.e(TAG, "In-app billing error: " + msg);
    }

    void logWarn(String msg) {
        Log.w(TAG, "In-app billing warning: " + msg);
    }

    void checkSetupDone(String operation) {
        if (!mSetupDone) {
            logError("Illegal state for operation (" + operation + "): IAB helper is not set up.");
            throw new IllegalStateException("IAB helper is not set up. Can't perform operation: " + operation);
        }
    }

    // Workaround to bug where sometimes response codes come as Long instead of Integer
    int getResponseCodeFromIntent(Intent i) {
        Object o = i.getExtras().get(RESPONSE_CODE);
        if (o == null) {
            logError("Intent with no response code, assuming OK (known issue)");
            return BILLING_RESPONSE_RESULT_OK;
        } else if (o instanceof Integer) return ((Integer) o).intValue();
        else if (o instanceof Long) return (int) ((Long) o).longValue();
        else {
            logError("Unexpected type for intent response code.");
            logError(o.getClass().getName());
            throw new RuntimeException("Unexpected type for intent response code: " + o.getClass().getName());
        }
    }

    void flagStartAsync(String operation) {
        if (mAsyncInProgress) throw new IllegalStateException("Can't start async operation (" +
                operation + ") because another async operation(" + mAsyncOperation + ") is in progress.");
        mAsyncOperation = operation;
        mAsyncInProgress = true;
        logDebug("Starting async operation: " + operation);
    }

    void flagEndAsync() {
        if (!mAsyncInProgress) logError("End of async operation already reached");
        mAsyncOperation = "";
        mAsyncInProgress = false;
        logDebug("Ending async operation: " + mAsyncOperation);
    }

    /**
     * Returns a human-readable description for the given response code.
     */
    public static String getResponseDesc(int code) {
        String[] iab_msgs = {
                "0: OK",
                "1: User canceled.",
                "2: Unknown (billing service unavailable on device)",
                "3: Billing unavailable",
                "4: Item unavailable",
                "5: Developer error",
                "6: Error",
                "7: Item already owned",
                "8: Item not owned"};

        String[] iabr_msgs = {
                "Error: IABHELPER_ERROR_BASE",
                "Error: IABHELPER_REMOTE_EXCEPTION",
                "Error: IABHELPER_BAD_RESPONSE",
                "Error: IABHELPER_VERIFICATION_FAILED",
                "Error: IABHELPER_SEND_INTENT_FAILED",
                "Error: IABHELPER_INVALID_PURCHASE_RESPONSE",
                "Error: IABHELPER_MISSING_TOKEN",
                "Error: IABHELPER_UNKNOWN_ERROR",
                "Error: IABHELPER_SUBSCRIPTIONS_NOT_AVAILABLE",
                "Error: IABHELPER_INVALID_CONSUMPTION"};

        if (code <= IABHELPER_ERROR_BASE) {
            int index = IABHELPER_ERROR_BASE - code;
            if (index >= 0 && index < iabr_msgs.length) return iabr_msgs[index];
            else return String.valueOf(code) + ": Unknown IAB Helper Error";
        } else if (code >= 0 && code < iab_msgs.length) {
            return iab_msgs[code];
        } else {
            return String.valueOf(code) + ": Unknown Error";
        }
    }
}
