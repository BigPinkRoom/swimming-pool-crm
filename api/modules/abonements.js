export default class Abonements {
  /**
   * Класс для работы с абонементами через API.
   * @param {any} context - Контекст выполнения (например, Nuxt context).
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * Получить полную информацию об абонементах.
   * @param {object} params - Параметры запроса.
   * @returns {Promise<object>} Ответ API с данными абонементов.
   */
  async getFull(params) {
    try {
      const response = await useApi(
        "abonements/abonementsFull",
        "POST",
        params
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Добавить семейный абонемент.
   * @param {object} params - Данные для добавления семейного абонемента.
   * @returns {Promise<object>} Ответ API после добавления.
   */
  async addFamily(params) {
    try {
      const response = await useApi("abonements/addFamily", "POST", params);

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Обновить семейный абонемент.
   * @param {object} params - Данные для обновления семейного абонемента.
   * @returns {Promise<object>} Ответ API после обновления.
   */
  async updateFamily(params) {
    try {
      const response = await useApi("abonements/updateFamily", "PUT", params);

      return response;
    } catch (error) {
      throw error;
    }
  }
}
