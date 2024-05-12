import * as functionsV2 from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { onMedCreated, onMedDeleted, onMedUpdate } from "../../utils";

export const onWritePrescriptions = functionsV2.firestore.onDocumentCreated(
  "medication/{medicationId}",
  async (event) => {
    const content = event.data;
    if (!content) {
      console.log("oops");
      return;
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

export const onEmptyPrescriptions = functionsV2.firestore.onDocumentUpdated(
  "medication/{medicationId}",
  async (event) => {
    const newValue = event.data?.after.data();
    const oldValue = event.data?.before.data();
    if (!oldValue) {
      return;
    }
    if (newValue?.pills === 0) {
      const response = getDeviceToken([
        newValue?.patientUid,
        newValue?.doctorUid,
      ]).then(async (tokens) => {
        for (const token of tokens) {
          try {
            const isDoc = token.userUid === newValue?.doctorUid;
            let message = onMedUpdate(newValue, token.token,isDoc);
            if (message) {
              const response = await admin.messaging().send(message);
              console.log(`success ${response}`);
            }
          } catch (error) {
            console.error(`Error here: ${error}`);
          }
        }
      });
      return response;
    }
    return null;
  }
);

export const onDeletedPrescriptions = functionsV2.firestore.onDocumentDeleted(
  "medication/{medicationId}",
  async (event) => {
    const oldValue = event.data?.data();
    if (!oldValue) {
      return;
    }
    const response = getDeviceToken([
      oldValue?.patientUid
    ]).then(async (tokens) => {
      for (const token of tokens) {
        try {
          let message = onMedDeleted(oldValue, token.token);
          if (message) {
            const response = await admin.messaging().send(message);
            console.log(`success ${response}`);
          }
        } catch (error) {
          console.error(`Error here: ${error}`);
        }
      }
    });
    return response;
  }
);

export async function getDeviceToken(data: string | string[]) {
  const response = await admin
    .firestore()
    .collection("deviceTokens")
    .where("userUid", data.length > 1 ? "in" : "==", data)
    .get()
    .then(async (snapshot) => {
      const tokens = await snapshot.docs.map((doc) => doc.data());
      return tokens;
    });
  return response;
}
