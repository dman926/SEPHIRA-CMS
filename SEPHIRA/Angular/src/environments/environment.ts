// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
	production: false,
	siteTitle: 'SEPHIRA', // This is the name displayed in the navigation bar
	desktopMenuStyle: 'side', // Valid choices: 'side', 'top'. Defaults to 'side'. Must be exactly 'side' for swipe gesture to open/close to work
	mobileMenuStyle: 'side', // Valid choices: 'side', 'top'. Defaults to 'side'. Must be exactly 'side' for swipe gesture to open/close to work
	apiServer: 'http://127.0.0.1:8000/', // Must have a trailing '/'
	adminPath: 'admin' // The base subdirectory the user must enter to reach the admin section
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
