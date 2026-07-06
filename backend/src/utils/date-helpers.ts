import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getCurrentIndianDate = () => {
  return dayjs().tz("Asia/Kolkata");
};

export const getIndianDate = (date?: dayjs.ConfigType) => {
  return dayjs(date).tz("Asia/Kolkata");
};

export const getCurrentDate = () => {
  return getCurrentIndianDate().toDate();
};

export { dayjs };
