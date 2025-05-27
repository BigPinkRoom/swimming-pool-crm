/**
 * Возвращает текущий год и месяц.
 *
 * @returns {{currentYear: number, currentMonth: number}} Объект с текущим годом и месяцем (месяцы нумеруются с 1).
 */
export function getCurrentDate() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  return { currentYear, currentMonth };
}
