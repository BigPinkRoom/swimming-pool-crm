import { useUserStore } from "@/stores/userStore";
import { useMenusStore } from "@/stores/menusStore";
import UserEntity from "@/entities/userEntity";
import { useField } from "vee-validate";

/**
 * Класс для работы с пользователем: регистрация, вход, выход, управление данными пользователя.
 * @class User
 */
export default class User {
  /**
   * Создает экземпляр класса User.
   * @param {Object} context - Контекст приложения (Nuxt контекст).
   */
  constructor(context) {
    this.context = context;

    const { $i18n } = useNuxtApp();
    this.t = $i18n.t;

    this.userStore = useUserStore();
    this.menusStore = useMenusStore();

    this.userEntity = new UserEntity(this.context, new FormData());
  }

  /**
   * Устанавливает данные пользователя в хранилище (Pinia store).
   * @private
   * @async
   * @param {Object} user - Данные пользователя для сохранения.
   * @returns {Promise<void>}
   */
  async _setUser(user) {
    this.userStore.set(user);
  }

  /**
   * Очищает данные пользователя из хранилища (Pinia store).
   * @private
   * @async
   * @returns {Promise<void>}
   */
  async _removeUser() {
    this.userStore.clear();
  }

  /**
   * Устанавливает меню пользователя в соответствующее хранилище (Pinia store).
   * @private
   * @async
   * @returns {Promise<void>}
   * @throws {Error} - Ошибка, если не удалось получить меню через сервис `menus`.
   */
  async _setMenu() {
    try {
      const menuValue = await this.context.$services.menus.getMainMenu();
      this.menusStore.set(menuValue);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Валидирует форму регистрации пользователя, используя `UserEntity`.
   * @private
   * @param {Event} eventSubmitForm - Событие отправки формы (submit event).
   * @param {HTMLFormElement} eventSubmitForm.target - Элемент формы.
   * @returns {Object} - Валидированные данные формы, готовые к отправке на сервер.
   */
  _validateUserSignUpForm(eventSubmitForm) {
    const currentFormData = new FormData(eventSubmitForm.target);

    return this.userEntity.createUserSignUpModel(currentFormData);
  }

  /**
   * Валидирует форму входа пользователя, используя `UserEntity`.
   * @private
   * @param {Event} eventSubmitForm - Событие отправки формы (submit event).
   * @param {HTMLFormElement} eventSubmitForm.target - Элемент формы.
   * @returns {Object} - Валидированные данные формы, готовые к отправке на сервер.
   */
  _validateUserSignInForm(eventSubmitForm) {
    const currentFormData = new FormData(eventSubmitForm.target);

    return this.userEntity.createUserSignInModel(currentFormData);
  }

  /**
   * Получает текущего пользователя с сервера.
   * @async
   * @param {Object} [params] - Параметры запроса (опционально, в текущей реализации не используются).
   * @returns {Promise<Object|undefined>} - Данные текущего пользователя или undefined, если пользователь не авторизован (401) или произошла другая ошибка.
   * @throws {Error} - Ошибка, если запрос не удался (кроме 401).
   */
  async getCurrent(params) {
    try {
      const response = await this.context.$api.user.getCurrent();

      return response;
    } catch (error) {
      if (error.value.statusCode === 401) {
        return; // Используем return undefined для 401, а не return; чтобы было более явно
      } else {
        throw error;
      }
    }
  }

  /**
   * Обрабатывает успешный вход пользователя: сохраняет данные, меню и показывает сообщение.
   * @private
   * @async
   * @param {Object} response - Ответ сервера после успешного входа.
   * @returns {Promise<Object>} - Данные пользователя (модель ответа на вход) после обработки.
   */
  async _handleSuccessfulSignIn(response) {
    const userSignInResponseModel =
      this.userEntity.createUserSignInResponseModel(response);

    this._setUser(userSignInResponseModel);

    this._setMenu();

    this.context.$showMessage(this.t("forms.login.success"));
    return userSignInResponseModel;
  }

  /**
   * Обрабатывает серверные ошибки валидации для форм входа или регистрации.
   * Показывает локализованное сообщение об ошибке.
   * @private
   * @param {Error} error - Объект ошибки от API.
   * @param {Object} [error.data] - Данные ошибки.
   * @param {Object} [error.data.error] - Объект с деталями ошибки.
   * @param {string} [error.data.error.message] - Ключ сообщения об ошибке.
   * @param {string} [error.data.error.userEmail] - Email пользователя (для подстановки в сообщение).
   * @param {('login'|'signup')} type - Тип формы, для которой произошла ошибка.
   * @throws {Error} - Пробрасывает оригинальную ошибку, если она не содержит `error.data.error.message`.
   */
  _handleServerValidationError(error, type) {
    if (!error?.data?.error?.message) {
      // Уточнена проверка
      throw error;
    }

    this.context.$showError(
      this.t(`forms.${type}.validationErrors.${error.data.error.message}`, {
        userEmail: error.data.error.userEmail,
      }),
    );
  }

  /**
   * Выполняет вход пользователя.
   * @async
   * @param {Event} eventSubmitForm - Событие отправки формы входа.
   * @returns {Promise<Object|undefined>} - Данные пользователя после успешного входа или undefined в случае ошибки валидации.
   */
  async signIn(eventSubmitForm) {
    try {
      const userForm = this._validateUserSignInForm(eventSubmitForm);
      const response = await this.context.$api.user.signIn(userForm);

      return this._handleSuccessfulSignIn(response);
    } catch (error) {
      this._handleServerValidationError(error, "login");
      return undefined; // Возвращаем undefined в случае ошибки валидации
    }
  }

  /**
   * Регистрирует нового пользователя.
   * @async
   * @param {Event} eventSubmitForm - Событие отправки формы регистрации.
   * @returns {Promise<Object|undefined>} - Ответ сервера после успешной регистрации или undefined в случае ошибки валидации.
   */
  async create(eventSubmitForm) {
    try {
      const userForm = this._validateUserSignUpForm(eventSubmitForm);

      const response = await this.context.$api.user.signup(userForm);

      return response;
    } catch (error) {
      this._handleServerValidationError(error, "signup");
      return undefined; // Возвращаем undefined в случае ошибки валидации
    }
  }

  /**
   * Выполняет выход пользователя: удаляет данные из API, очищает локальное хранилище и обновляет меню.
   * @async
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await this.context.$api.user.logout();
      await this._removeUser();

      const menuValue = await this.context.$services.menus.getMainMenu();
      this.menusStore.set(menuValue);
    } catch (error) {}
  }
}
