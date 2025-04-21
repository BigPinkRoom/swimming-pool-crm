export default class Abonements {
  constructor(context) {
    this.context = context;
  }

  async getFull(params) {
    try {
      const response = await useApi(
        "abonements/abonementsFull",
        "POST",
        params
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  async addFamily(params) {
    try {
      const response = await useApi("abonements/addFamily", "POST", params);

      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateFamily(params) {
    try {
      const response = await useApi("abonements/updateFamily", "PUT", params);

      return response;
    } catch (error) {
      throw error;
    }
  }
}
