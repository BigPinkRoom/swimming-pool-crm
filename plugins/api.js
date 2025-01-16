import Api from "~/utils/api/api";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide("api", new Api(nuxtApp));
});
