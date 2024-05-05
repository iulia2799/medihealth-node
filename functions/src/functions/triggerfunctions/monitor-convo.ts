import * as functionsV2 from "firebase-functions/v2";
import * as admin from "firebase-admin";

export const onNewConversation = functionsV2.firestore.onDocumentCreated(
  "convolist/{conversationId}",
  async (event) => {
    const content = event.data;
    if (!content) {
      console.log("oops");
    }
    const messageRef = `convolist/${event.params.conversationId}`;
    const doc = admin.firestore().doc(messageRef);
    const response = await admin
      .firestore()
      .collection("convolist")
      .doc(event.params.conversationId)
      .update({
        messagesRef: doc,
      })
      .then(() => {
        console.log("success");
      });
    return response;
  }
);
