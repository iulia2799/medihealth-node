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
import * as functionsV2 from "firebase-functions/v2";
import * as admin from "firebase-admin";
import {
  medicationReminder,
  onChangeAppointments,
  onMedCreated,
} from "./functions";
import { getDailySeconds } from "./helpers";

//type Indexable = { [key: string]: any };

admin.initializeApp();

// export const helloWorld = functions.https.onRequest((request, response) => {
//     const name = request.params[0].replace('/', '');
//     const items: Indexable = { lamp: 'This is a lamp', chair: 'Nice chair' };
//     const message = items[name];
//     response.send(`<h1>${message}</h1>`);
// });

export const monitorAppointments = functions.firestore
  .document("appointments/{appointmentId}")
  .onWrite(async (change, context) => {
    const newValue = change.after.data();
    const oldValue = change.before.data();

    const message = onChangeAppointments(newValue, oldValue);

    const userFields = [newValue?.patientUid, newValue?.doctorUid];
    const response = await admin
      .firestore()
      .collection("deviceTokens")
      .where("userUid", "in", userFields)
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

export const scheduler = functions.pubsub
  .schedule("* * * * *")
  .onRun(async () => {
    const firestore = admin.firestore();
    const medicationRefs = firestore.collection("medication");
    const snapshot = await medicationRefs.get().then(async (medicationList) => {
      for (const item of medicationList.docs) {
        const data = item.data();
        const id = item.id;
        const alarms = data.alarms;

        const currentTime = getDailySeconds(Date.now());
        console.log(currentTime);

        for (let alarm of alarms) {
          if (alarm >= currentTime - 60 && alarm <= currentTime) {
            const userFields = [data?.patientUid];

            await firestore
              .collection("deviceTokens")
              .where("userUid", "in", userFields)
              .get()
              .then(async (snapshot) => {
                const tokens = await snapshot.docs.map(
                  (doc) => doc.data().token
                );
                return tokens;
              })
              .then(async (tokens) => {
                for (const token of tokens) {
                  try {
                    let message = medicationReminder(data, token);
                    if (message) {
                      const response = await admin.messaging().send(message);
                      console.log(`success ${response}`);
                    }
                  } catch (error) {
                    console.error(`Error here: ${error}`);
                  }
                }
              })
              .finally(() => console.log("job done"));
            const remainingDays = data.days - 1;
            const remainingpills = data.pills - data.pillsPerPortion;
            const update: HashMap = {
              days: remainingDays,
              pills: remainingpills,
            };
            await firestore
              .doc(`medication/${id}`)
              .update(update)
              .then(() => console.log("ok"));
          }
        }
      }
    });

    return snapshot;
  });

export const onWritePrescriptions = functionsV2.firestore.onDocumentCreated(
  "medication/{medicationId}",
  async (event) => {
    const content = event.data;
    if (!content) {
      console.log("oops");
    }
    const data = content?.data();
    const response = await admin
      .firestore()
      .collection("deviceTokens")
      .where("userUid", "==", data?.patientUid)
      .get()
      .then(async (snapshot) => {
        const tokens = await snapshot.docs.map((doc) => doc.data().token);
        return tokens;
      })
      .then(async (tokens) => {
        for (const token of tokens) {
          try {
            let message = onMedCreated(data, token);
            if (message) {
              const response = await admin.messaging().send(message);
              console.log(`success ${response}`);
            }
          } catch (error) {
            console.error(`Error here: ${error}`);
          }
        }
      })
      .finally(() => console.log("job done med"));
    return response;
  }
);

export const onNewConversation = functionsV2.firestore.onDocumentCreated(
  "convolist/{conversationId}",
  async (event) => {
    const content = event.data;
    if (!content) {
      console.log("oops");
    }
    const messageRef = `convolist/${event.params.conversationId}`;
    const doc = admin.firestore().doc(messageRef);
    const response = await admin
      .firestore()
      .collection("convolist")
      .doc(event.params.conversationId)
      .update({
        messageRef: doc,
      })
      .then(() => {
        console.log("success");
      });
    return response;
  }
);

// export const getDocs = functions.firestore
//   .document("appointments/{appointmentId}")
//   .onWrite(async () => {
//     const firestore = admin.firestore();
//     const medicationRefs = firestore.collection("medication");
//     const snapshot = await medicationRefs.get().then(async (medicationList) => {
//       for (const item of medicationList.docs) {
//         const data = item.data();
//         const id = item.id;
//         const alarms = data.alarms;

//         const currentTime = getDailySeconds(Date.now());
//         console.log(currentTime);

//         for (let alarm of alarms) {
//           if (alarm >= currentTime - 60 && alarm <= currentTime) {
//             const userFields = [data?.patientUid];

//             await firestore
//               .collection("deviceTokens")
//               .where("userUid", "in", userFields)
//               .get()
//               .then(async (snapshot) => {
//                 const tokens = await snapshot.docs.map(
//                   (doc) => doc.data().token
//                 );
//                 return tokens;
//               })
//               .then(async (tokens) => {
//                 for (const token of tokens) {
//                   try {
//                     let message = medicationReminder(data, token);
//                     if (message) {
//                       const response = await admin.messaging().send(message);
//                       console.log(`success ${response}`);
//                     }
//                   } catch (error) {
//                     console.error(`Error here: ${error}`);
//                   }
//                 }
//               })
//               .finally(() => console.log("job done"));
//             const remainingDays = data.days - 1;
//             const remainingpills = data.pills - data.pillsPerPortion;
//             const update: HashMap = {
//               days: remainingDays,
//               pills: remainingpills,
//             };
//             await firestore
//               .doc(`medication/${id}`)
//               .update(update)
//               .then(() => console.log("ok"));
//           }
//         }
//       }
//     });

//     return snapshot;
//   });

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
