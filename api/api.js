import Menus from "./modules/menus";
import Branches from "./modules/branches";
import User from "./modules/user.js";
import Abonements from "./modules/abonements";
import Relatives from "./modules/relatives";
import Families from "./modules/families";

export default class Api {
  constructor(app) {
    this.menus = new Menus(app);
    this.branches = new Branches(app);
    this.user = new User(app);
    this.abonements = new Abonements(app);
    this.relatives = new Relatives(app);
    this.families = new Families(app);
  }
}
