/**
 * Форматирует строку с датой в формат ДД.ММ.ГГГГ или ДД.ММ.ГГ.
 *
 * @param {string | Date} dateString - Строка с датой или объект Date для форматирования.
 * @param {boolean} [shortYear=false] - Если true, год будет отображаться в сокращенном формате (ГГ), иначе в полном (ГГГГ). По умолчанию false.
 * @returns {string} Отформатированная строка с датой. Возвращает пустую строку, если входная дата некорректна.
 */
export function formatDate(dateString, shortYear = false) {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    console.warn("Invalid date:", dateString);
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = shortYear
    ? date.getFullYear().toString().slice(-2)
    : date.getFullYear();

  return `${day}.${month}.${year}`;
}
