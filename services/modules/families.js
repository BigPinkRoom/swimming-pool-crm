/**
 * @class Families
 * @classdesc Сервис для работы с данными семей.
 */
export default class Families {
  /**
   * Создает экземпляр сервиса Families.
   * @param {object} context - Контекст приложения.
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * Асинхронно выполняет поиск семей по строке запроса.
   * @param {object} [options={}] - Опции для поиска.
   * @param {Array<object>} [options.sortings=[]] - Массив объектов для сортировки (в текущей реализации не используется).
   * @param {object} [options.filters={}] - Объект с параметрами фильтрации (в текущей реализации не используется).
   * @param {object|null} [options.context=null] - Контекст выполнения (в текущей реализации не используется).
   * @param {string} [options.searchString=""] - Строка для поиска.
   * @returns {Promise<Array<object>|null|undefined>} Промис, который разрешается с массивом найденных семей, null или undefined в случае ошибки.
   */
  async search({
    sortings = [],
    filters = {},
    context = null,
    searchString = "",
  } = {}) {
    try {
      const params = {};

      // if (!sortings.length) {
      //   params.sortings = [{ name: "branch_id", type: "ASC" }];
      // }

      if (searchString) {
        params.searchString = searchString;
      }

      const response =
        (await this.context.$api.families.search(params)) || null;

      return response;
    } catch (error) {
      this.context.$showError(error);
    }
  }
}
