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
