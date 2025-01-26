import Branches from "./modules/branches";
import BranchesSelect from "./modules/branchesSelect";
import User from "./modules/user";

export default class Services {
  constructor(app) {
    this.branches = new Branches(app);
    this.branchesSelect = new BranchesSelect(app);

    this.user = new User(app);
  }
}
