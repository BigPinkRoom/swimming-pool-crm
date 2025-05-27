/**
 * @module api/modules/families
 * @description Этот модуль предоставляет класс `Families` для взаимодействия с API семей.
 */

/**
 * @class Families
 * @classdesc Класс для управления операциями, связанными с семьями.
 */
export default class Families {
  /**
   * @constructor
   * @param {object} context - Контекст приложения или API.
   * @description Создает экземпляр класса Families.
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * @async
   * @function search
   * @param {object} params - Параметры для поиска семей.
   * @returns {Promise<object>} - Промис, который разрешается объектом ответа от API, содержащим результаты поиска.
   * @throws {Error} - Выбрасывает ошибку, если запрос к API завершается неудачно.
   * @description Выполняет поиск семей на основе предоставленных параметров.
   */
  async search(params) {
    try {
      const response = await useApi("search/search-family", "POST", params);

      return response;
    } catch (error) {
      throw error;
    }
  }
}
