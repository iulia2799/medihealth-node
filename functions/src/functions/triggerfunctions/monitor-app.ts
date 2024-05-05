import * as functions from "firebase-functions"; //you can choose between v1 and v2, which version supports your needs
import * as admin from "firebase-admin";
import { onChangeAppointments } from "../../utils";

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
