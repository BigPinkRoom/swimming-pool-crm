import Branches from "./modules/branches";

export default class Api {
  constructor(app) {
    this.branches = new Branches(app);
  }
}
