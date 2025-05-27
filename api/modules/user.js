/**
 * @module api/modules/user
 * @description Этот модуль предоставляет класс `User` для взаимодействия с API аутентификации и управления пользователями.
 */

/**
 * @class User
 * @classdesc Класс для управления операциями, связанными с пользователями и аутентификацией.
 */
export default class User {
  /**
   * @constructor
   * @param {object} context - Контекст приложения или API.
   * @description Создает экземпляр класса User.
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * @async
   * @function signup
   * @param {object} params - Параметры для регистрации нового пользователя.
   * @returns {Promise<object>} - Промис, который разрешается объектом ответа от API после успешной регистрации.
   * @throws {Error} - Выбрасывает ошибку, если запрос к API завершается неудачно.
   * @description Регистрирует нового пользователя и перенаправляет на главную страницу в случае успеха.
   */
  async signup(params) {
    try {
      const response = await useApi("auth/signup", "POST", params);

      if (response) {
        navigateTo("/");
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // TODO remove (here need to only api)?
  /**
   * @async
   * @function logout
   * @returns {Promise<void>} - Промис, который разрешается после успешного выхода пользователя.
   * @throws {Error} - Выбрасывает ошибку, если запрос к API завершается неудачно.
   * @description Выполняет выход пользователя из системы и всегда перенаправляет на главную страницу.
   */
  async logout() {
    try {
      await useApi("auth/logout", "DELETE");
    } catch (error) {
      throw error;
    } finally {
      navigateTo("/");
    }
  }

  // TODO remove (here need to only api)?
  /**
   * @async
   * @function signIn
   * @param {object} params - Параметры для входа пользователя в систему.
   * @returns {Promise<object>} - Промис, который разрешается объектом пользователя от API после успешного входа.
   * @throws {Error} - Выбрасывает ошибку, если запрос к API завершается неудачно.
   * @description Выполняет вход пользователя в систему и перенаправляет на главную страницу в случае успеха.
   */
  async signIn(params) {
    try {
      const user = await useApi("auth/login", "POST", params);

      if (user) {
        navigateTo("/");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @async
   * @function getCurrent
   * @returns {Promise<object>} - Промис, который разрешается объектом текущего аутентифицированного пользователя от API.
   * @throws {Error} - Выбрасывает ошибку, если запрос к API завершается неудачно.
   * @description Получает данные текущего аутентифицированного пользователя.
   */
  async getCurrent() {
    try {
      const user = await useApi("auth/user", "GET");

      return user;
    } catch (error) {
      throw error;
    }
  }
}
