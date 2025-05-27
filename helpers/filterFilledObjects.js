/**
 * Фильтрует массив объектов, оставляя только те объекты, у которых все значения свойств являются заполненными и действительными.
 * К пустым или недействительным значениям относятся: "", null, undefined, NaN.
 *
 * @param {Array<object>} array - Массив объектов для фильтрации.
 * @returns {Array<object>} Новый массив, содержащий только объекты, у которых все значения свойств заполнены и действительны.
 */
export function filterFilledObjects(array) {
  return array.filter((obj) => {
    return Object.values(obj).every((value) => {
      return (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        !Number.isNaN(value)
      );
    });
  });
}
