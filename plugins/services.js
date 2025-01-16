import Services from "~/utils/services/services";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide("services", new Services(nuxtApp));
});
