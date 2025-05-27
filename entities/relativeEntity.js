/**
 * @file Класс RelativeEntity представляет собой сущность "родственник" и предоставляет методы для работы с ней.
 * Включает создание, валидацию, форматирование и сравнение данных о родственниках.
 */
export default class RelativeEntity {
  /**
   * Конструктор класса RelativeEntity.
   * Инициализирует контекст и i18n-функцию перевода.
   * @param {Object} [options={}] - Опции, включая контекст.
   * @param {Object} [options.context] - Контекст приложения или компонента.
   */
  constructor({ context } = {}) {
    this.context = context;

    const { $i18n } = useNuxtApp();
    this.t = $i18n.t;
  }

  /**
   * Создает новый объект родственника с заданным ID.
   * @param {string|number} id - Уникальный идентификатор родственника.
   * @returns {Object} - Объект родственника с пустыми полями.
   * @property {string|number} id - Уникальный идентификатор.
   * @property {string} name - Имя.
   * @property {string} surname - Фамилия.
   * @property {string} patronymic - Отчество.
   * @property {number} relativeTypeId - ID типа родства (по умолчанию 1).
   * @property {null|string} telephone - Номер телефона.
   */
  createNewRelative = (id) => ({
    id: id,
    name: "",
    surname: "",
    patronymic: "",
    relativeTypeId: 1,
    telephone: null,
  });

  /**
   * Проверяет, все ли поля родственника пустые.
   * Используется для определения, нужно ли сбрасывать валидацию формы.
   * @param {Object} currentTempRelative - Объект родственника для проверки. Предполагается, что это ref-объект Vue.
   * @param {Object} currentTempRelative.value - Значение ref-объекта, содержащее данные родственника.
   * @param {string} [currentTempRelative.value.name=""] - Имя родственника.
   * @param {string} [currentTempRelative.value.surname=""] - Фамилия родственника.
   * @param {string} [currentTempRelative.value.patronymic=""] - Отчество родственника.
   * @param {number} [currentTempRelative.value.relativeTypeId=1] - ID типа родства.
   * @param {string|null} [currentTempRelative.value.telephone=null] - Номер телефона.
   * @returns {boolean} - true, если все значимые поля пустые или имеют значения по умолчанию, иначе false.
   */
  checkValuesForValidateReset = (currentTempRelative) => {
    // Проверяем, что currentTempRelative и value существуют
    if (!currentTempRelative || !currentTempRelative.value) {
      return true;
    }

    const { name, surname, patronymic, relativeTypeId, telephone } =
      currentTempRelative.value;

    const fieldsCheck = [
      Boolean(name),
      Boolean(surname),
      Boolean(patronymic),
      Boolean(relativeTypeId && relativeTypeId !== 1), // 1 - значение по умолчанию
      Boolean(telephone),
    ].every((field) => field === false);

    return fieldsCheck;
  };

  /**
   * Возвращает каноническое имя типа родственника по его строковому представлению.
   * @param {string} name - Строковое представление типа родственника (например, "mother", "father").
   * @returns {string|null} - Каноническое имя типа родственника (например, "mother", "father") или null, если соответствие не найдено.
   */
  setRelativeTypeName(name) {
    const names = {
      mother: "mother",
      father: "father",
      grandmother: "grandmother",
      grandfather: "grandfather",
      brother: "brother",
      sister: "sister",
      aunt: "aunt",
      uncle: "uncle",
      cousin_brother: "cousinBrother",
      cousin_sister: "cousinSister",
      other: "other",
    };

    return names[name] || null;
  }

  /**
   * Возвращает ID типа родственника.
   * Этот метод просто возвращает переданный ID, предполагая, что он уже корректен.
   * @param {string|number} id - ID типа родственника.
   * @returns {string|number} - ID типа родственника.
   */
  setRelativeTypeId(id) {
    return id;
  }

  /**
   * Возвращает перевод типа родственника на основе ключа локализации.
   * @param {string} type - Тип родственника для перевода (ключ для поиска в файлах локализации).
   * @returns {string} - Переведенное значение типа родственника.
   */
  setRelativeTypeTranslate(type) {
    return this.t(
      `forms.client.add.fieldsets.relatives.fields.type.options.${type}`,
    );
  }

  /**
   * Создает начальные значения для формы добавления/редактирования родственника.
   * @returns {Object} - Объект с начальными значениями полей формы.
   * @property {string} name - Пустое имя.
   * @property {string} surname - Пустая фамилия.
   * @property {string} patronymic - Пустое отчество.
   * @property {number} relativeTypeId - ID типа родства по умолчанию (1).
   * @property {string} telephone - Пустой номер телефона.
   */
  getInitialFormValues = () => ({
    name: "",
    surname: "",
    patronymic: "",
    relativeTypeId: 1,
    telephone: "",
  });

  /**
   * Проверяет валидность номера телефона (базовая проверка).
   * Считает номер валидным, если он пустой (необязательное поле)
   * или содержит 10-11 цифр после удаления нецифровых символов (для российских номеров).
   * @param {string|null} telephone - Номер телефона для проверки.
   * @returns {boolean} - true, если номер валиден или не указан, иначе false.
   */
  isValidTelephone = (telephone) => {
    if (!telephone) return true; // Пустой номер считается валидным (необязательное поле)

    // Убираем все символы кроме цифр
    const digitsOnly = telephone.replace(/\D/g, "");

    // Проверяем, что номер содержит от 10 до 11 цифр (для российских номеров)
    return digitsOnly.length >= 10 && digitsOnly.length <= 11;
  };

