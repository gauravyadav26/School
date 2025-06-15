export const getMonthYear = (date: Date): string => {
  return date.toISOString().slice(0, 7); // YYYY-MM format
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatMonth = (monthString: string): string => {
  const date = new Date(monthString + '-01');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
};

export const getCurrentMonth = (): string => {
  return getMonthYear(new Date());
};

export const getMonthsSince = (startMonth: string): string[] => {
  const months = [];
  const start = new Date(startMonth + '-01');
  const current = new Date();
  
  while (start <= current) {
    months.push(getMonthYear(start));
    start.setMonth(start.getMonth() + 1);
  }
  
  return months;
};