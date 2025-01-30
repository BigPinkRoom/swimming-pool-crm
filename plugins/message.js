import { useMessageStore } from "@/stores/messageStore";

export default defineNuxtPlugin((nuxtApp) => {
  const messageStore = useMessageStore();

  nuxtApp.provide("showMessage", (message) => {
    messageStore.add({ message });
  });

  nuxtApp.provide("showError", (message) => {
    messageStore.add({ message, type: "error" });
  });
});
