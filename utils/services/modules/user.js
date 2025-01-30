export default class User {
  constructor(context) {
    this.context = context;
    const { $i18n } = useNuxtApp();
    this.t = $i18n.t;
  }

  async create(params) {
    const userSignUpModel = {
      email: params.email.value,
      branch: params.branch.value,
      password: params.password.value,
      "password-confirm": params["password-confirm"].value,
      name: params.name.value,
      surname: params.surname.value,
      patronymic: params.patronymic.value,
    };

    try {
      const response = await this.context.$api.user.signup(userSignUpModel);

      const userEmail = response?.userEmail || null;

      if (response?.userEmail) {
        // TODO. Сделать через юзера в сторе
        this.context.$showMessage(
          this.t(`forms.signup.${response.message}`, { userEmail })
        );
      }

      return response;
    } catch (error) {
      this.context.$showError(error);
      console.log("api branches error", error);
    }
  }
}
