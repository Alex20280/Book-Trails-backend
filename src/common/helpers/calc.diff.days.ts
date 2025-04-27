import { differenceInDays } from 'date-fns';

export const calculateDaysDifference = (date1: string, date2: string): number => {
  return differenceInDays(new Date(date1), new Date(date2));
};
