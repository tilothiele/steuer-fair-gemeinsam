/**
 * Formatiert eine Zahl als deutsche Währung
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatiert eine Zahl als Prozent
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

/**
 * Formatiert eine Zahl mit Tausendertrennzeichen
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('de-DE').format(value);
};

/**
 * Formatiert ein Datum im deutschen Format
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('de-DE').format(dateObj);
};
