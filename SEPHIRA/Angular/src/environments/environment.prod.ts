export const environment = {
	production: true,
	siteTitle: 'SEPHIRA', // This is the name displayed in the navigation bar
	desktopMenuStyle: 'side', // Valid choices: 'side', 'top'. Defaults to 'side'. Must be exactly 'side' for swipe gesture to open/close to work
	mobileMenuStyle: 'side', // Valid choices: 'side', 'top'. Defaults to 'side'. Must be exactly 'side' for swipe gesture to open/close to work
	apiServer: 'http://127.0.0.1:8000/', // Must have a trailing '/'

	adminPath: 'admin', // The base subdirectory the user must enter to reach the admin section
	enableShop: true // Enables the shop. Should be the same as the FastAPI ShopSettings.ENABLE setting
};
