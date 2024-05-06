import * as functions from "firebase-functions"; //you can choose between v1 and v2, which version supports your needs
import * as admin from "firebase-admin";
import { onChangeAppointments } from "../../utils";
import { TokenMessage } from "firebase-admin/lib/messaging/messaging-api";

export const monitorAppointments = functions.firestore
  .document("appointments/{appointmentId}")
  .onWrite(async (change, context) => {
    const newValue = change.after.data();
    const oldValue = change.before.data();

    var message: TokenMessage = {
      token: ""
    }
    const userFields = [newValue?.patientUid, newValue?.doctorUid];
    const response = await admin
      .firestore()
      .collection("deviceTokens")
      .where("userUid", "in", userFields)
      .get()
      .then(async (snapshot) => {
        //const tokens = await snapshot.docs.map((doc) => doc.data().token);
        return snapshot.docs;
      })
      .then(async (tokens) => {
        for (const token of tokens) {
          try {
            if(token.data().userUid === newValue?.patientUid){
              message = onChangeAppointments(newValue,oldValue,false);
            } else {
              message = onChangeAppointments(newValue,oldValue,true);
            }
            message.token = token.data().token;
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
