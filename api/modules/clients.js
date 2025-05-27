/**
 * @module api/modules/clients
 * @description Этот модуль предоставляет класс `Clients` для взаимодействия с API клиентов.
 */

/**
 * @class Clients
 * @classdesc Класс для управления операциями, связанными с клиентами.
 */
export default class Clients {
  /**
   * @constructor
   * @param {object} context - Контекст приложения или API.
   * @description Создает экземпляр класса Clients.
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * @async
   * @function getClientById
   * @param {string|number} id - Идентификатор клиента.
   * @returns {Promise<object>} - Промис, который разрешается объектом ответа от API, содержащим данные клиента.
   * @throws {Error} - Выбрасывает ошибку, если запрос к API завершается неудачно.
   * @description Получает данные клиента по его идентификатору.
   */
  async getClientById(id) {
    try {
      const response = await useApi("clients/get-client-by-id", "POST", id);

      return response;
    } catch (error) {
      throw error;
    }
  }
}
