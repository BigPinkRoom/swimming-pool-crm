import RelativeEntity from "@/entities/relativeEntity";

/**
 * Класс для управления родственниками.
 * @class Relatives
 */
export default class Relatives {
  /**
   * Создает экземпляр класса Relatives.
   * @param {Object} context - Контекст приложения.
   */
  constructor(context) {
    this.context = context;

    this.relativesEntity = new RelativeEntity({ context });
  }

  /**
   * Преобразует список типов родственников для использования в select.
   * @private
   * @param {Array<Object>} typesList - Список типов родственников из API.
   * Each object in typesList should have at least `name` and `relativeTypeId` properties.
   * @returns {Array<Object>|undefined} Обработанный список типов, где каждый объект содержит `text` (локализованное имя) и `value` (ID типа), или undefined если typesList не предоставлен.
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
   * Добавляет переводы для типов родственников.
   * @private
   * @param {Array<Object>} typesList - Список типов родственников (уже частично обработанный, например, функцией _addRelativeTypesToSelect).
   * Each object in typesList should have `text` and `relative_type_id` (or similar for value).
   * @returns {Array<Object>|undefined} Список с переведенными текстами (text) и установленными ID (value), или undefined если typesList не предоставлен.
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
   * Получает типы родственников с сервера.
   * @async
   * @param {Object} [options={}] - Параметры запроса.
   * @param {Array<Object>} [options.sortings=[]] - Сортировка.
   * @param {Object} [options.filters={}] - Фильтры.
   * @param {Object|null} [options.context=null] - Контекст (не используется в текущей реализации).
   * @returns {Promise<Array<Object>|undefined>} Список типов родственников, отформатированный для select, или undefined в случае ошибки.
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
   * Разделяет список родственников на секции относительно активного.
   * @param {Array<Object>} relatives - Список родственников.
   * @param {number|string} activeId - ID или индекс активного родственника (индекс начиная с 1).
   * @returns {Object} Объект с секциями: `before` (массив объектов), `active` (объект или null), `after` (массив объектов).
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
   * Проверяет достигнут ли максимальный лимит родственников.
   * @param {Array<Object>} relatives - Список родственников.
   * @param {number} [maxLimit=10] - Максимальный лимит.
   * @returns {boolean} Результат проверки (true, если лимит достигнут, иначе false).
   */
  isMaxRelativesLimitReached = (relatives, maxLimit = 10) => {
    return relatives.length >= maxLimit;
  };

  /**
   * Создает новый ID для родственника (используется, если ID не приходит с бэкенда для нового элемента).
   * Важно: этот ID временный и локальный, реальный ID должен присваиваться сервером.
   * @param {Array<Object>} relatives - Список родственников, у которых есть свойство `id`.
   * @returns {number} Новый ID, на 1 больше максимального существующего, или 1 если список пуст.
   */
  createNewRelativeId = (relatives) => {
    if (!relatives || relatives.length === 0) return 1;
    return Math.max(...relatives.map((relative) => Number(relative.id))) + 1;
  };

  /**
   * Создает нового родственника с использованием RelativeEntity.
   * @param {number|string} id - ID нового родственника.
   * @returns {Object} Новый объект родственника со стандартными полями.
   */
  createNewRelative = (id) => {
    return this.relativesEntity.createNewRelative(id);
  };

  /**
   * Переназначает индексы для родственников.
   * В текущей реализации функция не выполняет никаких действий, так как ID присваивается сервером.
   * @param {Array<Object>} relatives - Список родственников.
   * @returns {void}
   */
  reassignRelativeIds = (relatives) => {
    // Вместо назначения ID мы ничего не делаем, так как используем индексы
    // Для родственников без ID с сервера (новых)
    // А ID должен присваивать сервер при сохранении
  };

  /**
   * Удаляет родственника по индексу из массива.
   * @param {Array<Object>} relatives - Список родственников.
   * @param {number} index - Индекс для удаления (0-based).
   * @returns {void}
   */
  removeRelativeByIndex = (relatives, index) => {
    relatives.splice(index, 1);
  };

