import RelativeEntity from "@/entities/relativeEntity";

/**
 * Класс для управления родственниками
 * @class
 */
export default class Relatives {
  /**
   * Создает экземпляр класса Relatives
   * @param {Object} context - Контекст приложения
   */
  constructor(context) {
    this.context = context;

    this.relativesEntity = new RelativeEntity({ context });
  }

  /**
   * Преобразует список типов родственников для использования в select
   * @private
   * @param {Array} typesList - Список типов родственников
   * @returns {Array} Обработанный список типов
   */
  _addRelativeTypesToSelect(typesList) {
    return typesList?.map((item) => {
      const processedItem = {
        ...item,
        text: this.relativesEntity.setRelativeTypeName(item.name),
        value: this.relativesEntity.setRelativeTypeId(item.relativeTypeId),
      };
      return processedItem;
    });
  }

  /**
   * Добавляет переводы для типов родственников
   * @private
   * @param {Array} typesList - Список типов родственников
   * @returns {Array} Список с переводами
   */
  _addRelatvieTypesTranslate(typesList) {
    return typesList?.map((item) => {
      const processedItem = {
        ...item,
        text: this.relativesEntity.setRelativeTypeTranslate(item.text),
        value: this.relativesEntity.setRelativeTypeId(item.relative_type_id),
      };
      return processedItem;
    });
  }

  /**
   * Получает типы родственников с сервера
   * @async
   * @param {Object} options - Параметры запроса
   * @param {Array} [options.sortings=[]] - Сортировка
   * @param {Object} [options.filters={}] - Фильтры
   * @param {Object} [options.context=null] - Контекст
   * @returns {Promise<Array>} Список типов родственников
   */
  async getTypes({ sortings = [], filters = {}, context = null } = {}) {
    const { $api, $showError, $t } = useNuxtApp();

    try {
      const params = {};

      if (!sortings.length) {
        params.sortings = [{ name: "relative_type_id", type: "ASC" }];
      }

      const response = (await $api.relatives.getTypes(params)) || null;

      const processedResponse = this._addRelativeTypesToSelect(response);
      const translatedResponse =
        this._addRelatvieTypesTranslate(processedResponse);

      return translatedResponse;
    } catch (error) {
      console.log("error of errors", error);
      $showError(error);
    }
  }

  /**
   * Разделяет список родственников на секции относительно активного
   * @param {Array} relatives - Список родственников
   * @param {number} activeId - ID активного родственника
   * @returns {Object} Объект с секциями родственников
   */
  getRelativesSections = (relatives, activeId) => {
    const activeIndex = relatives.findIndex((relative) => {
      return relative.id === activeId;
    });

    const object = {
      before: relatives.slice(0, activeIndex),
      active: activeIndex !== -1 ? relatives[activeIndex] : null,
      after: relatives.slice(activeIndex + 1),
    };

    console.log("object )))))))", object);

    return object;
  };

  /**
   * Проверяет достигнут ли максимальный лимит родственников
   * @param {Array} relatives - Список родственников
   * @param {number} [maxLimit=10] - Максимальный лимит
   * @returns {boolean} Результат проверки
   */
  isMaxRelativesLimitReached = (relatives, maxLimit = 10) => {
    return relatives.length >= maxLimit;
  };

  /**
   * Создает новый ID для родственника
   * @param {Array} relatives - Список родственников
   * @returns {number} Новый ID
   */
  createNewRelativeId = (relatives) => {
    if (!relatives || relatives.length === 0) return 1;
    return Math.max(...relatives.map((relative) => Number(relative.id))) + 1;
  };

  /**
   * Создает нового родственника
   * @param {number} id - ID нового родственника
   * @returns {Object} Новый родственник
   */
  createNewRelative = (id) => {
    return this.relativesEntity.createNewRelative(id);
  };

  /**
   * Переназначает ID всем родственникам
   * @param {Array} relatives - Список родственников
   */
  reassignRelativeIds = (relatives) => {
    relatives.forEach((relative, idx) => {
      relative.id = idx + 1;
    });
  };

  /**
   * Удаляет родственника по индексу
   * @param {Array} relatives - Список родственников
   * @param {number} index - Индекс для удаления
   */
  removeRelativeByIndex = (relatives, index) => {
    relatives.splice(index, 1);
  };

  /**
   * Находит индекс родственника по ID
   * @param {Array} relatives - Список родственников
   * @param {number} id - ID родственника
   * @returns {number} Индекс родственника
   */
  findRelativeIndexById = (relatives, id) => {
    return relatives.findIndex((relative) => relative.id === id);
  };

  /**
   * Находит родственника по ID
   * @param {Array} relatives - Список родственников
   * @param {number} id - ID родственника
   * @returns {Object} Найденный родственник
   */
  findRelativeById = (relatives, id) => {
    return relatives.find((relatives) => relatives.id === id);
  };

  /**
   * Обновляет активного родственника после удаления
   * @param {Object} params - Параметры обновления
   * @param {Array} params.relatives - Список родственников
   * @param {Object} params.currentRelativeId - Текущий ID родственника
   * @param {number} params.deletedRelativeId - ID удаленного родственника
   * @param {number} params.index - Индекс удаленного родственника
   */
  updateActiveRelativeAfterDeletion = ({
    relatives,
    currentRelativeId,
    deletedRelativeId,
    index,
  }) => {
    if (currentRelativeId.value === deletedRelativeId) {
      if (relatives.length > 0) {
        currentRelativeId.value =
          relatives[index]?.id || relatives[index - 1]?.id;
      } else {
        currentRelativeId.value = null;
      }
    }
  };
}
