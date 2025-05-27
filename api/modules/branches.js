/**
 * @module api/modules/branches
 * @description Этот модуль предоставляет класс `Branches` для взаимодействия с API филиалов.
 */

/**
 * @class Branches
 * @classdesc Класс для управления операциями, связанными с филиалами.
 */
export default class Branches {
  /**
   * @constructor
   * @param {object} context - Контекст приложения или API.
   * @description Создает экземпляр класса Branches.
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * @async
   * @function get
   * @param {object} params - Параметры для запроса списка филиалов.
   * @returns {Promise<object>} - Промис, который разрешается объектом ответа от API.
   * @throws {Error} - Выбрасывает ошибку, если запрос к API завершается неудачно.
   * @description Получает список филиалов на основе предоставленных параметров.
   */
  async get(params) {
    try {
      const response = await useApi("branches/list", "POST", params);

      return response;
    } catch (error) {
      throw error;
    }
  }
}
