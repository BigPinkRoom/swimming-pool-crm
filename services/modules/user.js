import { useUserStore } from "@/stores/userStore";
import UserEntity from "@/entities/userEntity";

export default class User {
  constructor(context) {
    this.context = context;
    const { $i18n } = useNuxtApp();
    this.t = $i18n.t;
    this.userStore = useUserStore();
  }

  async _setUser(user) {
    this.userStore.set(user);
  }

  async _removeUser() {
    this.userStore.clear();
  }

  async create(form) {
    // const userSignUpModel = {
    //   email: params.email.value,
    //   branch: params.branch.value,
    //   password: params.password.value,
    //   "password-confirm": params["password-confirm"].value,
    //   name: params.name.value,
    //   surname: params.surname.value,
    //   patronymic: params.patronymic.value,
    // };

    let formData = new FormData([form]);

    try {
      const response = await this.context.$api.user.signup(formData);

      const userEmail = response?.userEmail || null;

      this.context.$showMessage(
        this.t(`forms.signup.${response.message}`, { userEmail })
      );

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
  async signIn(form) {
    const userForm = new UserEntity().createUserSignInModel(form);

    // const userSignInRequestModel = {
    //   email: params.email.value,
    //   branch: params.branch.value,
    //   password: params.password.value,
    // };

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

      return userSignInResponseModel;
    } catch (error) {
      console.log("error in sign in", error);
    }
  }

  async logout() {
    this.context.$api.user.logout();

    this._removeUser();
  }

  async getCurrent(params) {
    const response = await this.context.$api.user.getCurrent();

    return response;
  }
}
