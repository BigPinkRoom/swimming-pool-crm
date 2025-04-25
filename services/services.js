import Branches from "./modules/branches";
import BranchesSelect from "./modules/branchesSelect";
import User from "./modules/user";
import Menus from "./modules/menus";
import Abonements from "./modules/abonements";
import Clients from "./modules/clients";
import Relatives from "./modules/relatives";
import Families from "./modules/families";

export default class Services {
  constructor(app) {
    this.branches = new Branches(app);
    this.branchesSelect = new BranchesSelect(app);

    this.menus = new Menus(app);

    this.user = new User(app);

    this.abonements = new Abonements(app);

    this.clients = new Clients(app);
    this.relatives = new Relatives(app);
    this.families = new Families(app);
  }
}
