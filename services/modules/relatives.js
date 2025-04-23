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
   * @param {number} activeId - ID или индекс активного родственника
   * @returns {Object} Объект с секциями родственников
   */
  getRelativesSections = (relatives, activeId) => {
    // Проверяем, не пуст ли массив родственников
    if (!relatives || relatives.length === 0) {
      return {
        before: [],
        active: null,
        after: [],
      };
    }

    // Сначала пробуем найти по id
    let activeIndex = relatives.findIndex(
      (relative) => relative && relative.id === activeId
    );

    // Если по id не нашли, проверяем по индексу массива
    if (activeIndex === -1 && activeId > 0 && activeId <= relatives.length) {
      activeIndex = activeId - 1; // Индексы массива начинаются с 0, а UI-индексы с 1
    }

    // Если активный родственник не найден, возвращаем все в before
    if (activeIndex === -1) {
      return {
        before: [...relatives],
        active: null,
        after: [],
      };
    }

    const object = {
      before: relatives.slice(0, activeIndex),
      active: relatives[activeIndex],
      after: relatives.slice(activeIndex + 1),
    };

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
   * Переназначает индексы для родственников
   * @param {Array} relatives - Список родственников
   */
  reassignRelativeIds = (relatives) => {
    // Вместо назначения ID мы ничего не делаем, так как используем индексы
    // Для родственников без ID с сервера (новых)
    // А ID должен присваивать сервер при сохранении
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
   * Находит индекс родственника по ID или индексу
   * @param {Array} relatives - Список родственников
   * @param {number} idOrIndex - ID родственника или индекс в массиве (начиная с 1)
   * @returns {number} Индекс родственника в массиве
   */
  findRelativeIndexById = (relatives, idOrIndex) => {
    if (!relatives || !idOrIndex) return -1;

    // Сначала ищем по id
    const indexById = relatives.findIndex(
      (relative) => relative && relative.id === idOrIndex
    );
    if (indexById !== -1) return indexById;

    // Если не нашли по id, проверяем, не является ли параметр индексом
    const index = idOrIndex - 1; // Конвертируем 1-based индекс в 0-based
    if (index >= 0 && index < relatives.length) {
      return index;
    }

    return -1;
  };

  /**
   * Находит родственника по ID или индексу
   * @param {Array} relatives - Список родственников
   * @param {number} idOrIndex - ID родственника или индекс в массиве (начиная с 1)
   * @returns {Object} Найденный родственник
   */
  findRelativeById = (relatives, idOrIndex) => {
    if (!relatives || !idOrIndex) return null;

    // Сначала ищем по id
    const byId = relatives.find(
      (relative) => relative && relative.id === idOrIndex
    );
    if (byId) return byId;

    // Если не нашли по id, проверяем позицию в массиве
    const index = idOrIndex - 1; // Конвертируем 1-based индекс в 0-based
    if (index >= 0 && index < relatives.length) {
      return relatives[index];
    }

    return null;
  };

  /**
   * Обновляет активного родственника после удаления
   * @param {Object} params - Параметры обновления
   * @param {Array} params.relatives - Список родственников
   * @param {Object} params.currentRelativeId - Текущий ID родственника
   * @param {number} params.deletedRelativeId - ID или индекс удаленного родственника
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
        // Если есть родственник по текущему индексу, используем его
        if (relatives[index]) {
          // Если родственник имеет id, используем его, иначе индекс+1
          currentRelativeId.value = relatives[index].id || index + 1;
        }
        // Иначе используем предыдущий родственник
        else if (relatives[index - 1]) {
          currentRelativeId.value = relatives[index - 1].id || index;
        }
        // Если нет ни текущего, ни предыдущего, берем первый родственник
        else if (relatives[0]) {
          currentRelativeId.value = relatives[0].id || 1;
        }
        // Если совсем ничего не нашли, сбрасываем значение
        else {
          currentRelativeId.value = null;
        }
      } else {
        currentRelativeId.value = null;
      }
    }
    // Если удаленный родственник был с меньшим индексом, чем текущий,
    // нужно скорректировать текущий индекс
    else if (
      !isNaN(currentRelativeId.value) &&
      index < currentRelativeId.value - 1
    ) {
      currentRelativeId.value--;
    }
  };
}
