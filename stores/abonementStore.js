import { defineStore } from "pinia";
import { filterFilledObject } from "@/helpers/filterFilledObject.js";

export const useAbonementsStore = defineStore("abonements", () => {
  const abonements = ref({});

  function set(payload) {
    abonements.value = payload;
  }

  function setFilledObject(payload) {
    const filteredObject = filterFilledObject(payload);
    abonements.value = filteredObject;
  }

  return { abonements, set, setFilledObject };
});
