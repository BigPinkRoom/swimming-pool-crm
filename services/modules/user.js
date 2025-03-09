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
  }

  async _setUser(user) {
    this.userStore.set(user);
  }

  async _removeUser() {
    this.userStore.clear();
  }

  async create(eventSubmitForm) {
    const userForm = new UserEntity().createUserSignUpModel(eventSubmitForm);

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
  async signIn(eventSubmitForm) {
    const userForm = new UserEntity().createUserSignInModel(eventSubmitForm);

    try {
      const response = await this.context.$api.user.signIn(userForm);

      if (!response) return;

      const userSignInResponseModel = {
        userId: response.user.user_id,
        dataCreate: response.user.data_create,
        email: response.user.email,
        surname: response.user.surname,
        name: response.user.name,
        patronymic: response.user.patronymic,
        userRole: response.user.user_role,
        branch: response.user.branch,
      };

      this._setUser(userSignInResponseModel);

      this.context.$showMessage(this.t(`forms.signup`));

      const menuValue = await this.context.$services.menus.getMainMenu();
      this.menusStore.set(menuValue);

      return userSignInResponseModel;
    } catch (error) {
      console.log("error in sign in", error);
    }
  }

  async logout() {
    await this.context.$api.user.logout();
    await this._removeUser();

    const menuValue = await this.context.$services.menus.getMainMenu();
    this.menusStore.set(menuValue);
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
}
