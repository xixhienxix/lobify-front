// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appVersion: 'v8.1.8',
  USERDATA_KEY: 'authf649fc9a5f55',
  isMockEnabled: true,
  apiUrl: 'http://localhost:3500',
  //apiUrl: 'https://milobify.com',
  fireBaseStorageSecrets:{
    apiKey: "AIzaSyB3tYq0nD6m4hljK3lfkGmQtqHwm3ssCiU",
    authDomain: "movnext-api.firebaseapp.com",
    projectId: "movnext-api",
    storageBucket: "movnext-api.appspot.com",
    messagingSenderId: "82604568171",
    appId: "1:82604568171:web:21dafcd8a28f1767008b2e",
    databaseURL: "https://movnext-api-default-rtdb.firebaseio.com",
  }
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
