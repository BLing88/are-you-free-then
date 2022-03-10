import { intervalIsLessThan } from "./time-intervals";

export function getDateFromDateString(str: string): number {
  return +str.slice(-2);
}

const dayFromDateMemo = new Map();
export function getDayFromDate(str: string): number {
  if (dayFromDateMemo.has(str)) {
    return dayFromDateMemo.get(str);
  }

  dayFromDateMemo.set(
    str,
    new Date(+str.slice(0, 4), +str.slice(5, 7) - 1, +str.slice(-2)).getDay()
  );
  return dayFromDateMemo.get(str);
}

export function getMonthFromDate(str: string): number {
  return +str.slice(5, 7) - 1;
}

export function getYearFromDate(str: string): number {
  return +str.slice(0, 4);
}

const timeFromDateMemo = new Map();
export function getTimeFromDate(str: string): number {
  if (timeFromDateMemo.has(str)) return timeFromDateMemo.get(str);

  const date = new Date(+str.slice(0, 4), +str.slice(5, 7) - 1, +str.slice(-2));
  date.setHours(3, 0, 0);
  timeFromDateMemo.set(str, date.getTime());

  return timeFromDateMemo.get(str);
}

export const formatDate = (date: Date): string =>
  `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

export const initializeFreeTimes = (freeTimesDataset: string) => {
  JSON.parse(freeTimesDataset)
    .map(
      ({ start_time, end_time }: { start_time: string; end_time: string }) => ({
        start_time: new Date(start_time),
        end_time: new Date(end_time),
      })
    )
    .sort(
      (
        { start_time: startTimeA, end_time: endTimeA },
        { start_time: startTimeB, end_time: endTimeB }
      ) => {
        if (startTimeA.toISOString() < startTimeB.toISOString()) {
          return -1;
        }
        if (startTimeA.toISOString() > startTimeB.toISOString()) {
          return 1;
        }
        if (
          intervalIsLessThan(
            startTimeA.toISOString(),
            endTimeA.toISOString(),
            startTimeB.toISOString(),
            endTimeB.toISOString()
          )
        ) {
          return -1;
        } else {
          return 1;
        }
      }
    );
};
