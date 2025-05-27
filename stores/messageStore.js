import { defineStore } from "pinia";

/**
 * @module stores/messageStore
 * @description Хранилище для управления сообщениями (уведомлениями) в приложении.
 */
export const useMessageStore = defineStore("message", () => {
  /**
   * Реактивный массив сообщений.
   * Каждое сообщение имеет `id`, `message`, `type` и `duration`.
   * @type {import("vue").Ref<Array<{id: number, message: string, type: string, duration: number}>>}
   */
  const messages = ref([]);

  /**
   * Добавляет новое сообщение в список.
   * @param {Object} data - Данные нового сообщения.
   * @param {string} data.message - Текст сообщения.
   * @param {string} data.type - Тип сообщения (например, 'success', 'error').
   * @param {number} data.duration - Длительность отображения сообщения в миллисекундах.
   */
  function add(data) {
    messages.value.push({
      id: Math.round(Math.random() * 1e6),
      message: String(data.message),
      type: data.type,
      duration: data.duration,
    });
  }

  /**
   * Удаляет сообщение из списка по его ID.
   * @param {number} id - ID сообщения для удаления.
   */
  function remove(id) {
    const messageIndex = messages.value.findIndex(
      (message) => message.id === id,
    );

    if (messageIndex !== -1) {
      messages.value.splice(messageIndex, 1);
    }
  }

  return { messages, add, remove };
});
