export default class Clients {
  constructor(context) {
    this.context = context;
  }

  async getClientById(id) {
    try {
      const response = await useApi("clients/get-client-by-id", "POST", id);

      return response;
    } catch (error) {
      throw error;
    }
  }
}
