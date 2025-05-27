/**
 * @module api/modules/relatives
 * @description Этот модуль предоставляет класс `Relatives` для взаимодействия с API родственников.
 */

/**
 * @class Relatives
 * @classdesc Класс для управления операциями, связанными с родственниками.
 */
export default class Relatives {
  /**
   * @constructor
   * @param {object} context - Контекст приложения или API.
   * @description Создает экземпляр класса Relatives.
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * @async
   * @function getTypes
   * @param {object} params - Параметры для запроса типов родства.
   * @returns {Promise<object>} - Промис, который разрешается объектом ответа от API, содержащим типы родства.
   * @throws {Error} - Выбрасывает ошибку, если запрос к API завершается неудачно.
   * @description Получает типы родства на основе предоставленных параметров.
   */
  async getTypes(params) {
    try {
      const response = await useApi("relatives/types", "POST", params);

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @async
   * @function getRelativeById
   * @param {string|number} id - Идентификатор родственника.
   * @returns {Promise<object>} - Промис, который разрешается объектом ответа от API, содержащим данные родственника.
   * @throws {Error} - Выбрасывает ошибку, если запрос к API завершается неудачно.
   * @description Получает данные родственника по его идентификатору.
   */
  async getRelativeById(id) {
    try {
      const response = await useApi("relatives/get-relative-by-id", "POST", id);

      return response;
    } catch (error) {
      throw error;
    }
  }
}
