/**
 * Удаляет все нецифровые символы из телефона
 * @param {string} phone
 * @returns {string}
 */
export function unmaskPhone(phone) {
  return (phone || "").replace(/\D/g, "");
}

/**
 * Форматирует телефон в маску +7 (999) 123-45-67
 * @param {string} phone
 * @returns {string}
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
