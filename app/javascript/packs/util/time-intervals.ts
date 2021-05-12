export const endOfInterval = (
  dateTime: string,
  intervalInMilliseconds: number
): string => {
  // dateTime must be in simplified ISO 8601 calendar date extended format
  // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#date_time_string_format
  return new Date(Date.parse(dateTime) + intervalInMilliseconds).toISOString();
};

type Interval = [string, string];

const fifteenMinutesInMilliseconds = 900000;
export const mergedIntervals = (intervalStartTimes: string[]): Interval[] => {
  intervalStartTimes.sort();
  const intervals: Interval[] = [];
  for (const startTime of intervalStartTimes) {
    const endTime = endOfInterval(startTime, fifteenMinutesInMilliseconds);
    if (intervals.length === 0) {
      intervals.push([startTime, endTime]);
    } else if (intervals[intervals.length - 1][1] >= startTime) {
      intervals[intervals.length - 1][1] = endTime;
    } else {
      intervals.push([startTime, endTime]);
    }
  }
  return intervals;
};
