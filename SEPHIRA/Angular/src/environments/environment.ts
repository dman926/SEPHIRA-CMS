// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
	production: false,
	siteTitle: 'SEPHIRA', // This is the name displayed in the navigation bar
	desktopMenuStyle: 'side', // Valid choices: `side`, `top`. Defaults to `side`. Must be exactly `side` for swipe gesture to open/close to work
	mobileMenuStyle: 'side', // Valid choices: `side`, `top`. Defaults to `side`. Must be exactly `side` for swipe gesture to open/close to work
	apiServer: 'http://127.0.0.1:8000/', // Must have a trailing `/`
	adminPath: 'admin', // The base subdirectory the user must enter to reach the admin section

	// RATE LIMITING VARIABLES
	enableRateLimiter: true,
	rateLimitTime: 1000, // The max amount of time to remember each request
	rateLimitMax: 25, // The max amount of requests per `rateLimitTime` ms
	rateLimitMessage: 'You are requesting too fast, please wait a second before refreshing', // The message to display when `rateLimitMax` requests/`rateLimitTime` ms is exceeded
	
	// SHOP SPECIFIC VARIABLES
	enableShop: true, // Enables the shop. Should be the same as the FastAPI ShopSettings.ENABLE setting
	requireLoggedInToCheckout: true, // Requires the user to be logged in to checkout.
	enableStripe: true, // Enables using Stripe for checkout. Shop and FastAPI StripeSettings.ENABLE must be enabled for this to be used.
	stripePublicKey: 'pk_test_51IhjdIGRCaAvu4C0Vgoif76YwIwRb3ah3IQufMIgoYn5yXfzcfjR3Vek30TdGxjieJjp1InJ79QKnb3nl83f1YUo00vwi7ABJk', // The Stripe public key. Shop and enableStripe must be enabled for this to be used
	enablePayPal: true, // Enables using PayPal for checkout. Shop and FastAPI PayPalSettings.ENABLE must be enabled for this to be used.
	paypalClientID: 'AWYXNVh-QSGkoNBVUJev6R_mwoIayEfkL6j9xmXnHM5BRYl--OS-Hi_CwHS5747Rc8BjmswVgpMpngrq', // The PayPal client id. Shop and enablePayPal must be enabled for this to be used
	paypalCurrency: 'USD', // The currency code you would like to use with PayPal. Required here because of how the script is loaded
	enableCoinbaseCommerce: true // enableStripe: true, // Enables using Coinbase Commerce for checkout. Shop and FastAPI CoinbaseCommerceSettings.ENABLE must be enabled for this to be used.
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
