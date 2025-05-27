import { defineStore } from "pinia";

/**
 * @module stores/menusStore
 * @description Хранилище для управления главным меню приложения.
 */
export const useMenusStore = defineStore("menus", () => {
  /**
   * Реактивный массив элементов главного меню.
   * @type {import("vue").Ref<Array<Object>>}
   */
  const mainMenu = ref([]);

  /**
   * Устанавливает элементы главного меню.
   * @param {Array<Object>} payload - Массив объектов элементов меню.
   */
  function set(payload) {
    mainMenu.value = payload;
  }

  return { mainMenu, set };
});
