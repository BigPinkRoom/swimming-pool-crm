import { defineStore } from "pinia";

export const useBranchesStore = defineStore("branches", () => {
  const branches = ref([]);

  function set(payload) {
    branches.value = payload;
  }

  return { branches, set };
});
