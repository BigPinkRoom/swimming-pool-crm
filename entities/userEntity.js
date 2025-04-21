import {
  userSignInValidationSchema,
  userSignUpValidationSchema,
} from "@/schemas/zod/userSchemas";

/**
 * Класс для работы с данными пользователя: валидация, форматирование и создание моделей данных.
 */
export default class UserEntity {
  /**
   * Создает экземпляр класса UserEntity.
   * @param {Object} context - Контекст приложения (Nuxt контекст).
   */
  constructor({ context }) {
    this.context = context;

    const { $i18n } = useNuxtApp();
    this.t = $i18n.t;
  }

  /**
   * Валидирует поля из FormData с использованием указанной схемы Zod.
   * @param {FormData} currentFormData - Объект FormData, содержащий данные для валидации.
   * @param {ZodSchema} schema - Схема валидации Zod.
   * @returns {Object} Объект с валидированными данными.
   */
  _validateFormData(currentFormData, schema) {
    try {
      const unvalidatedFields = {};

      for (const [key, value] of currentFormData.entries()) {
        unvalidatedFields[key] = value;
      }

      const validatedFields = schema.parse(unvalidatedFields);

      return validatedFields;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Устанавливает валидированные данные в текущий объект FormData.
   * @param {FormData} currentFormData - Исходный объект FormData.
   * @param {Object} validatedFormData - Объект с валидированными данными.
   * @returns {FormData} Новый объект FormData с валидированными данными.
   */
  _setValidatedFormData(currentFormData, validatedFormData) {
    for (const [key, value] of Object.entries(validatedFormData)) {
      currentFormData.set(key, value);
    }

    return currentFormData;
  }

  /**
   * Создает модель данных для входа пользователя, валидируя и форматируя FormData.
   * @param {FormData} currentFormData - Исходный объект FormData с данными пользователя.
   * @returns {FormData} Новый объект FormData с валидированными данными.
   * @throws {Object} Объект с ошибками валидации в формате { fieldName: errorMessage }.
   */
  createUserSignInModel(currentFormData) {
    const schema = userSignInValidationSchema(this.t);

    try {
      const validatedFields = this._validateFormData(currentFormData, schema);

      const validatedFormData = this._setValidatedFormData(
        currentFormData,
        validatedFields
      );

      return validatedFormData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Создает модель ответа для входа пользователя на основе серверного ответа.
   * @param {Object} response - Ответ сервера с данными пользователя.
   * @returns {Object} Объект с данными пользователя в удобном формате.
   */
  createUserSignInResponseModel(response) {
    return {
      userId: response.user.user_id,
      dataCreate: response.user.data_create,
      email: response.user.email,
      surname: response.user.surname,
      name: response.user.name,
      patronymic: response.user.patronymic,
      userRole: response.user.user_role,
      branch: response.user.branch,
    };
  }

  /**
   * Создает модель данных для регистрации пользователя, валидируя и форматируя FormData.
   * @param {FormData} formDataRaw - Исходный объект FormData с данными пользователя для регистрации.
   * @returns {FormData} Новый объект FormData с валидированными данными.
   * @throws {Object} Объект с ошибками валидации в формате { fieldName: errorMessage }.
   */
  createUserSignUpModel(formDataRaw) {
    const formData = formDataRaw; // Сделать через lodash cloneDeep
    const schema = userSignUpValidationSchema(this.t);

    try {
      const validatedFields = this._validateFormData(formData, schema);

      const validatedFormData = this._setValidatedFormData(
        formData,
        validatedFields
      );

      return validatedFormData;
    } catch (error) {
      throw error;
    }
  }
}
