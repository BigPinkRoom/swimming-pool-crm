import { defineStore } from "pinia";
import { filterFilledObject } from "@/helpers/filterFilledObject.js";

/**
 * @module stores/abonementStore
 * @description Хранилище для управления списком абонементов.
 */
export const useAbonementsStore = defineStore("abonements", () => {
  /**
   * Реактивный массив абонементов.
   * @type {import("vue").Ref<Array<Object>>}
   */
  const abonements = ref([]);

  /**
   * Устанавливает отфильтрованный список абонементов.
   * Если payload - массив, каждый объект фильтруется с помощью `filterFilledObject`.
   * В противном случае, список абонементов очищается.
   * @param {Array<Object>|any} payload - Массив объектов абонементов или любое другое значение для очистки списка.
   */
  function setFilledObject(payload) {
    if (Array.isArray(payload)) {
      abonements.value = payload.map(filterFilledObject);
    } else {
      abonements.value = [];
    }
  }

  return {
    abonements,
    setFilledObject,
  };
});
