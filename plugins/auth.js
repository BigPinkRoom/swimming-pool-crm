import { useUserStore } from "@/stores/userStore";

export default defineNuxtPlugin(async (nuxtApp) => {
  const { $services } = useNuxtApp();
  const authStore = useUserStore();

  let user = null;

  try {
    user = await $services.user.getCurrent();

    if (user) {
      authStore.set(user);
    }
  } catch (error) {
    if (error.statusCode === 401) {
      navigateTo("/login");
    }
  }
});
