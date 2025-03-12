import { useUserStore } from "@/stores/userStore";

export default defineNuxtRouteMiddleware((to, from) => {
  const localePath = useLocalePath();
  const userStore = useUserStore();
  const isAuthenticated = userStore.isAuthenticated;

  const exceptionsRoutesWithoutAuth = [
    to.path !== localePath("/signup"),
    to.path !== localePath("/signin"),
    to.path !== localePath("/"),
  ].every((condition) => condition === true);

  const exceptionsRoutesWithAuth = [
    to.path !== localePath("/"),
    to.path !== localePath("/profile"),
  ].every((condition) => condition === true);

  const redirectConditionsWithoutAuth = [
    import.meta.client,
    !isAuthenticated,
    exceptionsRoutesWithoutAuth,
  ].every((condition) => condition === true);

  const redirectConditionsWithAuth = [
    import.meta.client,
    isAuthenticated,
    exceptionsRoutesWithAuth,
  ].every((condition) => condition === true);

  if (redirectConditionsWithoutAuth) {
    return navigateTo(localePath("/signin"));
  }

  if (redirectConditionsWithAuth) {
    return navigateTo(localePath("/"));
  }
});
