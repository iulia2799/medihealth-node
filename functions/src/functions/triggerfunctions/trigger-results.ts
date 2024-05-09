import * as functionsV2 from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { resultNotification } from "../../utils";

export const onResults = functionsV2.firestore.onDocumentCreated(
  "resultrecords/{id}",
  async (event) => {
    const content = event.data;
    const UID = content?.data().patientRef;
    const response = await admin
      .firestore()
      .collection("deviceTokens")
      .where("userUid", "==", UID)
      .get()
      .then(async (snapshot) => {
        const tokens = await snapshot.docs.map((doc) => doc.data().token);
        return tokens;
      })
      .then(async (tokens) => {
        for (const token of tokens) {
          try {
            let message = resultNotification(content?.data(), token);
            if (message) {
              const result = await admin.messaging().send(message);
              console.log(`success ${result}`);
            }
          } catch (error) {
            console.error(`Error here: ${error}`);
          }
        }
      });
    return response;
  }
);
