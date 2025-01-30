import { defineStore } from "pinia";

export const useMessageStore = defineStore("message", () => {
  const messages = ref([]);

  function add(data) {
    messages.value.push({
      id: Math.round(Math.random() * 1e6),
      message: data.message,
      type: data.type,
      duration: data.duration,
    });
  }

  function remove(id) {
    const messageIndex = messages.value.findIndex(
      (message) => message.id === id
    );

    if (messageIndex !== -1) {
      messages.value.splice(messageIndex, 1);
    }
  }

  return { messages, add, remove };
});
