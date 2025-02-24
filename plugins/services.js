import Services from "~/services/services";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide("services", new Services(nuxtApp));
});
