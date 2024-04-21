import { Timestamp } from "firebase-admin/firestore";

export function convertTimestampToDate(timestamp: Timestamp) {
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  return date.toString();
}

export function getDailySeconds(date: number) {
  return Math.floor((date % (1000 * 60 * 60 * 24)) / 1000);
}
