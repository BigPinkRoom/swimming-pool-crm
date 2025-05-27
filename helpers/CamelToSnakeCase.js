/**
 * Рекурсивно преобразует все ключи объекта (или объектов в массиве) из camelCase в snake_case.
 *
 * @param {Object|Array<Object>} obj - Объект или массив объектов для преобразования.
 * @returns {Object|Array<Object>} Новый объект или массив объектов с ключами в snake_case.
 */
export function transformKeysToSnakeCase(obj) {
  function toSnakeCase(str) {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
  }

  if (Array.isArray(obj)) {
    // Если массив, применяем функцию к каждому элементу
    return obj.map((item) => transformKeysToSnakeCase(item));
  } else if (typeof obj === "object" && obj !== null) {
    // Если объект, преобразуем ключи
    const transformed = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = toSnakeCase(key); // Преобразуем ключ в snake_case
        transformed[newKey] = transformKeysToSnakeCase(obj[key]); // Рекурсивно обрабатываем значение
      }
    }
    return transformed;
  } else {
    // Если примитивное значение, возвращаем его как есть
    return obj;
  }
}
