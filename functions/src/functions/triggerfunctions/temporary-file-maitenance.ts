import * as functionsV2 from "firebase-functions/v2";
import * as admin from "firebase-admin";

export const cleanTempData = functionsV2.firestore.onDocumentCreated(
  "resultrecords/{id}",
  async (event) => {
    console.log("please work")
    const data = event?.data?.data();
    if (!data) {
      return;
    }
    const response = await admin
      .firestore()
      .collection("tempFiles")
      .where("fileUrl", "==", data.fileRefStorageUrl)
      .get()
      .then(async (results) => {
        for (const item of results.docs) {
          await admin.firestore().collection("tempFiles").doc(item.id).delete();
        }
      })
      .finally(() => console.log("clean done."));
    return response;
  }
);
