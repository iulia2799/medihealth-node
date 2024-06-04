import * as functions from "firebase-functions/v2"; //you can choose between v1 and v2, which version supports your needs
import * as admin from "firebase-admin";
import { billingNotification } from "../../utils";

export const onBillingCreated = functions.firestore.onDocumentCreated(
  "billingCollection/{documentId}",
  async (event) => {
    const content = event.data;
    if (!content) {
      console.log("oops");
    }
    const files = content?.data().files;
    const patientRef = content?.data().patientUid;
    const temporaryStorage = "BILLINGS";
    const found = await admin
      .firestore()
      .collection(temporaryStorage)
      .where("fileUrl", "in", files)
      .get()
      .then(async (results) => {
        for (const item of results.docs) {
          await admin
            .firestore()
            .collection(temporaryStorage)
            .doc(item.id)
            .delete();
        }
      })
      .then(async () => {
        await admin
          .firestore()
          .collection("deviceTokens")
          .where("userUid", "==", patientRef)
          .get()
          .then(async (snapshot) => {
            const tokens = await snapshot.docs.map((doc) => doc.data().token);
            return tokens;
          })
          .then(async (tokens) => {
            for (const token of tokens) {
              try {
                let message = billingNotification(content?.data(), token);
                if (message) {
                  const result = await admin.messaging().send(message);
                  console.log(`success ${result}`);
                }
              } catch (error) {
                console.error(`Error here: ${error}`);
              }
            }
          });
      })
      .finally(() => console.log("clean done."));

    return found;
  }
);
