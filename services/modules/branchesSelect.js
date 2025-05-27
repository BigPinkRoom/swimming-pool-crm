/**
 * @class Branches
 * @classdesc Сервис для получения данных филиалов, отформатированных для использования в select-компонентах.
 */
export default class Branches {
  /**
   * Создает экземпляр сервиса Branches для select-компонентов.
   * @param {object} context - Контекст приложения.
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * Асинхронно получает список филиалов и преобразует его в модель для select-компонента.
   * @param {object} [options={}] - Опции для запроса.
   * @param {Array<object>} [options.sortings=[]] - Массив объектов для сортировки.
   * @param {object} [options.filters={}] - Объект с параметрами фильтрации (в данном методе не используется).
   * @param {object|null} [options.context=null] - Контекст выполнения (в данном методе не используется).
   * @returns {Promise<Array<object>|undefined>} Промис, который разрешается с массивом объектов для select-компонента
   * (каждый объект содержит idName, value, text, disabled, selected) или undefined в случае ошибки.
   */
  async get({ sortings = [], filters = {}, context = null } = {}) {
    try {
      const params = {};

      if (!sortings.length) {
        params.sortings = [{ name: "branch_id", type: "ASC" }];
      }

      const response =
        (await this.context.$api.branches.get({ params })) || null;

      const branchesSelectModel = response?.map((branch) => {
        return {
          idName: "branch-options",
          value: branch.branch_id,
          text: branch.name,
          disabled: false,
          selected: false,
        };
      });

      return branchesSelectModel;
    } catch (error) {
      this.context.$showError(error);
    }
  }
}
