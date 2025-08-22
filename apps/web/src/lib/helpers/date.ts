/**
 * Helper function to get the date to the next hour in GMT
 * @param date The date to get the next hour for
 * @returns The next hour in GMT
 */
export const getNextHourInGMT = (date: Date): Date => {
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();

  const result = new Date(date);

  if (minute > 0) {
    result.setUTCHours(hour + 1, 0, 0, 0);
  } else {
    result.setUTCHours(hour, 0, 0, 0);
  }

  return result;
};
