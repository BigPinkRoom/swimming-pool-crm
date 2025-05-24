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
      (relative) => relative && relative.id === activeId,
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
      (relative) => relative && relative.id === idOrIndex,
    );

    if (indexById !== -1) {
      return indexById;
    }

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
    if (!relatives || !idOrIndex) {
      return null;
    }

    // Сначала ищем по id
    const byId = relatives.find(
      (relative) => relative && String(relative.id) === String(idOrIndex),
    );

    if (byId) {
      return byId;
    }

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

  getRelativeById = async (id) => {
    const params = {
      id,
    };
    const relative = await this.context.$api.relatives.getRelativeById(params);

    return relative;
  };

  /**
   * Создает пустого родственника по умолчанию
   * @returns {Object} Пустой родственник
   */
  createEmptyRelative = () => {
    return {
      name: "",
      surname: "",
      patronymic: "",
      relativeTypeId: 1,
      telephone: "",
    };
  };

  /**
   * Получает временные данные родственника по индексу или создает новые
   * @param {Object} tempRelatives - Объект временного кэша
   * @param {Array} relatives - Массив родственников
   * @param {number} indexOrId - Индекс родственника (начиная с 1) или ID
   * @returns {Object} Данные родственника
   */
  getTempRelativeData = (tempRelatives, relatives, indexOrId) => {
    // Если временные данные еще не созданы
    if (!tempRelatives[indexOrId]) {
      // Сначала попробуем найти родственника в основном хранилище
      const relative = this.findRelativeById(relatives, indexOrId);

      // Если нашли родственника в хранилище, используем его данные
      if (relative) {
        tempRelatives[indexOrId] = {
          id: relative.id,
          name: relative.name || "",
          surname: relative.surname || "",
          patronymic: relative.patronymic || "",
          relativeTypeId: relative.relativeTypeId || 1,
          telephone: relative.telephone || "",
        };
      } else {
        // Если родственник не найден, создаем пустой объект
        tempRelatives[indexOrId] = this.createEmptyRelative();
      }
    }

    return tempRelatives[indexOrId];
  };

  /**
   * Очищает временный кэш родственников
   * @param {Object} tempRelatives - Объект временного кэша
   */
  clearTempRelativesCache = (tempRelatives) => {
    Object.keys(tempRelatives).forEach((key) => delete tempRelatives[key]);
  };

  /**
   * Генерирует текст для кнопки добавления родственника
   * @param {Array} relatives - Массив родственников
   * @param {number} maxLimit - Максимальное количество родственников
   * @returns {string} Текст кнопки
   */
  getAddRelativeButtonText = (relatives, maxLimit = 10) => {
    const checkRelativeLessMax = relatives.length < maxLimit;
    const checkRelativeEqualMax = relatives.length >= maxLimit;

    if (checkRelativeLessMax) {
      return "+ Добавить ещё одного родственника";
    } else if (checkRelativeEqualMax) {
      return "Максимальное количество родственников";
    } else {
      return "+ Добавить родственника";
    }
  };

  /**
   * Добавляет нового родственника в массив
   * @param {Array} relatives - Массив родственников
   * @param {number} maxLimit - Максимальное количество родственников
   * @returns {Object} Результат операции с новым родственником и индексом
   */
  addNewRelative = (relatives, maxLimit = 10) => {
    // Если достигнут предел родственников, не добавляем новых
    if (this.isMaxRelativesLimitReached(relatives, maxLimit)) {
      return { success: false, reason: "max_limit_reached" };
    }

    // Создаем нового родственника
    const newRelative = this.createEmptyRelative();

    // Добавляем нового родственника в массив
    relatives.push(newRelative);

    // Возвращаем индекс нового родственника
    const newIndex = relatives.length;

    return {
      success: true,
      newRelative,
      newIndex,
      relatives,
    };
  };

  /**
   * Получает данные для сброса формы с пустыми значениями
   * @returns {Object} Объект с пустыми значениями для формы
   */
  getEmptyFormValues = () => {
    return {
      name: "",
      surname: "",
      patronymic: "",
      relativeTypeId: 1,
      telephone: "",
    };
  };

  /**
   * Обрабатывает добавление родственника с валидацией активного
   * @param {Object} params - Параметры обработки
   * @param {Array} params.relatives - Массив родственников
   * @param {Object} params.activeSections - Секции родственников
   * @param {boolean} params.isEditing - Флаг редактирования
   * @param {Function} params.validate - Функция валидации
   * @param {Function} params.updateActiveRelative - Функция обновления активного родственника
   * @param {Object} params.currentTempRelative - Текущий временный родственник
   * @param {string|number} params.currentRelativeId - ID текущего родственника
   * @param {number} [params.maxLimit=10] - Максимальное количество родственников
   * @returns {Promise<Object>} Результат операции
   */
  handleAddRelativeWithValidation = async ({
    relatives,
    activeSections,
    isEditing,
    validate,
    updateActiveRelative,
    currentTempRelative,
    currentRelativeId,
    maxLimit = 10,
  }) => {
    // Если достигнут предел родственников, не добавляем новых
    if (this.isMaxRelativesLimitReached(relatives, maxLimit)) {
      return { success: false, reason: "max_limit_reached" };
    }

    // Если есть активный родственник, сначала проверяем валидацию
    if (activeSections.active && isEditing) {
      const validationResult = await validate();

      if (!validationResult.valid) {
        // Если валидация не прошла, останавливаем добавление нового родственника
        return { success: false, reason: "validation_failed" };
      }

      // Если валидация успешна, сохраняем текущего родственника
      updateActiveRelative(
        activeSections.active.id || currentRelativeId,
        currentTempRelative,
      );
    }

    // Добавляем нового родственника
    const addResult = this.addNewRelative(relatives, maxLimit);
    if (!addResult.success) {
      return addResult;
    }

    return {
      success: true,
      newIndex: addResult.newIndex,
      shouldCloseEditing: true,
      shouldOpenEditing: true,
      formValues: this.getEmptyFormValues(),
    };
  };

  /**
   * Обрабатывает сохранение активного родственника и добавление нового
   * @param {Object} params - Параметры обработки
   * @param {Array} params.relatives - Массив родственников
   * @param {Object} params.activeSections - Секции родственников
   * @param {Function} params.validate - Функция валидации
   * @param {Function} params.updateActiveRelative - Функция обновления активного родственника
   * @param {Object} params.currentTempRelative - Текущий временный родственник
   * @param {string|number} params.activeIndex - Индекс активного родственника
   * @param {number} [params.maxLimit=10] - Максимальное количество родственников
   * @returns {Promise<Object>} Результат операции
   */
  saveActiveAndAddNew = async ({
    relatives,
    activeSections,
    validate,
    updateActiveRelative,
    currentTempRelative,
    activeIndex,
    maxLimit = 10,
  }) => {
    try {
      if (!activeSections.active) {
        return { success: false, reason: "no_active_relative" };
      }

      const resultValidate = await validate();
      if (!resultValidate.valid) {
        return { success: false, reason: "validation_failed" };
      }

      // Сохраняем текущего родственника
      updateActiveRelative(activeIndex, currentTempRelative);

      // Проверяем лимит
      if (!this.isMaxRelativesLimitReached(relatives, maxLimit)) {
        // Добавляем нового родственника и переключаемся на него
        const addResult = this.addNewRelative(relatives, maxLimit);
        if (addResult.success) {
          return {
            success: true,
            newIndex: addResult.newIndex,
            shouldOpenEditing: true,
            formValues: this.getEmptyFormValues(),
          };
        }
      } else {
        // Если лимит достигнут — просто закрываем режим редактирования
        return {
          success: true,
          shouldCloseEditing: true,
        };
      }
    } catch (error) {
      return { success: false, reason: "error", error };
    }
  };

  /**
   * Получает значения формы для родственника
   * @param {Object} relative - Данные родственника
   * @returns {Object} Значения для формы
   */
  getRelativeFormValues = (relative) => {
    return {
      name: relative.name || "",
      surname: relative.surname || "",
      patronymic: relative.patronymic || "",
      relativeTypeId: relative.relativeTypeId || 1,
      telephone: relative.telephone || "",
    };
  };

  /**
   * Проверяет и обновляет временный кэш для родственника
   * @param {Object} tempRelatives - Временный кэш
   * @param {Array} relatives - Массив родственников
   * @param {number} index - Индекс родственника
   * @returns {Object} Данные для кэша
   */
  updateTempCacheForRelative = (tempRelatives, relatives, index) => {
    const storeRelative = this.findRelativeById(relatives, index);

    if (storeRelative) {
      tempRelatives[index] = {
        id: storeRelative.id,
        name: storeRelative.name || "",
        surname: storeRelative.surname || "",
        patronymic: storeRelative.patronymic || "",
        relativeTypeId: storeRelative.relativeTypeId || 1,
        telephone: storeRelative.telephone || "",
      };
    }

    return tempRelatives[index];
  };

  /**
   * Находит несохраненного родственника (без id)
   * @param {Array} relatives - Массив родственников
   * @returns {Object} Объект с индексом и данными родственника
   */
  findUnsavedRelative = (relatives) => {
    const unsavedRelativeIndex = relatives.findIndex(
      (relative) => !relative.id,
    );

    const unsavedRelative = relatives[unsavedRelativeIndex];

    return {
      index: unsavedRelativeIndex,
      relative: unsavedRelative,
      exists: unsavedRelativeIndex !== -1 && unsavedRelative,
    };
  };

  /**
   * Удаляет родственника и очищает временный кэш
   * @param {Object} params - Параметры удаления
   * @param {Array} params.relatives - Массив родственников
   * @param {Object} params.tempRelatives - Временный кэш
   * @param {number} params.index - Индекс или ID родственника для удаления
   * @returns {Object} Результат операции удаления
   */
  deleteRelativeAndCleanCache = ({ relatives, tempRelatives, index }) => {
    // Проверяем, существует ли родственник перед удалением
    const relativeIndex = this.findRelativeIndexById(relatives, index);

    if (relativeIndex === -1) {
      return {
        success: false,
        reason: "relative_not_found",
        message: `Не удалось найти родственника для удаления с индексом/id: ${index}`,
      };
    }

    // Удаляем родственника из массива
    relatives.splice(relativeIndex, 1);

    // Очищаем временные данные
    delete tempRelatives[index];

    return {
      success: true,
      deletedIndex: relativeIndex,
      relativesCount: relatives.length,
    };
  };

  /**
   * Определяет следующего активного родственника после удаления
   * @param {Object} params - Параметры для определения следующего родственника
   * @param {Array} params.relatives - Массив родственников
   * @param {Function} params.getTempRelative - Функция получения временного родственника
   * @param {Function} params.addOneMoreRelatives - Функция добавления нового родственника
   * @returns {Object} Результат с данными следующего активного родственника
   */
  getNextActiveRelativeAfterDeletion = ({
    relatives,
    getTempRelative,
    addOneMoreRelatives,
  }) => {
    // Если больше нет родственников, автоматически открываем форму для добавления
    if (relatives.length === 0) {
      return {
        action: "add_new",
        shouldAddNew: true,
      };
    }

    // Проверяем наличие несохраненного родственника (без id)
    const unsavedData = this.findUnsavedRelative(relatives);

    if (unsavedData.exists) {
      // Если есть несохраненный родственник, переключаемся на него
      const relativePosition = unsavedData.index + 1; // Индекс относительный (начиная с 1)

      return {
        action: "switch_to_unsaved",
        currentRelativeId: relativePosition,
        formValues: this.getRelativeFormValues(unsavedData.relative),
        shouldOpenEditing: true,
      };
    } else {
      // Иначе устанавливаем текущим родственником первого в списке
      const firstRelative = relatives[0];
      const currentRelativeId = firstRelative.id || 1;

      return {
        action: "switch_to_first",
        currentRelativeId,
        formValues: getTempRelative(currentRelativeId),
        shouldCloseEditing: true,
      };
    }
  };

  /**
   * Полная обработка удаления родственника
   * @param {Object} params - Параметры обработки удаления
   * @param {Array} params.relatives - Массив родственников
   * @param {Object} params.tempRelatives - Временный кэш
   * @param {number} params.index - Индекс или ID родственника для удаления
   * @param {Function} params.getTempRelative - Функция получения временного родственника
   * @param {Function} params.addOneMoreRelatives - Функция добавления нового родственника
   * @returns {Object} Результат полной обработки удаления
   */
  handleRelativeDeletion = ({
    relatives,
    tempRelatives,
    index,
    getTempRelative,
    addOneMoreRelatives,
  }) => {
    // Удаляем родственника
    const deleteResult = this.deleteRelativeAndCleanCache({
      relatives,
      tempRelatives,
      index,
    });

    if (!deleteResult.success) {
      return deleteResult;
    }

    // Определяем следующего активного родственника
    const nextActiveResult = this.getNextActiveRelativeAfterDeletion({
      relatives,
      getTempRelative,
      addOneMoreRelatives,
    });

    return {
      success: true,
      deleteResult,
      nextActive: nextActiveResult,
    };
  };

  /**
   * Получает тип родственника по ID из списка типов
   * @param {Array} relativesTypes - Список типов родственников
   * @param {number} relativeId - ID типа родственника
   * @returns {string} Название типа родственника
   */
  getRelativeTypeById = (relativesTypes, relativeId) => {
    const relativeType = relativesTypes?.find(
      (type) => type.value === relativeId,
    );
    return relativeType?.text;
  };

  /**
   * Сохраняет текущего родственника перед переключением режима редактирования
   * @param {Object} params - Параметры сохранения
   * @param {boolean} params.isEditing - Флаг текущего режима редактирования
   * @param {Object} params.currentTempRelative - Текущий временный родственник
   * @param {Function} params.updateActiveRelative - Функция обновления активного родственника
   * @param {string|number} params.currentRelativeId - ID текущего родственника
   * @param {Object} params.tempRelatives - Временный кэш
   * @returns {Object} Результат сохранения
   */
  saveCurrentRelativeBeforeEdit = ({
    isEditing,
    currentTempRelative,
    updateActiveRelative,
    currentRelativeId,
    tempRelatives,
  }) => {
    if (isEditing) {
      const currentRelative = { ...currentTempRelative };
      updateActiveRelative(currentRelativeId, currentRelative);
      tempRelatives[currentRelativeId] = { ...currentRelative };

      return {
        saved: true,
        savedRelative: currentRelative,
      };
    }

    return { saved: false };
  };

  /**
   * Обрабатывает переключение в режим редактирования родственника
   * @param {Object} params - Параметры переключения
   * @param {string|number} params.index - Индекс родственника для редактирования
   * @param {boolean} params.isEditing - Текущий флаг редактирования
   * @param {Object} params.currentTempRelative - Текущий временный родственник
   * @param {Function} params.updateActiveRelative - Функция обновления активного родственника
   * @param {string|number} params.currentRelativeId - ID текущего родственника
   * @param {Object} params.tempRelatives - Временный кэш
   * @param {Array} params.relatives - Массив родственников
   * @param {Function} params.getTempRelative - Функция получения временного родственника
   * @returns {Object} Результат переключения режима редактирования
   */
  handleEditModeSwitch = ({
    index,
    isEditing,
    currentTempRelative,
    updateActiveRelative,
    currentRelativeId,
    tempRelatives,
    relatives,
    getTempRelative,
  }) => {
    // Сохраняем текущего родственника, если находимся в режиме редактирования
    const saveResult = this.saveCurrentRelativeBeforeEdit({
      isEditing,
      currentTempRelative,
      updateActiveRelative,
      currentRelativeId,
      tempRelatives,
    });

    // Обновляем временный кэш для нового родственника
    this.updateTempCacheForRelative(tempRelatives, relatives, index);

    // Получаем данные из временного кэша
    const relativeData = getTempRelative(index);

    return {
      success: true,
      newRelativeId: index,
      shouldOpenEditing: true,
      formValues: this.getRelativeFormValues(relativeData),
      saveResult,
    };
  };

  /**
   * Подготавливает данные для установки в несохраненного родственника
   * @param {number} index - Индекс родственника
   * @param {Object} relative - Данные родственника
   * @returns {Object} Результат подготовки данных
   */
  prepareUnsavedRelativeData = (index, relative) => {
    return {
      currentRelativeId: index + 1,
      formValues: this.getRelativeFormValues(relative),
      shouldOpenEditing: true,
    };
  };

  /**
   * Преобразует данные родственника из пропсов в формат для хранилища
   * @param {Object} relative - Данные родственника из пропсов
   * @param {boolean} isEditMode - Флаг режима редактирования
   * @returns {Object} Данные родственника для хранилища
   */
  transformRelativeFromProps = (relative, isEditMode = false) => {
    if (!relative) return null;

    const relativeForStore = isEditMode
      ? {
          name: relative.relativeName || relative.name || "",
          surname: relative.relativeSurname || relative.surname || "",
          patronymic: relative.relativePatronymic || relative.patronymic || "",
          relativeTypeId:
            relative.relativeTypeId || relative.relative_type_id || 1,
          telephone: relative.telephone || relative.relativeTelephone || "",
        }
      : {
          name: relative.name || "",
          surname: relative.surname || "",
          patronymic: relative.patronymic || "",
          relativeTypeId:
            relative.relativeTypeId || relative.relative_type_id || 1,
          telephone: relative.telephone || "",
        };

    // Обрабатываем ID из разных источников
    if (relative.id) {
      relativeForStore.id = relative.id;
    } else if (relative.relativeId) {
      relativeForStore.id = relative.relativeId;
    } else if (relative.relative_id) {
      relativeForStore.id = relative.relative_id;
    }

    // Прокидываем isFirstClient/isFirstRelative
    if (isEditMode) {
      relativeForStore.isFirstClient =
        relative.isFirstClient ?? relative.isFirstRelative;
    }

    return relativeForStore;
  };

  /**
   * Инициализирует родственников для режима редактирования
   * @param {Object} params - Параметры инициализации
   * @param {Array} params.relatives - Массив родственников из пропсов
   * @param {Function} params.setRelativeOfEdit - Функция добавления родственника в хранилище
   * @param {Object} params.tempRelatives - Временный кэш
   * @param {Function} params.addOneMoreRelatives - Функция добавления нового родственника
   * @returns {Object} Результат инициализации
   */
  initializeEditModeRelatives = ({
    relatives,
    setRelativeOfEdit,
    tempRelatives,
    addOneMoreRelatives,
  }) => {
    // Проверяем, есть ли вообще родственники в массиве
    if (!relatives || relatives.length === 0) {
      return {
        action: "add_new",
        shouldAddNew: true,
      };
    }

    const processedRelatives = [];

    relatives.forEach((relative, index) => {
      const relativeForStore = this.transformRelativeFromProps(relative, true);

      if (relativeForStore) {
        // Добавляем родственника в хранилище
        setRelativeOfEdit(relativeForStore);
        processedRelatives.push(relativeForStore);

        // Синхронизируем временный кэш с id+1, чтобы соответствовать ожидаемым индексам UI
        tempRelatives[index + 1] = { ...relativeForStore };
      }
    });

    if (processedRelatives.length > 0) {
      const firstRelative = processedRelatives[0];
      const currentRelativeId = firstRelative.id || 1;

      // Обновляем временный кэш для текущего ID
      if (!tempRelatives[currentRelativeId]) {
        tempRelatives[currentRelativeId] = { ...firstRelative };
      }

      return {
        action: "set_first_relative",
        currentRelativeId,
        shouldCloseEditing: true,
        firstRelative,
        processedCount: processedRelatives.length,
      };
    } else {
      return {
        action: "add_new_fallback",
        shouldAddNew: true,
        warning: "Первый родственник не найден после добавления в хранилище",
      };
    }
  };

  /**
   * Инициализирует родственников для режима добавления или обычного режима
   * @param {Object} params - Параметры инициализации
   * @param {Array} params.relatives - Массив родственников из пропсов
   * @param {Function} params.setRelativeOfEdit - Функция добавления родственника в хранилище
   * @param {Object} params.tempRelatives - Временный кэш
   * @param {Function} params.addOneMoreRelatives - Функция добавления нового родственника
   * @returns {Object} Результат инициализации
   */
  initializeAddModeRelatives = ({
    relatives,
    setRelativeOfEdit,
    tempRelatives,
    addOneMoreRelatives,
  }) => {
    if (relatives && relatives.length > 0) {
      const processedRelatives = [];

      relatives.forEach((relative, index) => {
        const relativeForStore = this.transformRelativeFromProps(
          relative,
          false,
        );

        if (relativeForStore) {
          setRelativeOfEdit(relativeForStore);
          processedRelatives.push(relativeForStore);
          tempRelatives[index + 1] = { ...relativeForStore };
        }
      });

      if (processedRelatives.length > 0) {
        return {
          action: "set_first_relative",
          currentRelativeId: 1,
          shouldCloseEditing: true,
          formValues: { ...tempRelatives[1] },
          processedCount: processedRelatives.length,
        };
      }
    }

    return {
      action: "add_new",
      shouldAddNew: true,
    };
  };

  /**
   * Обрабатывает полную инициализацию компонента родственников
   * @param {Object} params - Параметры полной инициализации
   * @param {Object} params.actionType - Тип действия и данные
   * @param {Function} params.resetStore - Функция сброса хранилища
   * @param {Function} params.clearTempCache - Функция очистки временного кэша
   * @param {Function} params.setRelativeOfEdit - Функция добавления родственника в хранилище
   * @param {Object} params.tempRelatives - Временный кэш
   * @param {Function} params.addOneMoreRelatives - Функция добавления нового родственника
   * @returns {Object} Результат полной инициализации
   */
  handleFullInitialization = ({
    actionType,
    resetStore,
    clearTempCache,
    setRelativeOfEdit,
    tempRelatives,
    addOneMoreRelatives,
  }) => {
    // Сбрасываем хранилище и очищаем кэш
    resetStore();
    clearTempCache(tempRelatives);

    if (actionType?.type === "edit" && actionType.family?.relatives) {
      return this.initializeEditModeRelatives({
        relatives: actionType.family.relatives,
        setRelativeOfEdit,
        tempRelatives,
        addOneMoreRelatives,
      });
    } else if (actionType?.type === "add" && !actionType?.family?.relatives) {
      return {
        action: "add_new_client",
        shouldAddNew: true,
      };
    } else if (actionType?.family?.relatives) {
      // Данные из поиска семьи обрабатываем как режим добавления, но с данными
      return this.initializeAddModeRelatives({
        relatives: actionType.family.relatives,
        setRelativeOfEdit,
        tempRelatives,
        addOneMoreRelatives,
      });
    }

    return {
      action: "no_action",
      message: "Нет подходящих условий для инициализации",
    };
  };

  /**
   * Проверяет нужно ли инициализировать компонент при монтировании
   * @param {Object} params - Параметры проверки
   * @param {boolean} params.isInitialized - Флаг инициализации
   * @param {number} params.relativesCount - Количество родственников в хранилище
   * @param {Object} params.actionType - Тип действия
   * @returns {Object} Результат проверки
   */
  shouldInitializeOnMount = ({ isInitialized, relativesCount, actionType }) => {
    if (
      !isInitialized &&
      relativesCount === 0 &&
      actionType?.type !== "edit" &&
      !(actionType?.family?.relatives && actionType.family.relatives.length > 0)
    ) {
      return {
        shouldInitialize: true,
        action: "add_new",
        reason: "empty_store_no_preloaded_data",
      };
    }

    return {
      shouldInitialize: false,
      reason: isInitialized ? "already_initialized" : "data_handled_by_watcher",
    };
  };
}
