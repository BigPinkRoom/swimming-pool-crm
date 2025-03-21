import { userSignInValidationSchema } from "@/schemas/zod/userSchemas";

export default class UserEntity {
  constructor({ context }) {
    this.context = context;

    const { $i18n } = useNuxtApp();
    this.t = $i18n.t;
  }

  /**
   * Форматирует ошибки валидации Zod в объект с ключами полей и сообщениями об ошибках.
   * @param {Object} error - Ошибки валидации Zod.
   * @returns {Object} Объект с ошибками в формате { fieldName: errorMessage }.
   */
  _formatValidationErrors(error) {
    if (error.constructor.name === "_ZodError") {
      const errors = error.errors.reduce((acc, curr) => {
        const field = curr.path[0];
        acc[field] = curr.message;
        return acc;
      }, {});

      return errors;
    } else {
      return error;
    }
  }

  /**
   * Валидирует поля из FormData с использованием указанной схемы Zod.
   * @param {FormData} formData - Объект FormData, содержащий данные для валидации.
   * @param {ZodSchema} schema - Схема валидации Zod.
   * @returns {Object} Объект с валидированными данными.
   */
  _validateFields(formData, schema) {
    try {
      const unvalidatedFields = {};

      for (const [key, value] of formData.entries()) {
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
   * @param {FormData} formData - Исходный объект FormData.
   * @param {Object} validatedFormData - Объект с валидированными данными.
   * @returns {FormData} Новый объект FormData с валидированными данными.
   */
  _setValidatedFields(formData, validatedFormData) {
    const newFormData = formData;
    for (const [key, value] of Object.entries(validatedFormData)) {
      newFormData.set(key, value);
    }

    return newFormData;
  }
  /**
   * Создает модель данных для входа пользователя, валидируя и форматируя FormData.
   * @param {FormData} formDataRaw - Исходный объект FormData с данными пользователя.
   * @returns {FormData} Новый объект FormData с валидированными данными.
   * @throws {Object} Объект с ошибками валидации в формате { fieldName: errorMessage }.
   */
  createUserSignInModel(formDataRaw) {
    const formData = formDataRaw;
    const schema = userSignInValidationSchema(this.t);

    try {
      const validatedFields = this._validateFields(formData, schema);

      const validatedFormData = this._setValidatedFields(
        formData,
        validatedFields
      );

      return validatedFormData;
    } catch (error) {
      const errors = this._formatValidationErrors(error);

      throw errors;
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
    const formData = formDataRaw;
    const schema = userSignUpValidationSchema(this.t);

    try {
      const validatedFields = this._validateFields(formData, schema);

      const validatedFormData = this._setValidatedFields(
        formData,
        validatedFields
      );

      return validatedFormData;
    } catch (error) {
      const errors = this._formatValidationErrors(error);

      throw errors;
    }
  }
}
