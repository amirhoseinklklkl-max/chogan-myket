/*
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Interface (AIDL) to the Myket In-app Billing service.
 * این فایل استاندارد سرویس پرداخت درون‌برنامه‌ای (نسخهٔ ۳) است که مایکت
 * نیز طبق مستندات رسمی خود از آن استفاده می‌کند. سرویسِ مرتبط در برنامهٔ
 * مایکت با نام پکیج ir.mservices.market اجرا می‌شود.
 */
package com.android.vending.billing;

import android.os.Bundle;

interface IInAppBillingService {
    /**
     * Checks support for the intended billing API version and product type.
     */
    int isBillingSupported(int apiVersion, String packageName, String type);

    /**
     * Returns details of the requested SKUs in "DETAILS_LIST" of the returned Bundle.
     */
    Bundle getSkuDetails(int apiVersion, String packageName, String type, in Bundle skusBundle);

    /**
     * Returns a pending intent to launch the purchase flow.
     */
    Bundle getBuyIntent(int apiVersion, String packageName, String sku, String type, String developerPayload);

    /**
     * Returns owned purchases of the user.
     */
    Bundle getPurchases(int apiVersion, String packageName, String type);

    /**
     * Consumes the given purchase token.
     */
    int consumePurchase(int apiVersion, String packageName, String purchaseToken);
}
