import {
  userSignInValidationSchema,
  userSignUpValidationSchema,
} from "@/schemas/zod/userSchemas";

/**
 * Класс ClientEntity представляет сущность клиента в приложении.
 * Он содержит методы для создания нового клиента и проверки данных.
 */
export default class ClientEntity {
  /**
   * Создает экземпляр класса ClientEntity.
   * @param {Object} options - Параметры инициализации.
   * @param {Object} options.context - Контекст приложения (например, Nuxt контекст).
   */
  constructor({ context } = {}) {
    /**
     * @type {Object}
     * @description Контекст приложения, который может использоваться для доступа к глобальным объектам или сервисам.
     */
    this.context = context;
  }

  /**
   * Создает нового клиента с пустыми полями.
   * Этот метод используется для инициализации нового клиента.
   *
   * @returns {Object} - Объект нового клиента со следующими полями:
   *   - name: Имя клиента (пустая строка по умолчанию).
   *   - surname: Фамилия клиента (пустая строка по умолчанию).
   *   - patronymic: Отчество клиента (пустая строка по умолчанию).
   *   - birthday: Дата рождения клиента (пустая строка по умолчанию).
   *   - gender: Пол клиента (null по умолчанию).
   */
  createNewClient = () => ({
    name: "",
    surname: "",
    patronymic: "",
    birthday: "",
    gender: 0,
  });

  /**
   * Проверяет, все ли поля объекта клиента пустые.
   * Этот метод используется для определения, нужно ли сбросить данные клиента.
   *
   * @param {Object} currentTempClient - Данные клиента.
   * @param {string} currentTempClient.name - Имя клиента.
   * @param {string} currentTempClient.surname - Фамилия клиента.
   * @param {string} currentTempClient.patronymic - Отчество клиента.
   * @param {string} currentTempClient.birthday - Дата рождения клиента.
   * @returns {boolean} - Возвращает true, если все проверяемые поля пустые (false), иначе false.
   */
  checkValuesForValidateReset = (currentTempClient) => {
    const fieldsCheck = [
      Boolean(currentTempClient.name),
      Boolean(currentTempClient.surname),
      Boolean(currentTempClient.patronymic),
      Boolean(currentTempClient.birthday),
    ].every((field) => field === false);

    return fieldsCheck;
  };
}
