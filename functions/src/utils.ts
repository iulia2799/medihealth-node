import { DocumentData } from "firebase-admin/firestore";
import { TokenMessage } from "firebase-admin/lib/messaging/messaging-api";
import { convertTimestampToDate } from "./helpers";

export function onChangeAppointments(
  newValue: DocumentData | undefined,
  oldValue: DocumentData | undefined,
  isDoc: boolean
) {
  const person = isDoc ? `dr. ${newValue?.doctorName}` : newValue?.patientName;
  var message: TokenMessage = {
    notification: {
      title: `Appointment with ${person} was updated`,
      body: `The appointment details or status might have changed. Please check the appointment for more information.`,
    },
    android: {
      priority: "high",
    },
    token: "",
  };
  if (!newValue || !oldValue) {
    return message;
  } else {
    if (newValue.accepted !== oldValue.accepted && newValue.accepted) {
      if (message.notification) {
        message.notification.body = `Your appointment with dr. ${person} at ${convertTimestampToDate(
          newValue.date
        )} was accepted.`;
      }
    } else if (
      convertTimestampToDate(newValue.date) !==
      convertTimestampToDate(oldValue.date)
    ) {
      if (message.notification) {
        message.notification.body = `Your appointment with ${person} at ${convertTimestampToDate(
          oldValue.date
        )} was rescheduled at ${convertTimestampToDate(newValue.date)}.`;
      }
    }
  }
  return message;
}

export function medicationReminder(
  value: DocumentData | undefined,
  token: string | undefined
) {
  if (!value) {
    return null;
  }
  var message: TokenMessage = {
    notification: {
      title: `It is time to take ${value.medicationName} !`,
      body: `${value.description} \n ${value.frequency} \n ${value.pills} pills left`,
    },
    android: {
      priority: "high",
    },
    token: token ?? "",
  };
  return message;
}

export function onMedCreated(
  value: DocumentData | undefined,
  token: string | undefined
) {
  if (!value) {
    return null;
  }
  var message: TokenMessage = {
    notification: {
      title: `Your doctor added a new prescription: ${value.medicationName} !`,
      body: `Please set your reminders as soon as possible ! \n ${value.description} \n Frequency: ${value.frequency} \n ${value.pills} pills.`,
    },
    android: {
      priority: "high",
    },
    token: token ?? "",
  };
  return message;
}

export function remindAppointment(
  value: DocumentData | undefined,
  token: string | undefined
) {
  if (!value) {
    return null;
  }
  var message: TokenMessage = {
    notification: {
      title: `Appointment reminder`,
      body: `Appointment with ${value?.doctorName} at ${convertTimestampToDate(
        value?.date
      )} will be in the next 30 minutes.`,
    },
    android: {
      priority: "high",
    },
    token: token ?? "",
  };
  return message;
}
