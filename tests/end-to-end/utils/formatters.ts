export function formatDateToDDMMYYYY(dateString: string): string {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    if (dateString && /^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
      return dateString;
    }
    return dateString;
  }
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
}