  /**
   * Находит индекс родственника по ID или по порядковому номеру (1-based index).
   * @param {Array<Object>} relatives - Список родственников. Каждый родственник должен иметь свойство `id`.
   * @param {number|string} idOrIndex - ID родственника или его порядковый номер в списке (начиная с 1).
   * @returns {number} Индекс родственника в массиве (0-based) или -1, если не найден.
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
   * Находит родственника по ID или по порядковошему номеру (1-based index).
   * @param {Array<Object>} relatives - Список родственников. Каждый родственник должен иметь свойство `id`.
   * @param {number|string} idOrIndex - ID родственника или его порядковый номер в списке (начиная с 1).
   * @returns {Object|null} Найденный объект родственника или null, если не найден.
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
   * Обновляет активного родственника после удаления другого родственника.
   * @param {Object} params - Параметры обновления.
   * @param {Array<Object>} params.relatives - Список родственников после удаления.
   * @param {Ref<number|string|null>} params.currentRelativeId - Реактивная ссылка на ID текущего активного родственника.
   * @param {number|string} params.deletedRelativeId - ID или индекс удаленного родственника.
   * @param {number} params.index - Индекс (0-based) удаленного родственника в первоначальном списке.
   * @returns {void}
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

  /**
   * Асинхронно получает данные родственника по его ID с сервера.
   * @param {number|string} id - ID родственника.
   * @returns {Promise<Object|null>} Промис, который разрешается с объектом родственника или null.
   */
  getRelativeById = async (id) => {
    const params = {
      id,
    };
    const relative = await this.context.$api.relatives.getRelativeById(params);

    return relative;
  };

  /**
   * Создает пустой объект родственника со значениями по умолчанию.
   * @returns {Object} Пустой объект родственника (name, surname, patronymic, relativeTypeId, telephone).
   */
  createEmptyRelative = () => {
    // Создаем объект через литерал для обеспечения правильного прототипа
    const emptyRelative = {};
    emptyRelative.name = "";
    emptyRelative.surname = "";
    emptyRelative.patronymic = "";
    emptyRelative.relativeTypeId = 1;
    emptyRelative.telephone = "";

    return emptyRelative;
  };

  /**
   * Получает временные данные родственника по индексу или ID, или создает новые, если их нет.
   * @param {Object} tempRelatives - Объект для временного хранения данных родственников (ключ - ID или индекс).
   * @param {Array<Object>} relatives - Основной массив родственников.
   * @param {number|string} indexOrId - Индекс (начиная с 1) или ID родственника.
   * @returns {Object} Данные родственника из временного хранилища или вновь созданные.
   */
  getTempRelativeData = (tempRelatives, relatives, indexOrId) => {
    // Если временные данные еще не созданы
    if (!tempRelatives[indexOrId]) {
      // Сначала попробуем найти родственника в основном хранилище
      const relative = this.findRelativeById(relatives, indexOrId);

      // Если нашли родственника в хранилище, используем его данные
      if (relative) {
        // Создаем объект через литерал для правильного прототипа
        tempRelatives[indexOrId] = {};
        tempRelatives[indexOrId].id = relative.id;
        tempRelatives[indexOrId].name = relative.name || "";
        tempRelatives[indexOrId].surname = relative.surname || "";
        tempRelatives[indexOrId].patronymic = relative.patronymic || "";
        tempRelatives[indexOrId].relativeTypeId = relative.relativeTypeId || 1;
        tempRelatives[indexOrId].telephone = relative.telephone || "";
      } else {
        // Если родственник не найден, создаем пустой объект
        tempRelatives[indexOrId] = this.createEmptyRelative();
      }
    }

    return tempRelatives[indexOrId];
  };

