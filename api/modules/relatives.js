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

  async getRelativeById(id) {
    try {
      const response = await useApi("relatives/get-relative-by-id", "POST", id);

      return response;
    } catch (error) {
      throw error;
    }
  }
}
