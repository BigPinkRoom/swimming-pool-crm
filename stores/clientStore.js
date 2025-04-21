import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import Clients from "@/services/modules/clients";

const clientsService = new Clients();
const {
  createNewClientId,
  findClientById,
  createNewClient,
  findClientIndexById,
  removeClientByIndex,
  reassignClientIds,
  updateActiveClientAfterDeletion,
} = clientsService;

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
   * Реактивное значение текущего активного клиента (ID).
   * @type {number|null}
   */
  const currentClientId = ref(null);

  /**
   * Добавляет нового клиента в список.
   *
   * @param {Object} payload - Объект с данными нового клиента.
   * @param {string} payload.name - Имя клиента.
   * @param {string} payload.surname - Фамилия клиента.
   * @param {string} payload.patronymic - Отчество клиента.
   * @param {string} payload.birthday - Дата рождения клиента.
   * @param {string|null} payload.gender - Пол клиента.
   */
  function add(payload) {
    const newId = createNewClientId(clients);
    payload.id = newId;

    clients.push(payload);
  }

  function setClientOfEdit(payload) {
    clients.push(payload);
  }

  /**
   * Добавляет нового пустого клиента в список и делает его активным.
   *
   * @returns {number} - ID нового клиента.
   */
  const addEmpty = () => {
    const newId = createNewClientId(clients);
    clients.push(createNewClient(newId));
    currentClientId.value = newId;

    return newId;
  };

  /**
   * Обновляет данные активного клиента на основе переданных временных данных.
   *
   * @param {number} id - ID клиента, которого нужно обновить.
   * @param {Object} currentTempClient - Реактивный объект с временными данными клиента.
   * @param {string} currentTempClient.value.name - Новое имя клиента.
   * @param {string} currentTempClient.value.surname - Новая фамилия клиента.
   * @param {string} currentTempClient.value.patronymic - Новое отчество клиента.
   * @param {string} currentTempClient.value.birthday - Новая дата рождения клиента.
   * @param {string|null} currentTempClient.value.gender - Новый пол клиента.
   */
  const updateActiveClient = (id, currentTempClient) => {
    const activeClient = findClientById(clients, id);

    activeClient.name = currentTempClient.value.name;
    activeClient.surname = currentTempClient.value.surname;
    activeClient.patronymic = currentTempClient.value.patronymic;
    activeClient.birthday = currentTempClient.value.birthday;
    activeClient.gender = currentTempClient.value.gender;
    activeClient.isNew = true;
  };

  /**
   * Удаляет клиента из списка по его ID.
   * После удаления переопределяет ID оставшихся клиентов и обновляет активного клиента.
   *
   * @param {number} id - ID клиента, которого нужно удалить.
   */
  const deleteClient = (id) => {
    const index = findClientIndexById(clients, id);
    if (index === -1) return;

    removeClientByIndex(clients, index);
    // reassignClientIds(clients);
    updateActiveClientAfterDeletion({
      clients,
      currentClientId,
      deletedClientId: id,
      index,
    });
  };

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
