/**
 * @module api/modules/menus
 * @description Этот модуль предоставляет класс `Menus` для взаимодействия с API меню.
 */

/**
 * @class Menus
 * @classdesc Класс для управления операциями, связанными с меню.
 */
export default class Menus {
  /**
   * @constructor
   * @param {object} context - Контекст приложения или API.
   * @description Создает экземпляр класса Menus.
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * @async
   * @function get
   * @param {object} params - Параметры для запроса списка меню.
   * @returns {Promise<object>} - Промис, который разрешается объектом ответа от API.
   * @throws {Error} - Выбрасывает ошибку, если запрос к API завершается неудачно.
   * @description Получает список меню на основе предоставленных параметров.
   */
  async get(params) {
    try {
      const response = await useApi("menus/list", "POST", params);

      return response;
    } catch (error) {
      throw error;
    }
  }
}
