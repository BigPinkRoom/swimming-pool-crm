export default class User {
  constructor(context) {
    this.context = context;
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
      const response =
        (await this.context.$api.user.signup(userSignUpModel)) || null;

      return response;
    } catch (error) {
      // this.context.$showError(error);
      console.log("api branches error", error);
    }
  }
}
