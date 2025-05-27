/**
 * Удаляет все пробельные символы из свойства 'telephone' каждого объекта в массиве.
 * Модифицирует исходный массив.
 *
 * @param {Array<{telephone: string}>} relatives - Массив объектов, каждый из которых должен иметь свойство 'telephone' строкового типа.
 * @returns {Array<{telephone: string}>} Тот же массив объектов `relatives` с обновленными значениями свойства 'telephone'.
 */
export function removeSpaces(relatives) {
  relatives.forEach((relative) => {
    relative.telephone = relative.telephone.replace(/\s+/g, "");
  });
  return relatives;
}
