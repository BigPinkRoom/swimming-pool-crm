export default class Families {
  constructor(context) {
    this.context = context;
  }

  async search({
    sortings = [],
    filters = {},
    context = null,
    searchString = "",
  } = {}) {
    try {
      const params = {};

      // if (!sortings.length) {
      //   params.sortings = [{ name: "branch_id", type: "ASC" }];
      // }

      if (searchString) {
        params.searchString = searchString;
      }

      const response =
        (await this.context.$api.families.search(params)) || null;

      return response;
    } catch (error) {
      this.context.$showError(error);
    }
  }
}
