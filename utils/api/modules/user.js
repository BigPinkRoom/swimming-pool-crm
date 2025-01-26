export default class User {
  constructor(context) {
    this.context = context;
  }

  async signup(params) {
    console.log("signup params!!!", params);
    return await useApi("auth/signup", "POST", params);
  }

  // TODO remove (here need to only api)?
  async logout() {
    await this.context.$auth.logout();

    const answer = "Succussefully logged out";

    return answer;
  }

  // TODO remove (here need to only api)?
  async login(user) {
    await this.context.$auth.loginWith("cookie", {
      data: user,
    });

    const answer = "User is logged";

    return answer;
  }

  async getCurrent() {
    const answer = await useApi("auth/user", "GET");

    return answer;
  }
}
