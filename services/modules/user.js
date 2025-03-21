import { useUserStore } from "@/stores/userStore";
import { useMenusStore } from "@/stores/menusStore";
import UserEntity from "@/entities/userEntity";

export default class User {
  constructor(context) {
    this.context = context;

    const { $i18n } = useNuxtApp();
    this.t = $i18n.t;

    this.userStore = useUserStore();
    this.menusStore = useMenusStore();

    this.userEntity = new UserEntity(this.context, new FormData());
  }

  async _setUser(user) {
    this.userStore.set(user);
  }

  async _removeUser() {
    this.userStore.clear();
  }

  _validateUserForm(eventSubmitForm) {
    const currentFormData = new FormData(eventSubmitForm.target);

    return this.userEntity.createUserSignInModel(currentFormData);
  }

  async _setMenu() {
    try {
      const menuValue = await this.context.$services.menus.getMainMenu();
      this.menusStore.set(menuValue);
    } catch (error) {
      throw error;
    }
  }

  async _getSignInResponse(userForm) {
    try {
      return await this.context.$api.user.signIn(userForm);
    } catch (error) {
      throw error;
    }
  }

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

  async _handleSuccessfulSignIn(response) {
    const userSignInResponseModel =
      this.userEntity.createUserSignInResponseModel(response);
    this._setUser(userSignInResponseModel);

    this._setMenu();

    this.context.$showMessage(this.t("forms.signup"));

    return userSignInResponseModel;
  }

  _handleSignInError(error) {
    if (!error?.value?.data.error.message) {
      throw error;
    }

    this.context.$showError(
      this.t(
        `forms.login.validationErrors.${error?.value?.data.error.message}`,
        { userEmail: error.value?.data.error.userEmail }
      )
    );
  }

  async signIn(eventSubmitForm) {
    try {
      const userForm = this._validateUserForm(eventSubmitForm);

      const response = await this._getSignInResponse(userForm);

      return this._handleSuccessfulSignIn(response);
    } catch (error) {
      this._handleSignInError(error);
    }
  }

  async create(eventSubmitForm) {
    const userForm = new UserEntity({
      context: this.context,
    }).createUserSignUpModel(eventSubmitForm);

    try {
      const response = await this.context.$api.user.signup(userForm);

      const userEmail = response?.userEmail || null;

      this.context.$showMessage(
        this.t(`forms.signup.${response.message}`, { userEmail })
      );

      const menuValue = await this.context.$services.menus.getMainMenu();
      this.menusStore.set(menuValue);

      return response;
    } catch (error) {
      this.context.$showError(
        this.t(
          `forms.signup.validationErrors.${error.value?.data.error.message}`,
          { userEmail: error.value?.data.error.userEmail }
        )
      );
    }
  }

  async logout() {
    try {
      await this.context.$api.user.logout();
      await this._removeUser();

      const menuValue = await this.context.$services.menus.getMainMenu();
      this.menusStore.set(menuValue);
    } catch (error) {}
  }

  errorMessagesInputCheck(fieldName, formErrors, propsErrors) {
    const checkFormsErrorsIsEmpty =
      formErrors[fieldName] || propsErrors[fieldName] === "";

    if (checkFormsErrorsIsEmpty) {
      return formErrors[fieldName];
    } else {
      return propsErrors[fieldName];
    }
  }

  validateField({ field, value, schemaRaw, formErrors, propsErrors }) {
    const schema = schemaRaw(this.t);

    try {
      schema.pick({ [field]: true }).parse({ [field]: value });
      formErrors[field] = ""; // Очищаем ошибку, если валидация прошла успешно
      propsErrors[field] = "";
    } catch (error) {
      formErrors[field] = error.errors[0].message; // Устанавливаем сообщение об ошибке
    }
  }
}
