import { Timestamp } from "firebase-admin/firestore";

export function convertTimestampToDate(timestamp: Timestamp) {
  return timestamp.toDate();
}

export function getDailySeconds(date: number) {
  return Math.floor((date % (1000 * 60 * 60 * 24)) / 1000);
}