  /**
   * Очищает временный кэш родственников (удаляет все ключи из объекта).
   * @param {Object} tempRelatives - Объект временного кэша.
   * @returns {void}
   */
  clearTempRelativesCache = (tempRelatives) => {
    Object.keys(tempRelatives).forEach((key) => delete tempRelatives[key]);
  };

  /**
   * Генерирует текст для кнопки добавления родственника в зависимости от текущего количества и лимита.
   * @param {Array<Object>} relatives - Массив родственников.
   * @param {number} [maxLimit=10] - Максимальное количество родственников.
   * @returns {string} Текст кнопки.
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
   * Добавляет нового (пустого) родственника в массив, если не достигнут лимит.
   * @param {Array<Object>} relatives - Массив родственников.
   * @param {number} [maxLimit=10] - Максимальное количество родственников.
   * @returns {Object} Результат операции: { success: boolean, reason?: string, newRelative?: Object, newIndex?: number, relatives?: Array<Object> }.
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
   * Получает объект с пустыми значениями для сброса формы добавления/редактирования родственника.
   * @returns {Object} Объект с полями: name, surname, patronymic, relativeTypeId, telephone.
   */
  getEmptyFormValues = () => {
    // Создаем объект через литерал для обеспечения правильного прототипа
    const formValues = {};
    formValues.name = "";
    formValues.surname = "";
    formValues.patronymic = "";
    formValues.relativeTypeId = 1;
    formValues.telephone = "";

    return formValues;
  };

  /**
   * Обрабатывает добавление родственника с предварительной валидацией активного (редактируемого) родственника.
   * @async
   * @param {Object} params - Параметры обработки.
   * @param {Array<Object>} params.relatives - Массив родственников.
   * @param {Object} params.activeSections - Секции родственников (результат getRelativesSections).
   * @param {boolean} params.isEditing - Флаг, указывающий, находится ли форма в режиме редактирования.
   * @param {Function} params.validate - Асинхронная функция валидации формы (например, из VeeValidate).
   * @param {Function} params.updateActiveRelative - Функция для обновления данных активного родственника в основном хранилище.
   * @param {Object} params.currentTempRelative - Текущие данные временного (редактируемого) родственника из формы.
   * @param {string|number} params.currentRelativeId - ID или индекс текущего активного родственника.
   * @param {number} [params.maxLimit=10] - Максимальное количество родственников.
   * @returns {Promise<Object>} Результат операции: { success: boolean, reason?: string, newIndex?: number, shouldCloseEditing?: boolean, shouldOpenEditing?: boolean, formValues?: Object }.
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
   * Обрабатывает сохранение активного (редактируемого) родственника и, если возможно, добавляет нового.
   * @async
   * @param {Object} params - Параметры обработки.
   * @param {Array<Object>} params.relatives - Массив родственников.
   * @param {Object} params.activeSections - Секции родственников (особенно важен activeSections.active).
   * @param {Function} params.validate - Асинхронная функция валидации формы.
   * @param {Function} params.updateActiveRelative - Функция для обновления данных активного родственника.
   * @param {Object} params.currentTempRelative - Текущие данные временного родственника из формы.
   * @param {string|number} params.activeIndex - ID или индекс активного родственника, который сохраняется.
   * @param {number} [params.maxLimit=10] - Максимальное количество родственников.
   * @returns {Promise<Object>} Результат: { success: boolean, reason?: string, newIndex?: number, shouldOpenEditing?: boolean, formValues?: Object, shouldCloseEditing?: boolean, error?: Error }.
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
   * Получает значения формы для указанного родственника.
   * @param {Object} relative - Данные родственника.
   * @param {string} [relative.name=""] - Имя.
   * @param {string} [relative.surname=""] - Фамилия.
   * @param {string} [relative.patronymic=""] - Отчество.
   * @param {number|string} [relative.relativeTypeId=1] - ID типа родства.
   * @param {string} [relative.telephone=""] - Телефон.
   * @returns {Object} Значения для формы (name, surname, patronymic, relativeTypeId, telephone).
   */
  getRelativeFormValues = (relative) => {
    // Создаем объект через литерал для обеспечения правильного прототипа
    const formValues = {};
    formValues.name = relative.name || "";
    formValues.surname = relative.surname || "";
    formValues.patronymic = relative.patronymic || "";
    formValues.relativeTypeId = relative.relativeTypeId || 1;
    formValues.telephone = relative.telephone || "";

    return formValues;
  };

