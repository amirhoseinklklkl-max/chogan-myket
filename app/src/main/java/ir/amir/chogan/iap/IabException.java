package ir.amir.chogan.iap;

/**
 * Exception thrown when something goes wrong with in-app billing (TrivialDrive).
 */
public class IabException extends Exception {
    private final int mError;

    public IabException(int error, String message) {
        this(error, message, null);
    }

    public IabException(int error, String message, Exception cause) {
        super(message, cause);
        mError = error;
    }

    public int getErrorCode() { return mError; }
}
