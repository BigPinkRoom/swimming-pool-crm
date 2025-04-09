import { useMessageStore } from "@/stores/messageStore";

export default defineNuxtPlugin((nuxtApp) => {
  const messageStore = useMessageStore();

  nuxtApp.provide("showMessage", (message) => {
    messageStore.add({ message: String(message) });
  });

  nuxtApp.provide("showError", (message) => {
    messageStore.add({ message: String(message), type: "error" });
  });
});