  /**
   * Проверяет и обновляет временный кэш для родственника на основе данных из основного хранилища.
   * @param {Object} tempRelatives - Временный кэш (объект, где ключи - ID или индексы).
   * @param {Array<Object>} relatives - Массив родственников из основного хранилища.
   * @param {number|string} index - Индекс (1-based) или ID родственника, для которого обновляется кэш.
   * @returns {Object|undefined} Обновленные данные для кэша или undefined, если родственник не найден.
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
   * Находит первого несохраненного родственника (у которого отсутствует `id`) в массиве.
   * @param {Array<Object>} relatives - Массив родственников.
   * @returns {Object} Объект с результатами: { index: number, relative: Object|undefined, exists: boolean }.
   * `index` - 0-based индекс найденного родственника, или -1.
   * `relative` - объект несохраненного родственника, или undefined.
   * `exists` - true, если несохраненный родственник найден.
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
   * Удаляет родственника из массива и соответствующую запись из временного кэша.
   * @param {Object} params - Параметры удаления.
   * @param {Array<Object>} params.relatives - Массив родственников (мутируется).
   * @param {Object} params.tempRelatives - Временный кэш (мутируется).
   * @param {number|string} params.index - Индекс (1-based) или ID родственника для удаления.
   * @returns {Object} Результат операции: { success: boolean, reason?: string, message?: string, deletedIndex?: number, relativesCount?: number }.
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
   * Определяет следующего активного родственника после операции удаления.
   * @param {Object} params - Параметры для определения.
   * @param {Array<Object>} params.relatives - Массив родственников (уже после удаления).
   * @param {Function} params.getTempRelative - Функция для получения временных данных родственника (например, getTempRelativeData).
   * @param {Function} params.addOneMoreRelatives - Функция для добавления нового пустого родственника (если массив пуст).
   * @returns {Object} Результат с указанием действия и данных для следующего активного родственника:
   * { action: string, shouldAddNew?: boolean, currentRelativeId?: number|string, formValues?: Object, shouldOpenEditing?: boolean, shouldCloseEditing?: boolean }.
   * Возможные `action`: "add_new", "switch_to_unsaved", "switch_to_first".
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
   * Полная обработка удаления родственника, включая удаление из хранилищ и определение следующего активного.
   * @param {Object} params - Параметры обработки удаления.
   * @param {Array<Object>} params.relatives - Массив родственников.
   * @param {Object} params.tempRelatives - Временный кэш.
   * @param {number|string} params.index - Индекс или ID родственника для удаления.
   * @param {Function} params.getTempRelative - Функция получения временного родственника.
   * @param {Function} params.addOneMoreRelatives - Функция добавления нового родственника.
   * @returns {Object} Результат полной обработки: { success: boolean, deleteResult?: object, nextActive?: object, reason?: string, message?: string }.
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
   * Получает текстовое представление типа родственника по его ID из предоставленного списка типов.
   * @param {Array<Object>} relativesTypes - Список типов родственников (каждый объект должен иметь `value` и `text`).
   * @param {number|string} relativeId - ID типа родственника.
   * @returns {string|undefined} Название типа родственника или undefined, если тип не найден.
   */
  getRelativeTypeById = (relativesTypes, relativeId) => {
    const relativeType = relativesTypes?.find(
      (type) => type.value === relativeId,
    );
    return relativeType?.text;
  };

