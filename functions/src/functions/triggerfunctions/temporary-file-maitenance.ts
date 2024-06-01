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
    const storage = "tempFiles";
    const response = await admin
      .firestore()
      .collection(storage)
      .where("fileUrl", "==", data.fileRefStorageUrl)
      .get()
      .then(async (results) => {
        for (const item of results.docs) {
          await admin.firestore().collection("tempFiles").doc(item.id).delete();
        }
      }).then(async () => {
        if(data.optionalFiles) {
          const found = await admin
          .firestore()
          .collection(storage)
          .where("fileUrl", "in", data.optionalFiles)
          .get()
          .then(async (results) => {
            for (const item of results.docs) {
              await admin
                .firestore()
                .collection(storage)
                .doc(item.id)
                .delete();
            }
          })
          .finally(() => console.log("clean done."));
          return found;
        }
      })
      .finally(() => console.log("clean done."));
    return response;
  }
);
