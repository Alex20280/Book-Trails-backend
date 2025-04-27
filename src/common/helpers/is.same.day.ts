export const isSameDay = (date1: string, date2: string): boolean => {
  const day1 = date1.slice(0, 10);
  const day2 = date2.slice(0, 10);

  return day1 === day2;
};
