import Branches from "./modules/branches";

export default class Services {
  constructor(app) {
    this.branches = new Branches(app);
  }
}
