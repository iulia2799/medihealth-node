import * as functionsV2 from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { onBootedPatient, onNewPatientNotification } from "../../utils";

export const onNewPatient = functionsV2.firestore.onDocumentUpdated(
  "patients/{id}",
  async (event) => {
    const data = event.data?.after;
    const doctor = data?.data().doctorUid;
    if(event.data?.before.data().doctorUid === doctor) {
        return;
    }
    if(doctor === "" && event.data?.before.data().doctorUid !== "") {
        console.log("BOOT")
        const response = await admin
        .firestore()
        .collection("deviceTokens")
        .where("userUid", "==", event.params.id)
        .get()
        .then(async (snapshot) => {
          const tokens = await snapshot.docs.map((document) => document.data().token);
          return tokens;
        }).then(async (tokens) => {
          for (const token of tokens) {
              try {
                let message = onBootedPatient(data?.data(), token);
                if (message) {
                  const result = await admin.messaging().send(message);
                  console.log(`success ${result}`);
                }
              } catch (error) {
                console.error(`Error here: ${error}`);
              }
            }
        }).finally(() => console.log("job done successfully"));
        return response;
    } else {
        const response = await admin
        .firestore()
        .collection("deviceTokens")
        .where("userUid", "==", doctor)
        .get()
        .then(async (snapshot) => {
          const tokens = await snapshot.docs.map((document) => document.data().token);
          return tokens;
        }).then(async (tokens) => {
          for (const token of tokens) {
              try {
                let message = onNewPatientNotification(data?.data(), token);
                if (message) {
                  const result = await admin.messaging().send(message);
                  console.log(`success ${result}`);
                }
              } catch (error) {
                console.error(`Error here: ${error}`);
              }
            }
        }).finally(() => console.log("job done successfully"));
        return response;
    }
  }
);
