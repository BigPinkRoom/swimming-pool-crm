export default class User {
  constructor(context) {
    this.context = context;
  }

  async signup(params) {
    try {
      const response = await useApi("auth/signup", "POST", params);

      return response;
    } catch (error) {
      throw error;
    }
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
