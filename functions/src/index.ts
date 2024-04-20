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

import * as functions from "firebase-functions"; //you can choose between v1 and v2, which version supports your needs
import * as admin from "firebase-admin";
import { onChangeAppointments } from "./functions";

//type Indexable = { [key: string]: any };

admin.initializeApp();

// export const helloWorld = functions.https.onRequest((request, response) => {
//     const name = request.params[0].replace('/', '');
//     const items: Indexable = { lamp: 'This is a lamp', chair: 'Nice chair' };
//     const message = items[name];
//     response.send(`<h1>${message}</h1>`);
// });

export const monitorAppointments = functions.firestore
  .document('appointments/{appointmentId}')
  .onWrite(async (change, context) => {
    const newValue = change.after.data();
    const oldValue = change.before.data();

    console.log('appointment updated', context.params.appointmentId);
    console.log(newValue);
    console.log(oldValue);

    const message = onChangeAppointments(newValue, oldValue);
    console.log(newValue?.date);

    const userFields = [newValue?.patientUid, newValue?.doctorUid];
    const response = await admin
      .firestore()
      .collection('deviceTokens')
      .where('userUid', 'in', userFields)
      .get()
      .then(async (snapshot) => {
        const tokens = await snapshot.docs.map((doc) => doc.data().token);
        return tokens;
      })
      .then(async (tokens) => {
        for (const token of tokens) {
          try {
            message.token = token;
            console.log(token);
            const response = await admin.messaging().send(message);
            console.log(`success ${response}`);
          } catch (error) {
            console.error(`Error here: ${error}`);
          }
        }
      });
    return response;
  });

// export const scheduler = functions.pubsub.schedule('* * * * *').onRun(async () => {
//     const firestore = admin.firestore();
//     const medicationRefs = firestore.collection('medication');
//     const snapshot = await medicationRefs.get();
//     const medicationList = snapshot.docs;
//     const currentTime = Date.now();
//     console.log(currentTime)

//     for(const item of medicationList) {
//         const data = item.data();
//         const name = data.medicationName;
//         const alarms = data.alarms;
//         for(let alarm of alarms) {
//             if(alarm >= currentTime) {
//                 console.log(`send notification ${name}`);
//             }
//         }
//     }
//     return snapshot;
// });

export const scheduler = functions.pubsub.schedule('* * * * *').onRun(async () => {
    console.log('i am here');
    return null;
})

// todo

// send notifications

// >  appointment updated yxElwh5RLHrIeW37ubvq
// >  {
// >    patientUid: 'f90dsf7d9s0',
// >    doctorUid: 'fdfs9fd',
// >    date: Timestamp { _seconds: 1713367783, _nanoseconds: 237000000 },
// >    accepted: false
// >  }
// >  {
// >    patientUid: 'f90dsf7d9s0',
// >    doctorUid: 'fdfs9fd',
// >    date: Timestamp { _seconds: 1713367783, _nanoseconds: 237000000 },
// >    accepted: true
// >  }
// >  success [object Promise]
// i  functions: Finished "us-central1-monitorAppointments" in 622.3312ms
// >  D:\medihealth-node\functions\node_modules\firebase-admin\lib\utils\error.js:254
// >          return new FirebaseMessagingError(error);
// >                 ^
// >
// >  FirebaseMessagingError: Requested entity was not found.
// >      at FirebaseMessagingError.fromServerError (D:\medihealth-node\functions\node_modules\firebase-admin\lib\utils\error.js:254:16)
// >      at createFirebaseError (D:\medihealth-node\functions\node_modules\firebase-admin\lib\messaging\messaging-errors-internal.js:35:47)
// >      at D:\medihealth-node\functions\node_modules\firebase-admin\lib\messaging\messaging-api-request-internal.js:79:75
// >      at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
// >    errorInfo: {
// >      code: 'messaging/registration-token-not-registered',
// >      message: 'Requested entity was not found.'
// >    },
// >    codePrefix: 'messaging'
// >  }
// >
