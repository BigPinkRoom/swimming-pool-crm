const { $services } = useNuxtApp();

export const routesConstantsActions = {
  main: () => navigateTo("/"),
  signup: () => navigateTo("/signup"),
  login: () => navigateTo("/signin"),
  profile: () => navigateTo("/profile"),
  logout: () => $services.user.logout(),
  admin_panel: () => navigateTo("/admin-panel"),
};
