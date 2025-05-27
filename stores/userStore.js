import { defineStore } from "pinia";

/**
 * @module stores/userStore
 * @description Хранилище для управления состоянием пользователя и аутентификации.
 */
export const useUserStore = defineStore("users", () => {
  /**
   * Реактивный объект, содержащий данные пользователя.
   * @type {import("vue").Ref<Object>}
   */
  const user = ref({});
  /**
   * Реактивный флаг, указывающий, аутентифицирован ли пользователь.
   * @type {import("vue").Ref<boolean>}
   */
  const isAuthenticated = ref(false);

  /**
   * Устанавливает данные пользователя и обновляет статус аутентификации.
   * @param {Object} payload - Данные пользователя для установки.
   */
  function set(payload) {
    user.value = payload;

    if (user.value) {
      isAuthenticated.value = true;
    }
  }

  /**
   * Очищает данные пользователя и сбрасывает статус аутентификации.
   */
  function clear() {
    user.value = {};
    isAuthenticated.value = false;
  }

  return { isAuthenticated, user, set, clear };
});
