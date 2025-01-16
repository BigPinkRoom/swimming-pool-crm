export default class Branches {
  constructor(context) {
    this.context = context;
  }

  async get(params) {
    try {
      const response = await useApi("branches/list", "POST", {
        params,
      });

      return response;
    } catch (error) {
      console.log("branches api error", error);
    }
  }
}
