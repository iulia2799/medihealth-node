import { DocumentData } from "firebase-admin/firestore";
import { TokenMessage } from "firebase-admin/lib/messaging/messaging-api";
import { convertTimestampToDate } from "./helpers";

export function onChangeAppointments(
  newValue: DocumentData | undefined,
  oldValue: DocumentData | undefined,
  isDoc: boolean
) {
  const person = !isDoc ? `dr. ${newValue?.doctorName}` : newValue?.patientName;
  const action = oldValue ? "updated" : "created";
  var message: TokenMessage = {
    notification: {
      title: `Appointment with ${person} was ${action}`,
      body: `Please check the appointment for more information.`,
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
        message.notification.body = `Your appointment with ${person} at ${convertTimestampToDate(
          newValue.date
        )} was accepted.`;
      }
    } else if (newValue.missed && newValue.missed !== oldValue.missed) {
      if (message.notification) {
        message.notification.title = `You missed an appointment!`;
        message.notification.body = `You missed your appointment with ${person} at ${convertTimestampToDate(
          newValue.date
        )}`;
      }
    } else if (
      newValue.date !== oldValue.date &&
      convertTimestampToDate(oldValue.date) !==
        convertTimestampToDate(newValue.date)
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

export function resultNotification(
  value: DocumentData | undefined,
  token: string | undefined
) {
  if (!value) {
    return null;
  }
  var message: TokenMessage = {
    notification: {
      title: `Results ready`,
      body: `Your results from dr. ${value.doctorName} are ready. Please open the application.`,
    },
    android: {
      priority: "high",
    },
    token: token ?? "",
  };
  return message;
}

export function onMedUpdate(
  value: DocumentData | undefined,
  token: string | undefined,
  isDoc: boolean = false
) {
  if (!value) {
    return null;
  }
  const body = !isDoc
    ? `Your prescription of ${value.medicationName} has ran out.`
    : `${value.medicationName} for patient ${value.patientName} has ran out. \n Please update or delete it.`;
  var message: TokenMessage = {
    notification: {
      title: `Prescription removed`,
      body: body,
    },
    android: {
      priority: "high",
    },
    token: token ?? "",
  };
  return message;
}
export function onMedDeleted(
  value: DocumentData | undefined,
  token: string | undefined
) {
  if (!value) {
    return null;
  }
  var message: TokenMessage = {
    notification: {
      title: `Prescription removed`,
      body: `Your prescription of ${value.medicationName} was removed.`,
    },
    android: {
      priority: "high",
    },
    token: token ?? "",
  };
  return message;
}

export function billingNotification(
  value: DocumentData | undefined,
  token: string | undefined
) {
  if (!value) {
    return null;
  }
  var message: TokenMessage = {
    notification: {
      title: `Billing ready`,
      body: `Your bills from dr. ${value.doctorName} are ready. Please open the application.`,
    },
    android: {
      priority: "high",
    },
    token: token ?? "",
  };
  return message;
}

export function onNewPatientNotification(
  value: DocumentData | undefined,
  token: string | undefined
){
  if (!value) {
    return null;
  }
  var message: TokenMessage = {
    notification: {
      title: `New patient assigned.`,
      body: `There is a new patient assigned to you. \n Patient name : ${value.firstName} ${value.lastName}.
      \n You can remove the patient if you want or ignore the notification`,
    },
    android: {
      priority: "high",
    },
    token: token ?? "",
  };
  return message;
}

export function onBootedPatient(
  value: DocumentData | undefined,
  token: string | undefined
){
  if (!value) {
    return null;
  }
  var message: TokenMessage = {
    notification: {
      title: `You were removed from a doctor.`,
      body: `You were removed from your GP. You can modify your profile to get assigned to a new one`,
    },
    android: {
      priority: "high",
    },
    token: token ?? "",
  };
  return message;
}
