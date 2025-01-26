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

      const response =
        (await this.context.$api.branches.get({ params })) || null;

      const branchesSelectModel = response.map((branch) => {
        console.log('branch', branch)
        return {
          idName: "branch-options",
          value: branch.branch_id,
          text: branch.name,
          disabled: false,
          selected: false,
        };
      });

      return branchesSelectModel;
    } catch (error) {
      // this.context.$showError(error);
      console.log("api branches error", error);
    }
  }
}
