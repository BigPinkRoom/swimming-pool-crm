import { defineStore } from "pinia";
import { filterFilledObject } from "@/helpers/filterFilledObject.js";

export const useAbonementsStore = defineStore("abonements", () => {
  const abonements = ref([]);

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
