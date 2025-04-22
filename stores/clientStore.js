import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import Clients from "@/services/modules/clients";

const clientsService = new Clients();
const { createNewClient } = clientsService;

/**
 * Стор для управления списком клиентов в приложении.
 * Использует Pinia для управления состоянием и предоставляет методы для добавления, обновления и удаления клиентов.
 */
export const useClientsStore = defineStore("clients", () => {
  /**
   * Реактивный массив клиентов.
   * @type {Array<Object>}
   */
  const clients = reactive([]);

  /**
   * Реактивное значение текущего активного клиента (индекс, начиная с 1).
   * @type {number|null}
   */
  const currentClientId = ref(null);

  /**
   * Добавляет нового клиента в список.
   */
  function add(payload) {
    clients.push(payload);
  }

  /**
   * Добавляет клиента из редактирования
   */
  function setClientOfEdit(payload) {
    clients.push(payload);
    currentClientId.value = clients.length;
  }

  /**
   * Добавляет нового пустого клиента в список и делает его активным.
   * @returns {number} - Индекс нового клиента (начиная с 1)
   */
  const addEmpty = () => {
    const newClient = createNewClient();
    clients.push(newClient);
    const newIndex = clients.length;
    currentClientId.value = newIndex;
    return newIndex;
  };

  /**
   * Обновляет данные активного клиента.
   * @param {number} index - Индекс клиента (начиная с 1)
   * @param {Object} currentTempClient - Временные данные клиента
   */
  const updateActiveClient = (index, currentTempClient) => {
    const zeroBasedIndex = index - 1;
    if (zeroBasedIndex >= 0 && zeroBasedIndex < clients.length) {
      const activeClient = clients[zeroBasedIndex];
      activeClient.name = currentTempClient.name;
      activeClient.surname = currentTempClient.surname;
      activeClient.patronymic = currentTempClient.patronymic;
      activeClient.birthday = currentTempClient.birthday;
      activeClient.gender = currentTempClient.gender;
    }
  };

  /**
   * Удаляет клиента из списка по его индексу.
   * @param {number} index - Индекс клиента (начиная с 1)
   */
  const deleteClient = (index) => {
    const zeroBasedIndex = index - 1;
    if (zeroBasedIndex >= 0 && zeroBasedIndex < clients.length) {
      clients.splice(zeroBasedIndex, 1);

      // После удаления всегда активируем первый клиент
      if (clients.length > 0) {
        currentClientId.value = 1;
      } else {
        currentClientId.value = null;
      }
    }
  };

  /**
   * Сбрасывает стор
   */
  const reset = () => {
    clients.splice(0, clients.length);
    currentClientId.value = null;
  };

  return {
    clients,
    currentClientId,
    updateActiveClient,
    addEmpty,
    add,
    setClientOfEdit,
    deleteClient,
    reset,
  };
});
