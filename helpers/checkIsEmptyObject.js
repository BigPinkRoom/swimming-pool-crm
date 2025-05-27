/**
 * Проверяет, является ли объект пустым (не содержит собственных перечисляемых свойств).
 *
 * @param {object} obj - Объект для проверки.
 * @returns {boolean} Возвращает true, если объект пуст, иначе false.
 */
export default function checkIsEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}
