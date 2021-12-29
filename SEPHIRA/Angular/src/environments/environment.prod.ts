export const environment = {
	production: true,
	siteTitle: 'SEPHIRA', // This is the name displayed in the navigation bar.
	desktopMenuStyle: 'side', // Valid choices: `side`, `top`. Defaults to `side`. Must be exactly `side` for swipe gesture to open/close to work.
	mobileMenuStyle: 'side', // Valid choices: `side`, `top`. Defaults to `side`. Must be exactly `side` for swipe gesture to open/close to work.
	apiServer: '/', // Must have a trailing `/`.
	adminPath: 'admin', // The base subdirectory the user must enter to reach the admin section.
	
	// SHOP SPECIFIC VARIABLES
	enableShop: true, // Enables the shop. Should be the same as the FastAPI ShopSettings.ENABLE setting.
	requireLoggedInToCheckout: true, // Requires the user to be logged in to checkout.
	enableStripe: true, // Enables using Stripe for checkout. Shop and FastAPI StripeSettings.ENABLE must be enabled for this to be used.
	stripePublicKey: 'pk_test_51IhjdIGRCaAvu4C0Vgoif76YwIwRb3ah3IQufMIgoYn5yXfzcfjR3Vek30TdGxjieJjp1InJ79QKnb3nl83f1YUo00vwi7ABJk', // The Stripe public key. Shop and enableStripe must be enabled for this to be used.
	enablePayPal: true, // Enables using PayPal for checkout. Shop and FastAPI PayPalSettings.ENABLE must be enabled for this to be used.
	paypalClientID: 'AWYXNVh-QSGkoNBVUJev6R_mwoIayEfkL6j9xmXnHM5BRYl--OS-Hi_CwHS5747Rc8BjmswVgpMpngrq', // The PayPal client id. Shop and enablePayPal must be enabled for this to be used.
	paypalCurrency: 'USD', // The currency code you would like to use with PayPal. Required here because of how the script is loaded.
	enableCoinbaseCommerce: true, // Enables using Coinbase Commerce for checkout. Shop and FastAPI CoinbaseCommerceSettings.ENABLE must be enabled for this to be used.
	enableNowPayments: true, // Enables using NOWPayments for checkout. Shop and FastAPI NowPaymentSettings.ENABLE must be enabled for this to be used.
	nowPaymentsCheckoutStyle: 'payment', // Valid choices: `payment`, `invoice`. Defaults to `payment`. `payment` keeps the user on the checkout page. `invoice` sends the user to nowpayments.io to complete payment. `invoice` uses less API calls than `payment` so it is technically better for performance, but might inconvience users by requiring they go to an external site to pay.
	nowPaymentsSandbox: true // Should be the same as FastAPI NowPaymentsSetings.SANDBOX. Just enables a dropdown to select the payment case.
};
