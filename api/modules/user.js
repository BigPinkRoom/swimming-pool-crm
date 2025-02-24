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
    await await useApi("auth/logout", "DELETE");

    const answer = "Succussefully logged out";

    console.log("delete", this.context.$pinia);

    return answer;
  }

  // TODO remove (here need to only api)?
  async signIn(params) {
    const user = await useApi("auth/login", "POST", params);

    return user;
  }

  async getCurrent() {
    const answer = await useApi("auth/user", "GET");

    console.log("answer in gets current", answer);

    return answer;
  }
}
