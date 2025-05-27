/**
 * Рекурсивно преобразует все ключи объекта (или объектов в массиве) из snake_case в camelCase.
 *
 * @param {Object|Array<Object>} obj - Объект или массив объектов для преобразования.
 * @returns {Object|Array<Object>} Новый объект или массив объектов с ключами в camelCase.
 */
export function transformKeysToCamelCase(obj) {
  function toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  if (Array.isArray(obj)) {
    // Если массив, применяем функцию к каждому элементу
    return obj.map((item) => transformKeysToCamelCase(item));
  } else if (typeof obj === "object" && obj !== null) {
    // Если объект, преобразуем ключи
    const transformed = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = toCamelCase(key); // Преобразуем ключ в camelCase
        transformed[newKey] = transformKeysToCamelCase(obj[key]); // Рекурсивно обрабатываем значение
      }
    }
    return transformed;
  } else {
    // Если примитивное значение, возвращаем его как есть
    return obj;
  }
}
