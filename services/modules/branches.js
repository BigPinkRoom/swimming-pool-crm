/**
 * @class Branches
 * @classdesc Сервис для работы с филиалами.
 */
export default class Branches {
  /**
   * Создает экземпляр сервиса Branches.
   * @param {object} context - Контекст приложения.
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * Асинхронно получает список филиалов.
   * @param {object} [options={}] - Опции для запроса.
   * @param {Array<object>} [options.sortings=[]] - Массив объектов для сортировки.
   * @param {object} [options.filters={}] - Объект с параметрами фильтрации (в данном методе не используется, но оставлен для консистентности).
   * @param {object|null} [options.context=null] - Контекст выполнения (в данном методе не используется).
   * @returns {Promise<Array<object>|null|undefined>} Промис, который разрешается с массивом филиалов, null или undefined в случае ошибки.
   */
  async get({ sortings = [], filters = {}, context = null } = {}) {
    try {
      const params = {};

      if (!sortings.length) {
        params.sortings = [{ name: "branch_id", type: "ASC" }];
      }

      const response = (await this.context.$api.branches.get(params)) || null;

      return response;
    } catch (error) {
      this.context.$showError(error);
    }
  }
}
