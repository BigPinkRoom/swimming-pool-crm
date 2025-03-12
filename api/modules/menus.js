export default class Menus {
  constructor(context) {
    this.context = context;
  }

  async get(params) {
    try {
      const response = await useApi("menus/list", "POST", params);

      return response;
    } catch (error) {
      throw error;
    }
  }
}
