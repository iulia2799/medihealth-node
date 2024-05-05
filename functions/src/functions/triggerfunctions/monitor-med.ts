import * as functionsV2 from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { onMedCreated } from "../../utils";

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