  /**
   * Сохраняет данные текущего редактируемого родственника (если `isEditing` true) в основное и временное хранилища.
   * @param {Object} params - Параметры сохранения.
   * @param {boolean} params.isEditing - Флаг, указывающий, находится ли форма в режиме редактирования.
   * @param {Object} params.currentTempRelative - Текущие данные временного (редактируемого) родственника из формы.
   * @param {Function} params.updateActiveRelative - Функция для обновления данных активного родственника в основном хранилище.
   * @param {string|number} params.currentRelativeId - ID или индекс текущего активного родственника.
   * @param {Object} params.tempRelatives - Временный кэш для обновления.
   * @returns {Object} Результат сохранения: { saved: boolean, savedRelative?: Object }.
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
   * Обрабатывает переключение в режим редактирования для указанного родственника.
   * Сохраняет текущего редактируемого родственника (если был), затем устанавливает нового активного и загружает его данные в форму.
   * @param {Object} params - Параметры переключения.
   * @param {string|number} params.index - Индекс (1-based) или ID родственника, для которого включается режим редактирования.
   * @param {boolean} params.isEditing - Текущий флаг редактирования (до переключения).
   * @param {Object} params.currentTempRelative - Текущие данные временного родственника из формы (до переключения).
   * @param {Function} params.updateActiveRelative - Функция обновления активного родственника в основном хранилище.
   * @param {string|number} params.currentRelativeId - ID или индекс текущего активного родственника (до переключения).
   * @param {Object} params.tempRelatives - Временный кэш.
   * @param {Array<Object>} params.relatives - Массив родственников из основного хранилища.
   * @param {Function} params.getTempRelative - Функция для получения временных данных родственника (например, getTempRelativeData).
   * @returns {Object} Результат операции: { success: boolean, newRelativeId: string|number, shouldOpenEditing: boolean, formValues: Object, saveResult: Object }.
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
   * Подготавливает данные для установки в форму при переключении на несохраненного родственника.
   * @param {number} index - 0-based индекс несохраненного родственника в массиве.
   * @param {Object} relative - Объект данных несохраненного родственника.
   * @returns {Object} Объект с полями: `currentRelativeId` (1-based), `formValues`, `shouldOpenEditing`.
   */
  prepareUnsavedRelativeData = (index, relative) => {
    return {
      currentRelativeId: index + 1,
      formValues: this.getRelativeFormValues(relative),
      shouldOpenEditing: true,
    };
  };

