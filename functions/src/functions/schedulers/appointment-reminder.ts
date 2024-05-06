import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getDailySeconds } from "../../helpers";
import { Timestamp } from "firebase-admin/firestore";
import { remindAppointment } from "../../utils";
import {logger} from "firebase-functions";

export const appointmentReminder = onSchedule("*/15 * * * *", async () => {
  const firestore = admin.firestore();
  console.log("please")
  const appointments = firestore.collection("appointments");
  const snapshot = await appointments.get().then(async (list) => {
    for (const item of list.docs) {
      const data = item.data();

      const currentTime = getDailySeconds(Date.now());
      console.log(currentTime);
      const timestamp = data.date as Timestamp;

      if (
        currentTime - 1200 < timestamp.seconds &&
        timestamp.seconds < currentTime
      ) {
        await firestore
          .collection("deviceTokens")
          .where("patientUid", "==", data.patientUid)
          .get()
          .then(async (snapshot: { docs: any[]; }) => {
            const tokens = await snapshot.docs.map((doc: { data: () => { (): any; new(): any; token: any; }; }) => doc.data().token);
            return tokens;
          })
          .then(async (tokens) => {
            for (const token of tokens) {
              try {
                let message = remindAppointment(data, token);
                if (message) {
                  const response = await admin.messaging().send(message);
                  console.log(`success ${response}`);
                }
              } catch (error) {
                console.error(`Error here: ${error}`);
              }
            }
          })
          .finally(() => console.log("job done"));
      }
    }
  });
  logger.log("User cleanup finished");
  return snapshot;
});
