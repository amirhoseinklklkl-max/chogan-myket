package ir.amir.chogan.iap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Represents a block of information about in-app items (TrivialDrive).
 */
public class Inventory {
    Map<String, SkuDetails> mSkuMap = new HashMap<String, SkuDetails>();
    Map<String, Purchase> mPurchaseMap = new HashMap<String, Purchase>();

    Inventory() { }

    /** Returns the listing details for an in-app product. */
    public SkuDetails getSkuDetails(String sku) { return mSkuMap.get(sku); }

    /** Returns purchase information for a given product, or null if there is no purchase. */
    public Purchase getPurchase(String sku) { return mPurchaseMap.get(sku); }

    /** Returns whether or not there exists a purchase of the given product. */
    public boolean hasPurchase(String sku) { return mPurchaseMap.containsKey(sku); }

    /** Return whether or not details about the given product are available. */
    public boolean hasDetails(String sku) { return mSkuMap.containsKey(sku); }

    /** Erase all values (destructively). */
    public void erase() {
        mSkuMap.clear();
        mPurchaseMap.clear();
    }

    public List<String> getAllOwnedSkus() { return new ArrayList<String>(mPurchaseMap.keySet()); }

    public List<Purchase> getAllPurchases() { return new ArrayList<Purchase>(mPurchaseMap.values()); }

    void addSkuDetails(SkuDetails d) { mSkuMap.put(d.getSku(), d); }

    void addPurchase(Purchase p) { mPurchaseMap.put(p.getSku(), p); }
}
