import { defineStore } from "pinia";

/**
 * @module stores/branchStore
 * @description Хранилище для управления списком филиалов.
 */
export const useBranchesStore = defineStore("branches", () => {
  /**
   * Реактивный массив филиалов.
   * @type {import("vue").Ref<Array<Object>>}
   */
  const branches = ref([]);

  /**
   * Устанавливает список филиалов.
   * @param {Array<Object>} payload - Массив объектов филиалов.
   */
  function set(payload) {
    branches.value = payload;
  }

  return { branches, set };
});
