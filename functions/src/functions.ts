import { DocumentData, Timestamp } from "firebase-admin/firestore";
import { TokenMessage } from "firebase-admin/lib/messaging/messaging-api";

export function onChangeAppointments(newValue: DocumentData | undefined, oldValue: DocumentData | undefined) {
    var message : TokenMessage = {
        notification: {
            title: `Appointment with ${newValue?.doctorName} at ${newValue?.date} was updated`,
            body: `The appointment details or status might have changed. Please check the appointment for more information.`,
        },
        android: {
            priority: 'high',
        },
        token: ''
    };
    if(!newValue || !oldValue) {
        return message;
    } else {
        if(newValue.accepted !== oldValue.accepted && newValue.accepted) {
            if(message.notification) {
                message.notification.body = `Your appointment with ${newValue.doctorName} at ${convertTimestampToDate(newValue.date)} was accepted.`;
            }
        } else if(convertTimestampToDate(newValue.date) !== convertTimestampToDate(oldValue.date)) {
            if(message.notification) {
                message.notification.body = `Your appointment with ${newValue.doctorName} at ${convertTimestampToDate(oldValue.date)} was rescheduled at ${convertTimestampToDate(newValue.date)}.`;
            }
        }
    }
    return message;
}

export function convertTimestampToDate(timestamp: Timestamp) {
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return date.toString();
}