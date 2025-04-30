export default class Families {
  constructor(context) {
    this.context = context;
  }

  async search(params) {
    try {
      const response = await useApi("search/search-family", "POST", params);

      return response;
    } catch (error) {
      throw error;
    }
  }
}
