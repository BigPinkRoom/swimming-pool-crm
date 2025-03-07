import { useUserStore } from "@/stores/userStore";

export default class Menus {
  constructor(context) {
    this.context = context;
  }

  _getTitleMainMenu(name) {
    const titles = {
      main: "main",
      signup: "signup",
      login: "signin",
      profile: "profile",
      logout: "logout",
      admin_panel: "adminPanel",
    };

    return titles[name] || null;
  }

  _mainMenuToNavbar(routesList) {
    return routesList?.map((item) => {
      const processedItem = {
        ...item,
        title: this._getTitleMainMenu(item.name),
      };
      return processedItem;
    });
  }

  async getMainMenu({ sortings = [], filters = {}, context = null } = {}) {
    try {
      const params = {};

      if (!sortings.length) {
        params.sortings = [{ name: "menu_item_id", type: "ASC" }];
      }

      const response = (await this.context.$api.menus.get(params)) || null;
      const processedResponse = this._mainMenuToNavbar(response);

      return processedResponse;
    } catch (error) {
      this.context.$showError(error);
      console.log("api menus error (service)", error);
    }
  }
}
