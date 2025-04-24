import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export const getDefaultDateRange = () => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  return {
    startDate: format(startOfDay(yesterday), 'yyyy-MM-dd'),
    endDate: format(endOfDay(yesterday), 'yyyy-MM-dd')
  };
};

export const getLast30DaysRange = () => {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  return {
    startDate: format(startOfDay(thirtyDaysAgo), 'yyyy-MM-dd'),
    endDate: format(endOfDay(today), 'yyyy-MM-dd')
  };
};

export const formatDateForDisplay = (date: string) => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTimeForDisplay = (date: string) => {
  return format(new Date(date), 'MMM dd, yyyy h:mm a');
}; 