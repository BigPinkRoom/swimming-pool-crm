export function getCurrentDate() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  return { currentYear, currentMonth };
}
