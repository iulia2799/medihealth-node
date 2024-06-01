import * as functions from "firebase-functions/v2"; //you can choose between v1 and v2, which version supports your needs
import * as admin from "firebase-admin";

export const onBillingCreated = functions.firestore.onDocumentCreated(
  "billingCollection/{documentId}",
  async (event) => {
    const content = event.data;
    if (!content) {
      console.log("oops");
    }
    const files = content?.data().files;
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
      .finally(() => console.log("clean done."));

    return found;
  }
);
