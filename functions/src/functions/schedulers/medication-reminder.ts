import * as functions from "firebase-functions"; //you can choose between v1 and v2, which version supports your needs
import * as admin from "firebase-admin";
import { medicationReminder } from "../../utils";
import { getDailySeconds } from "../../helpers";

export const medScheduler = functions.pubsub
  .schedule("* * * * *")
  .onRun(async () => {
    const firestore = admin.firestore();
    const medicationRefs = firestore.collection("medication");
    const snapshot = await medicationRefs.get().then(async (medicationList) => {
      for (const item of medicationList.docs) {
        const data = item.data();
        const id = item.id;
        const alarms = data.alarms

        const currentTime = getDailySeconds(Date.now());
        console.log(currentTime);
        let index = 0;
        for (let alarm of alarms) {
          index++;
          if (alarm >= currentTime - 60 && alarm <= currentTime) {
            const userFields = [data?.patientUid];

            await firestore
              .collection("deviceTokens")
              .where("userUid", "in", userFields)
              .get()
              .then(async (snapshot) => {
                const tokens = await snapshot.docs.map(
                  (doc) => doc.data().token
                );
                return tokens;
              })
              .then(async (tokens) => {
                for (const token of tokens) {
                  try {
                    let message = medicationReminder(data, token);
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
            let remainingDays = data.days;
            if(index == alarms.length) {
              remainingDays--;
            }
            if(remainingDays === 0) {
              await firestore
              .doc(`medication/${id}`)
              .delete()
              .then(() => console.log("ok"));
            } else {
              const remainingpills = data.pills - data.pillsPerPortion;
              const update: HashMap = {
                days: remainingDays,
                pills: remainingpills,
              };
              await firestore
                .doc(`medication/${id}`)
                .update(update)
                .then(() => console.log("ok"));
            }
            
          }
        }
      }
    });

    return snapshot;
  });
