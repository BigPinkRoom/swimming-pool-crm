import { useUserStore } from "@/stores/userStore";
import { useMenusStore } from "@/stores/menusStore";
import UserEntity from "@/entities/userEntity";
import { useField } from "vee-validate";

/**
 * Класс для работы с пользователем: регистрация, вход, выход, управление данными пользователя.
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
   * Устанавливает данные пользователя в хранилище.
   * @param {Object} user - Данные пользователя для сохранения.
   */
  async _setUser(user) {
    this.userStore.set(user);
  }

  /**
   * Очищает данные пользователя из хранилища.
   */
  async _removeUser() {
    this.userStore.clear();
  }

  /**
   * Устанавливает меню пользователя.
   * @throws {Error} - Ошибка, если не удалось получить меню.
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
   * Валидирует форму регистрации пользователя.
   * @param {Event} eventSubmitForm - Событие отправки формы.
   * @returns {Object} - Валидированные данные формы.
   */
  _validateUserSignUpForm(eventSubmitForm) {
    const currentFormData = new FormData(eventSubmitForm.target);

    return this.userEntity.createUserSignUpModel(currentFormData);
  }

  /**
   * Валидирует форму входа пользователя.
   * @param {Event} eventSubmitForm - Событие отправки формы.
   * @returns {Object} - Валидированные данные формы.
   */
  _validateUserSignInForm(eventSubmitForm) {
    const currentFormData = new FormData(eventSubmitForm.target);

    return this.userEntity.createUserSignInModel(currentFormData);
  }

  /**
   * Получает текущего пользователя с сервера.
   * @param {Object} params - Параметры запроса (опционально).
   * @returns {Promise<Object|null>} - Данные текущего пользователя или null, если пользователь не авторизован.
   * @throws {Error} - Ошибка, если запрос не удался.
   */
  async getCurrent(params) {
    try {
      const response = await this.context.$api.user.getCurrent();

      return response;
    } catch (error) {
      if (error.value.statusCode === 401) {
        return;
      } else {
        throw error;
      }
    }
  }

  /**
   * Обрабатывает успешный вход пользователя.
   * @param {Object} response - Ответ сервера после успешного входа.
   * @returns {Object} - Данные пользователя после входа.
   */
  async _handleSuccessfulSignIn(response) {
    const userSignInResponseModel =
      this.userEntity.createUserSignInResponseModel(response);

    this._setUser(userSignInResponseModel);

    this._setMenu();

    this.context.$showMessage(this.t("forms.signup"));

    return userSignInResponseModel;
  }

  /**
   * Обрабатывает серверные ошибки валидации.
   * @param {Error} error - Ошибка, возникшая при входе.
   */
  _handleServerValidationError(error, type) {
    if (!error?.value?.data.error.message) {
      throw error;
    }

    this.context.$showError(
      this.t(
        `forms.${type}.validationErrors.${error?.value?.data.error.message}`,
        { userEmail: error.value?.data.error.userEmail }
      )
    );
  }

  /**
   * Выполняет вход пользователя.
   * @param {Event} eventSubmitForm - Событие отправки формы входа.
   * @returns {Promise<Object>} - Данные пользователя после успешного входа.
   */
  async signIn(eventSubmitForm) {
    try {
      const userForm = this._validateUserSignInForm(eventSubmitForm);

      const response = await this.context.$api.user.signIn(userForm);

      return this._handleSuccessfulSignIn(response);
    } catch (error) {
      this._handleServerValidationError(error, "signIn");
    }
  }

  /**
   * Регистрирует нового пользователя.
   * @param {Event} eventSubmitForm - Событие отправки формы регистрации.
   * @returns {Promise<Object>} - Ответ сервера после успешной регистрации.
   */
  async create(eventSubmitForm) {
    try {
      const userForm = this._validateUserSignUpForm(eventSubmitForm);

      const response = await this.context.$api.user.signup(userForm);

      return response;
    } catch (error) {
      this._handleServerValidationError(error, "signup");
    }
  }

  /**
   * Выполняет выход пользователя.
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
