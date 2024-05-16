import * as admin from "firebase-admin";
import { medScheduler } from "./functions/schedulers/medication-reminder";
import { monitorAppointments } from "./functions/triggerfunctions/monitor-app";
import {
  onDeletedPrescriptions,
  onEmptyPrescriptions,
  onWritePrescriptions,
} from "./functions/triggerfunctions/monitor-med";
import { onNewConversation } from "./functions/triggerfunctions/monitor-convo";
import { appointmentReminder } from "./functions/schedulers/appointment-reminder";
import { onResults } from "./functions/triggerfunctions/trigger-results";
import { cleanTempData } from "./functions/triggerfunctions/temporary-file-maitenance";

admin.initializeApp();

export { medScheduler };
export { monitorAppointments };
export { onWritePrescriptions };
export { onNewConversation };
export { appointmentReminder };
export { onResults };
export { onEmptyPrescriptions };
export { onDeletedPrescriptions };
export { cleanTempData };

//test functions

// export const search = functions.https.onRequest((data, response) => {
//   // Get a reference to your Firestore collection
//   const collectionRef = admin.firestore().collection("adresses");

//   // Create a query to search for documents where the "address" field contains the searchTerm (case-insensitive)
//   const query = collectionRef.where("address", "array-contains", "resita");

//   return query
//     .get()
//     .then((querySnapshot) => {
//       // Loop through the documents in the query snapshot
//       let matchingDocs: any[] = [];
//       querySnapshot.forEach((doc) => {
//         console.log(doc.data());
//         matchingDocs.push(doc.data());
//       });
//       response.send(matchingDocs);
//       return matchingDocs;
//     })
//     .catch((error) => {
//       console.log("Error searching Firestore:", error);
//       return error;
//     });
// });

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