  /**
   * Преобразует данные родственника, полученные из props компонента, в формат, используемый внутри сервиса/хранилища.
   * @param {Object|null} relative - Данные родственника из props. Может содержать поля с префиксами `relative` (например, `relativeName`) или без них.
   * @param {boolean} [isEditMode=false] - Флаг, указывающий, применяются ли данные в контексте редактирования (влияет на приоритет полей).
   * @returns {Object|null} Преобразованный объект родственника или null, если входной объект `relative` равен null.
   * Поля в выходном объекте: name, surname, patronymic, relativeTypeId, telephone, id?, isFirstClient?.
   */
  transformRelativeFromProps = (relative, isEditMode = false) => {
    if (!relative) return null;

    // Создаем объект через литерал для обеспечения правильного прототипа
    const relativeForStore = {};

    if (isEditMode) {
      relativeForStore.name = relative.relativeName || relative.name || "";
      relativeForStore.surname =
        relative.relativeSurname || relative.surname || "";
      relativeForStore.patronymic =
        relative.relativePatronymic || relative.patronymic || "";
      relativeForStore.relativeTypeId =
        relative.relativeTypeId || relative.relative_type_id || 1;
      relativeForStore.telephone =
        relative.telephone || relative.relativeTelephone || "";
    } else {
      relativeForStore.name = relative.name || "";
      relativeForStore.surname = relative.surname || "";
      relativeForStore.patronymic = relative.patronymic || "";
      relativeForStore.relativeTypeId =
        relative.relativeTypeId || relative.relative_type_id || 1;
      relativeForStore.telephone = relative.telephone || "";
    }

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
   * Инициализирует состояние родственников для режима редактирования существующей семьи.
   * @param {Object} params - Параметры инициализации.
   * @param {Array<Object>|undefined} params.relatives - Массив родственников из данных семьи (например, `actionType.family.relatives`).
   * @param {Function} params.setRelativeOfEdit - Функция для добавления/установки родственника в основное хранилище.
   * @param {Object} params.tempRelatives - Временный кэш для синхронизации.
   * @param {Function} params.addOneMoreRelatives - Функция для добавления нового пустого родственника (если начальный массив пуст).
   * @returns {Object} Результат инициализации, указывающий следующее действие и необходимые данные:
   * { action: string, shouldAddNew?: boolean, currentRelativeId?: number|string, shouldCloseEditing?: boolean, firstRelative?: Object, processedCount?: number, warning?: string }.
   * Возможные `action`: "add_new", "set_first_relative", "add_new_fallback".
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
   * Инициализирует состояние родственников для режима добавления новой семьи или при загрузке данных не из режима редактирования.
   * @param {Object} params - Параметры инициализации.
   * @param {Array<Object>|undefined} params.relatives - Массив родственников из данных (например, `actionType.family.relatives` при поиске семьи).
   * @param {Function} params.setRelativeOfEdit - Функция для добавления/установки родственника в основное хранилище.
   * @param {Object} params.tempRelatives - Временный кэш для синхронизации.
   * @param {Function} params.addOneMoreRelatives - Функция для добавления нового пустого родственника.
   * @returns {Object} Результат инициализации:
   * { action: string, currentRelativeId?: number|string, shouldCloseEditing?: boolean, formValues?: Object, processedCount?: number, shouldAddNew?: boolean }.
   * Возможные `action`: "set_first_relative", "add_new".
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
   * Обрабатывает полную инициализацию компонента управления родственниками на основе `actionType`.
   * Сбрасывает хранилища и кэш, затем вызывает соответствующий метод инициализации (для редактирования или добавления).
   * @param {Object} params - Параметры полной инициализации.
   * @param {Object|undefined} params.actionType - Тип действия и связанные данные (например, из родительского компонента).
   * @param {string} [params.actionType.type] - Тип действия ('edit', 'add', etc.).
   * @param {Object} [params.actionType.family] - Данные семьи, если есть.
   * @param {Array<Object>} [params.actionType.family.relatives] - Список родственников семьи.
   * @param {Function} params.resetStore - Функция полного сброса основного хранилища родственников.
   * @param {Function} params.clearTempCache - Функция очистки временного кэша родственников.
   * @param {Function} params.setRelativeOfEdit - Функция добавления/установки родственника в основное хранилище.
   * @param {Object} params.tempRelatives - Временный кэш.
   * @param {Function} params.addOneMoreRelatives - Функция добавления нового пустого родственника.
   * @returns {Object} Результат, возвращаемый `initializeEditModeRelatives`, `initializeAddModeRelatives` или
   * { action: string, message?: string, shouldAddNew?: boolean } в других случаях.
   * Возможные `action`: "add_new_client", "no_action", или те, что возвращают вложенные функции.
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
   * Проверяет, нужно ли инициализировать компонент при его монтировании (onMounted).
   * Инициализация нужна, если компонент еще не был инициализирован, в хранилище нет родственников,
   * и нет предзагруженных данных (не режим редактирования и нет `actionType.family.relatives`).
   * @param {Object} params - Параметры проверки.
   * @param {boolean} params.isInitialized - Флаг, был ли компонент уже инициализирован.
   * @param {number} params.relativesCount - Текущее количество родственников в основном хранилище.
   * @param {Object|undefined} params.actionType - Текущий тип действия и связанные данные.
   * @returns {Object} Результат проверки: { shouldInitialize: boolean, action?: string, reason: string }.
   * `action` будет "add_new", если `shouldInitialize` true.
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

  /**
   * Обрабатывает общий результат действия от одной из сервисных функций и генерирует массив инструкций для компонента.
   * @param {Object} result - Объект результата от сервисной функции.
   * @param {boolean} result.success - Флаг успешности операции.
   * @param {string} [result.reason] - Причина неудачи (если success=false).
   * @param {string} [result.message] - Сообщение об ошибке.
   * @param {boolean} [result.shouldCloseEditing] - Флаг, нужно ли закрыть режим редактирования.
   * @param {boolean} [result.shouldOpenEditing] - Флаг, нужно ли открыть режим редактирования.
   * @param {number|string} [result.newIndex] - Новый индекс/ID для активного элемента.
   * @param {Object} [result.formValues] - Значения для сброса формы.
   * @param {number|string} [result.newRelativeId] - Новый ID родственника для установки активным.
   * @param {Object} [componentState={}] - Текущее состояние компонента (не используется в этой функции).
   * @returns {Object} Объект с полями: `actions` (массив объектов инструкций) и `shouldContinue` (boolean).
   * Инструкции в `actions` могут иметь `type`: "error", "setEditing", "setCurrentRelativeId", "setShowOneMore", "resetForm".
   */
  handleActionResult = (result, componentState = {}) => {
    const actions = [];

    if (!result.success && result.reason) {
      actions.push({
        type: "error",
        reason: result.reason,
        message: result.message,
      });
      return { actions, shouldContinue: false };
    }

    if (result.shouldCloseEditing) {
      actions.push({ type: "setEditing", value: false });
    }

    if (result.shouldOpenEditing) {
      actions.push({ type: "setEditing", value: true });
    }

    if (result.newIndex !== undefined) {
      actions.push({ type: "setCurrentRelativeId", value: result.newIndex });
      actions.push({ type: "setShowOneMore", value: true });
    }

    if (result.formValues) {
      actions.push({ type: "resetForm", values: result.formValues });
    }

    if (result.newRelativeId !== undefined) {
      actions.push({
        type: "setCurrentRelativeId",
        value: result.newRelativeId,
      });
    }

    return { actions, shouldContinue: true };
  };

  /**
   * Обрабатывает результат инициализации (от `handleFullInitialization` или `initializeEditModeRelatives` / `initializeAddModeRelatives`)
   * и генерирует массив инструкций для компонента.
   * @param {Object} result - Результат инициализации.
   * @param {string} result.action - Строковый ключ, описывающий действие, которое было выполнено или должно быть выполнено.
   * @param {boolean} [result.shouldAddNew] - Нужно ли добавить нового пустого родственника.
   * @param {string} [result.warning] - Предупреждающее сообщение.
   * @param {string|number} [result.currentRelativeId] - ID/индекс для установки активным.
   * @param {boolean} [result.shouldCloseEditing] - Нужно ли закрыть режим редактирования.
   * @param {Object} [result.formValues] - Значения для сброса формы.
   * @param {Function} getTempRelative - Функция для получения данных временного родственника (например, `getTempRelativeData`).
   * @returns {Object} Объект с полем `actions` (массив объектов инструкций).
   * Инструкции могут иметь `type`: "addOneMore", "warning", "setCurrentRelativeId", "setEditing", "resetForm", "setInitialized".
   */
  handleInitializationResult = (result, getTempRelative) => {
    const actions = [];

    switch (result.action) {
      case "add_new":
      case "add_new_client":
      case "add_new_fallback":
        if (result.shouldAddNew) {
          actions.push({ type: "addOneMore" });
        }
        if (result.warning) {
          actions.push({ type: "warning", message: result.warning });
        }
        break;

      case "set_first_relative":
        actions.push({
          type: "setCurrentRelativeId",
          value: result.currentRelativeId,
        });

        if (result.shouldCloseEditing) {
          actions.push({ type: "setEditing", value: false });
        }

        if (result.formValues) {
          actions.push({ type: "resetForm", values: result.formValues });
        } else {
          // Получаем данные из временного кэша для текущего родственника
          const currentRelativeData = getTempRelative(result.currentRelativeId);
          const formValues = this.getRelativeFormValues(currentRelativeData);
          actions.push({ type: "resetForm", values: formValues });
        }
        break;

      case "no_action":
        // Ничего не делаем
        break;
    }

    actions.push({ type: "setInitialized", value: true });
    return { actions };
  };

  /**
   * Обрабатывает результат удаления родственника (от `handleRelativeDeletion`) и генерирует массив инструкций.
   * @param {Object} result - Результат операции удаления.
   * @param {boolean} result.success - Флаг успешности.
   * @param {string} [result.reason] - Причина ошибки (если success=false).
   * @param {string} [result.message] - Сообщение об ошибке.
   * @param {Object} [result.nextActive] - Информация о следующем активном элементе.
   * @param {string} [result.nextActive.action] - Действие для следующего активного.
   * @param {string|number} [result.nextActive.currentRelativeId] - ID/индекс следующего активного.
   * @param {Object} [result.nextActive.formValues] - Значения формы для следующего активного.
   * @param {boolean} [result.nextActive.shouldOpenEditing] - Открыть ли редактирование для следующего.
   * @param {boolean} [result.nextActive.shouldCloseEditing] - Закрыть ли редактирование для следующего.
   * @returns {Object} Объект с полями `actions` (массив инструкций) и `shouldContinue` (boolean).
   * Инструкции могут иметь `type`: "error", "addOneMore", "setCurrentRelativeId", "resetForm", "setEditing".
   */
  handleDeletionResult = (result) => {
    const actions = [];

    if (!result.success) {
      if (result.reason === "relative_not_found") {
        actions.push({ type: "error", message: result.message });
      }
      return { actions, shouldContinue: false };
    }

    const { nextActive } = result;

    switch (nextActive.action) {
      case "add_new":
        actions.push({ type: "addOneMore" });
        break;

      case "switch_to_unsaved":
        actions.push({
          type: "setCurrentRelativeId",
          value: nextActive.currentRelativeId,
        });
        actions.push({ type: "resetForm", values: nextActive.formValues });
        if (nextActive.shouldOpenEditing) {
          actions.push({ type: "setEditing", value: true });
        }
        break;

      case "switch_to_first":
        actions.push({
          type: "setCurrentRelativeId",
          value: nextActive.currentRelativeId,
        });
        actions.push({ type: "resetForm", values: nextActive.formValues });
        if (nextActive.shouldCloseEditing) {
          actions.push({ type: "setEditing", value: false });
        }
        break;
    }

    return { actions, shouldContinue: true };
  };

  /**
   * Вычисляет правильный индекс для элемента в секции (before/after) для использования в `v-for` ключах или ID.
   * Если у элемента есть свой `id`, используется он. Иначе вычисляется на основе позиции.
   * @param {Object} item - Элемент родственника, может иметь свойство `id`.
   * @param {Array<Object>} beforeSection - Массив элементов в секции 'before' (используется для расчета индекса в секции 'after').
   * @param {number} index - 0-based индекс элемента в его текущей секции (`section`).
   * @param {string} [section="before"] - Тип секции ('before' или 'after').
   * @returns {number|string} ID элемента или вычисленный 1-based индекс.
   */
  calculateItemIndex = (item, beforeSection, index, section = "before") => {
    if (item.id) {
      return item.id;
    }

    switch (section) {
      case "before":
        return index + 1;
      case "after":
        return beforeSection.length + 1 + index + 1;
      default:
        return index + 1;
    }
  };

  /**
   * Инициализирует (загружает и сохраняет) типы родственников в соответствующее хранилище (store).
   * @async
   * @param {Function} setRelativesTypes - Функция из Pinia store для сохранения загруженных типов родственников.
   * @returns {Promise<Array<Object>>} Промис, который разрешается с массивом загруженных и обработанных типов родственников.
   */
  initializeRelativeTypes = async (setRelativesTypes) => {
    const relativeTypesData = await this.getTypes();
    setRelativesTypes(relativeTypesData);
    return relativeTypesData;
  };
}
