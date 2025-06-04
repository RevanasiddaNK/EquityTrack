import moment from "moment-timezone";

export const isMarketOpen = () => {
  const now = moment.tz("Asia/Kolkata"); // Current time in Indian Standard Time (IST)
  const dayOfWeek = now.day(); // 0 (Sunday) to 6 (Saturday)
  const hour = now.hour();
  const minute = now.minute();

  // Regular trading hours: Monday to Friday, 9:15 AM to 3:30 PM IST
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
  const isDuringHours =
    (hour > 9 || (hour === 9 && minute >= 15)) && (hour < 15 || (hour === 15 && minute < 30)); // 9:15 AM to 3:30 PM

  return (isWeekday && isDuringHours);
};