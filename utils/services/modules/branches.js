export default class Branches {
  constructor(context) {
    this.context = context;
  }

  async get({ sortings = [], filters = {}, context = null } = {}) {
    try {
      const params = {};

      if (!sortings.length) {
        params.sortings = [{ name: "branch_id", type: "ASC" }];
      }

      const response = (await this.context.$api.branches.get(params)) || null;

      return response;
    } catch (error) {
      this.context.$showError(error);
      console.log("api branches error", error);
    }
  }
}
