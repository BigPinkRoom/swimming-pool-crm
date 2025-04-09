export default class Clients {
  constructor(context) {
    this.context = context;
  }

  async getTypes(params) {
    try {
      const response = await useApi("relatives/types", "POST", params);

      return response;
    } catch (error) {
      throw error;
    }
  }
}
