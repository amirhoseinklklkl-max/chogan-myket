package ir.amir.chogan.iap;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Represents an in-app product's listing details (TrivialDrive).
 */
public class SkuDetails {
    private final String mItemType;
    private final String mSku;
    private final String mType;
    private final String mPrice;
    private final String mTitle;
    private final String mDescription;
    private final String mJson;

    public SkuDetails(String itemType, String jsonSkuDetails) throws JSONException {
        mItemType = itemType;
        mJson = jsonSkuDetails;
        JSONObject o = new JSONObject(mJson);
        mSku = o.optString("productId");
        mType = o.optString("type");
        mPrice = o.optString("price");
        mTitle = o.optString("title");
        mDescription = o.optString("description");
    }

    public String getSku() { return mSku; }
    public String getType() { return mType; }
    public String getPrice() { return mPrice; }
    public String getTitle() { return mTitle; }
    public String getDescription() { return mDescription; }

    @Override
    public String toString() { return "SkuDetails:" + mJson; }
}
