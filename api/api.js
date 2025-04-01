import Menus from "./modules/menus";
import Branches from "./modules/branches";
import User from "./modules/user.js";
import Abonements from "./modules/abonements";

export default class Api {
  constructor(app) {
    this.menus = new Menus(app);
    this.branches = new Branches(app);
    this.user = new User(app);
    this.abonements = new Abonements(app);
  }
}
