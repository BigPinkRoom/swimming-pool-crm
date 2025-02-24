export default class UserEntity {
  constructor(context) {
    this.context = context;
    const { $i18n } = useNuxtApp();
    this.t = $i18n.t;
  }

  createUserSignInModel(form) {
    const formData = new FormData(form.target);

    const email = formData.get("email");
    console.log("email", email);
    return formData;
  }
}
