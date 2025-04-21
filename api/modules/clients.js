export default class Clients {
  constructor(context) {
    this.context = context;
  }

  async add(params) {
    try {
      const response = await useApi("clients/add", "POST", params);

      return response;
    } catch (error) {
      throw error;
    }
  }
}
