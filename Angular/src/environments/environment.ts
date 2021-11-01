// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
	production: false,
	apiServer: 'http://localhost:8000/api/',
	socketServer: 'ws://localhost:8000',
	recaptchaSiteKey: '6LdBXmkbAAAAAAwnoEjHhrMJUQY5mbisqB7clk_f',
	stripePublicKey: 'pk_test_51IhjdIGRCaAvu4C0Vgoif76YwIwRb3ah3IQufMIgoYn5yXfzcfjR3Vek30TdGxjieJjp1InJ79QKnb3nl83f1YUo00vwi7ABJk',
	paypalClientID: 'AWYXNVh-QSGkoNBVUJev6R_mwoIayEfkL6j9xmXnHM5BRYl--OS-Hi_CwHS5747Rc8BjmswVgpMpngrq',
	gtmId: 'GTM-TVH69P6',
	defaultTitle: 'SEPHIRA'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
