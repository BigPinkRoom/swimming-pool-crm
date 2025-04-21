export default class RelativeEntity {
  /**
   * Конструктор класса RelativeEntity.
   * Инициализирует контекст и i18n-функцию перевода.
   * @param {Object} options - Опции, включая контекст.
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
   */
  createNewRelative = (id) => ({
    id: id,
    name: "",
    surname: "",
    patronymic: "",
    relativeTypeId: 1,
    telephone: null,
    isNew: true,
  });

  /**
   * Проверяет, все ли поля родственника пустые.
   * @param {Object} currentTempRelative - Объект родственника для проверки.
   * @returns {boolean} - true, если все поля пустые, иначе false.
   */
  checkValuesForValidateReset = (currentTempRelative) => {
    const fieldsCheck = [
      Boolean(currentTempRelative.value.name),
      Boolean(currentTempRelative.value.surname),
      Boolean(currentTempRelative.value.patronymic),
      Boolean(currentTempRelative.value.relativeTypeId),
      Boolean(currentTempRelative.value.telephone),
    ].every((field) => field === false);

    return fieldsCheck;
  };

  /**
   * Возвращает тип родственника по его имени.
   * @param {string} name - Название типа родственника.
   * @returns {string|null} - Тип родственника или null, если не найдено.
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
   * @param {string|number} id - ID типа родственника.
   * @returns {string|number} - ID типа родственника.
   */
  setRelativeTypeId(id) {
    return id;
  }

  /**
   * Возвращает перевод типа родственника.
   * @param {string} type - Тип родственника для перевода.
   * @returns {string} - Переведенное значение типа родственника.
   */
  setRelativeTypeTranslate(type) {
    return this.t(
      `forms.client.add.fieldsets.relatives.fields.type.options.${type}`
    );
  }
}
