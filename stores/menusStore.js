import { defineStore } from "pinia";

export const useMenusStore = defineStore("menus", () => {
  const mainMenu = ref([]);

  function set(payload) {
    mainMenu.value = payload;
  }

  return { mainMenu, set };
});
