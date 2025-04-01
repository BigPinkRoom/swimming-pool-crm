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
}
