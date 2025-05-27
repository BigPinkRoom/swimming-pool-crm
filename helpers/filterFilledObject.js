/**
 * Фильтрует объект, удаляя из него все свойства с пустыми или недействительными значениями.
 * К пустым или недействительным значениям относятся: "", null, undefined, NaN.
 *
 * @param {object | null | undefined} obj - Исходный объект для фильтрации.
 * @returns {object} Новый объект, содержащий только свойства с заполненными и действительными значениями. Если исходный объект равен null или undefined, возвращается пустой объект.
 */
export function filterFilledObject(obj) {
  if (obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(([key, value]) => {
        return (
          value !== "" &&
          value !== null &&
          value !== undefined &&
          !Number.isNaN(value)
        );
      }),
    );
  } else {
    return {};
  }
}
