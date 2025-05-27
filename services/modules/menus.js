import { useUserStore } from "@/stores/userStore";

/**
 * @class Menus
 * @classdesc Сервис для работы с данными меню.
 */
export default class Menus {
  /**
   * Создает экземпляр сервиса Menus.
   * @param {object} context - Контекст приложения.
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * Возвращает ключ для перевода названия пункта главного меню.
   * @private
   * @param {string} name - Имя маршрута (например, 'main', 'signup').
   * @returns {string|null} Ключ для локализации или null, если имя не найдено.
   */
  _getTitleMainMenu(name) {
    const titles = {
      main: "main",
      signup: "signup",
      login: "signin",
      profile: "profile",
      logout: "logout",
      admin_panel: "adminPanel",
    };

    return titles[name] || null;
  }

  /**
   * Преобразует список маршрутов в формат для навигационной панели, добавляя ключи для локализации названий.
   * @private
   * @param {Array<object>} routesList - Список объектов маршрутов.
   * @returns {Array<object>|undefined} Массив обработанных элементов меню или undefined, если routesList не предоставлен.
   */
  _mainMenuToNavbar(routesList) {
    return routesList?.map((item) => {
      const processedItem = {
        ...item,
        title: this._getTitleMainMenu(item.name),
      };
      return processedItem;
    });
  }

  /**
   * Асинхронно получает данные главного меню.
   * @param {object} [options={}] - Опции для запроса.
   * @param {Array<object>} [options.sortings=[]] - Массив объектов для сортировки.
   * @param {object} [options.filters={}] - Объект с параметрами фильтрации (в данном методе не используется).
   * @param {object|null} [options.context=null] - Контекст выполнения (в данном методе не используется).
   * @returns {Promise<Array<object>|null|undefined>} Промис, который разрешается с обработанным списком элементов меню, null или undefined в случае ошибки.
   */
  async getMainMenu({ sortings = [], filters = {}, context = null } = {}) {
    try {
      const params = {};

      if (!sortings.length) {
        params.sortings = [{ name: "menu_item_id", type: "ASC" }];
      }

      const response = (await this.context.$api.menus.get(params)) || null;
      const processedResponse = this._mainMenuToNavbar(response);

      return processedResponse;
    } catch (error) {
      this.context.$showError(error);
    }
  }
}