  /**
   * Форматирует имя и фамилию родственника для отображения.
   * Возвращает "Имя Фамилия", "Имя" или "Фамилия" в зависимости от наличия данных.
   * Если оба поля пустые, возвращает пустую строку.
   * @param {Object} relative - Объект родственника.
   * @param {string} [relative.name] - Имя родственника.
   * @param {string} [relative.surname] - Фамилия родственника.
   * @returns {string} - Отформатированная строка с именем и/или фамилией, или пустая строка.
   */
  formatDisplayName = (relative) => {
    if (!relative) return "";

    const name = relative.name || "";
    const surname = relative.surname || "";

    if (!name && !surname) return "";
    if (!surname) return name;
    if (!name) return surname;

    return `${name} ${surname}`;
  };

  /**
   * Проверяет, является ли объект родственника "пустым" (все поля не заполнены или имеют значения по умолчанию).
   * @param {Object|null} relative - Объект родственника для проверки.
   * @param {string} [relative.name] - Имя родственника.
   * @param {string} [relative.surname] - Фамилия родственника.
   * @param {string} [relative.patronymic] - Отчество родственника.
   * @param {string|null} [relative.telephone] - Номер телефона.
   * @param {number} [relative.relativeTypeId] - ID типа родства.
   * @returns {boolean} - true, если родственник считается пустым, иначе false.
   */
  isEmptyRelative = (relative) => {
    if (!relative) return true;

    const { name, surname, patronymic, telephone, relativeTypeId } = relative;

    return (
      !name &&
      !surname &&
      !patronymic &&
      !telephone &&
      (!relativeTypeId || relativeTypeId === 1)
    ); // 1 - значение по умолчанию
  };

  /**
   * Создает копию объекта родственника, удаляя начальные/конечные пробелы из строковых полей
   * и устанавливая значения по умолчанию для `relativeTypeId` и `telephone`, если они не указаны.
   * Если исходный объект не предоставлен, возвращает новый пустой объект родственника.
   * @param {Object|null} relative - Исходный объект родственника.
   * @param {string|number} [relative.id] - ID родственника.
   * @param {string} [relative.name=""] - Имя.
   * @param {string} [relative.surname=""] - Фамилия.
   * @param {string} [relative.patronymic=""] - Отчество.
   * @param {number} [relative.relativeTypeId=1] - ID типа родства.
   * @param {string|null} [relative.telephone=""] - Номер телефона.
   * @returns {Object} - Очищенный объект родственника.
   * @property {string|number|undefined} id - ID родственника (если был).
   * @property {string} name - Обработанное имя.
   * @property {string} surname - Обработанная фамилия.
   * @property {string} patronymic - Обработанное отчество.
   * @property {number} relativeTypeId - ID типа родства.
   * @property {string} telephone - Обработанный номер телефона.
   */
  sanitizeRelative = (relative) => {
    if (!relative) return this.createNewRelative();

    return {
      id: relative.id,
      name: (relative.name || "").trim(),
      surname: (relative.surname || "").trim(),
      patronymic: (relative.patronymic || "").trim(),
      relativeTypeId: relative.relativeTypeId || 1,
      telephone: (relative.telephone || "").trim(),
    };
  };

  /**
   * Сравнивает два объекта родственников на равенство данных после их очистки (trim, значения по умолчанию).
   * @param {Object|null} relative1 - Первый объект родственника.
   * @param {Object|null} relative2 - Второй объект родственника.
   * @returns {boolean} - true, если данные родственников идентичны после очистки, иначе false.
   */
  areRelativesEqual = (relative1, relative2) => {
    if (!relative1 && !relative2) return true;
    if (!relative1 || !relative2) return false;

    const sanitized1 = this.sanitizeRelative(relative1);
    const sanitized2 = this.sanitizeRelative(relative2);

    return (
      sanitized1.name === sanitized2.name &&
      sanitized1.surname === sanitized2.surname &&
      sanitized1.patronymic === sanitized2.patronymic &&
      sanitized1.relativeTypeId === sanitized2.relativeTypeId &&
      sanitized1.telephone === sanitized2.telephone
    );
  };

  /**
   * Создает уникальный ключ для элемента списка родственников (например, для использования в `v-for`).
   * Использует ID родственника, если он доступен, в противном случае использует индекс элемента.
   * @param {Object} relative - Объект родственника.
   * @param {string|number} [relative.id] - ID родственника.
   * @param {number} index - Индекс элемента в массиве.
   * @param {string} [prefix="relative"] - Префикс для генерируемого ключа.
   * @returns {string} - Уникальный ключ в формате "prefix-id" или "prefix-index".
   */
  createRelativeKey = (relative, index, prefix = "relative") => {
    if (relative?.id) {
      return `${prefix}-${relative.id}`;
    }
    return `${prefix}-${index}`;
  };
}
