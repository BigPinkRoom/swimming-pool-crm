export default class User {
  constructor(context) {
    this.context = context;
  }

  async signup(params) {
    try {
      const response = await useApi("auth/signup", "POST", params);

      if (response) {
        navigateTo("/");
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // TODO remove (here need to only api)?
  async logout() {
    try {
      await await useApi("auth/logout", "DELETE");
    } catch (error) {
      throw error;
    } finally {
      navigateTo("/");
    }
  }

  // TODO remove (here need to only api)?
  async signIn(params) {
    try {
      const user = await useApi("auth/login", "POST", params);

      if (user) {
        navigateTo("/");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async getCurrent() {
    try {
      const answer = await useApi("auth/user", "GET");

      return answer;
    } catch (error) {
      throw error;
    }
  }
}
