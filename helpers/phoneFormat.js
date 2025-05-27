/**
 * Удаляет все нецифровые символы из телефонного номера.
 * @param {string | undefined | null} phone - Строка с телефонным номером.
 * @returns {string} Строка, содержащая только цифры из исходного телефонного номера. Если входная строка пуста, undefined или null, возвращает пустую строку.
 */
export function unmaskPhone(phone) {
  return (phone || "").replace(/\D/g, "");
}

/**
 * Форматирует телефонный номер в маску +7 (XXX) XXX-XX-XX.
 * @param {string | undefined | null} phone - Строка с телефонным номером (предпочтительно только цифры).
 * @returns {string} Отформатированный телефонный номер. Если входная строка пуста, undefined или null, или содержит недостаточно цифр, возвращает частично отформатированный номер или пустую строку.
 */
export function maskPhone(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  let result = "+7";
  if (digits.length > 1) result += ` (${digits.slice(1, 4)}`;
  if (digits.length >= 4) result += `) ${digits.slice(4, 7)}`;
  if (digits.length >= 7) result += `-${digits.slice(7, 9)}`;
  if (digits.length >= 9) result += `-${digits.slice(9, 11)}`;
  return result;
}
