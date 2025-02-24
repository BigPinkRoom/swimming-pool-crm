import Branches from "./modules/branches";
import User from "./modules/user.js";

export default class Api {
  constructor(app) {
    this.branches = new Branches(app);
    this.user = new User(app);
  }
}
