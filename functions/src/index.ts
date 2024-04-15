/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

//import {onRequest} from "firebase-functions/v2/https";
//import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import * as functions from 'firebase-functions'; //you can choose between v1 and v2, which version supports your needs
import * as admin from 'firebase-admin';

type Indexable = { [key: string]: any };

admin.initializeApp();

export const helloWorld = functions.https.onRequest((request, response) => {
    const name = request.params[0].replace('/', '');
    const items: Indexable = { lamp: 'This is a lamp', chair: 'Nice chair' };
    const message = items[name];
    response.send(`<h1>${message}</h1>`);
});

export const monitorAppointments = functions.firestore.document("appointments/{appointmentId}").onWrite((change,context) => {
    const newValue = change.after.data();
    const oldValue = change.before.data();

    console.log("appointment updated", context.params.appointmentId);
    console.log(newValue);
    console.log(oldValue);
    return null;
});

//todo

//> npm run build && firebase emulators:start --only firestore


//> build
//> tsc

//i  emulators: Shutting down emulators.

//Error: Could not spawn `java -version`. Please make sure Java is installed and on your system PATH.