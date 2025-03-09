import { defineStore } from "pinia";

export const useUserStore = defineStore("users", () => {
  const user = ref({});
  const isAuthenticated = ref(false);

  function set(payload) {
    user.value = payload;

    if (user.value) {
      isAuthenticated.value = true;
    }
  }

  function clear() {
    user.value = {};
    isAuthenticated.value = false;
  }

  return { isAuthenticated, user, set, clear };
});
