import ClientEntity from "@/entities/clientEntity";
import { formatDate } from "@/helpers/formatDate";
import { clientsConstants } from "@/constants/clients";
import Cleave from "cleave.js";

/**
 * Класс Clients управляет списком клиентов в приложении.
 * Он предоставляет методы для создания, поиска, удаления и управления клиентами.
 */
export default class Clients {
  /**
   * Создает экземпляр класса Clients.
   * @param {Object} options - Параметры инициализации.
   * @param {Object} options.context - Контекст приложения (например, Nuxt контекст).
   */
  constructor(context) {
    /**
     * @type {Object}
     * @description Контекст приложения, который может использоваться для доступа к глобальным объектам или сервисам.
     */
    this.context = context;

    /**
     * @type {ClientEntity}
     * @description Экземпляр класса ClientEntity для работы с данными клиента.
     */
    this.clientsEntity = new ClientEntity({ context });
  }

  /**
   * Разделяет список клиентов на три секции: до активного клиента, активный клиент и после активного клиента.
   *
   * @param {Array<Object>} clients - Список клиентов.
   * @param {number} activeIndex - Индекс активного клиента (начиная с 1).
   * @returns {Object} - Объект с тремя секциями:
   *   - before: Массив клиентов до активного клиента.
   *   - active: Активный клиент (или null, если активный клиент не найден).
   *   - after: Массив клиентов после активного клиента.
   */
  getClientsSections = (clients, activeIndex) => {
    const zeroBasedIndex = activeIndex - 1;

    return {
      before: clients.slice(0, zeroBasedIndex),
      active:
        zeroBasedIndex >= 0 && zeroBasedIndex < clients.length
          ? clients[zeroBasedIndex]
          : null,
      after: clients.slice(zeroBasedIndex + 1),
    };
  };

  /**
   * Проверяет, достигнуто ли максимальное количество клиентов.
   *
   * @param {Array<Object>} clients - Список клиентов.
   * @param {number} maxLimit - Максимально допустимое количество клиентов (по умолчанию 10).
   * @returns {boolean} - Возвращает true, если лимит достигнут, иначе false.
   */
  isMaxClientsLimitReached = (clients, maxLimit = 10) => {
    return clients.length >= maxLimit;
  };

  /**
   * Создает нового клиента с пустыми полями.
   *
   * @returns {Object} - Объект нового клиента со следующими полями:
   *   - name: Имя клиента (пустая строка по умолчанию).
   *   - surname: Фамилия клиента (пустая строка по умолчанию).
   *   - patronymic: Отчество клиента (пустая строка по умолчанию).
   *   - birthday: Дата рождения клиента (пустая строка по умолчанию).
   *   - gender: Пол клиента (null по умолчанию).
   */
  createNewClient = () => {
    return {
      name: "",
      surname: "",
      patronymic: "",
      birthday: "",
      gender: null,
    };
  };

  /**
   * Получает текст для кнопки добавления клиента
   * @param {number} clientsCount - Текущее количество клиентов
   * @returns {string} Текст кнопки
   */
  getAddClientButtonText = (clientsCount) => {
    const checkClientLessMax =
      clientsCount < clientsConstants.MAX_QUANTITY_CLIENTS;
    const checkClientEqualMax =
      clientsCount >= clientsConstants.MAX_QUANTITY_CLIENTS;

    if (checkClientLessMax) {
      return "+ Добавить ещё одного ребёнка";
    } else if (checkClientEqualMax) {
      return "Максимальное количество детей";
    } else {
      return "+ Добавить ребёнка";
    }
  };

  /**
   * Получает путь к изображению в зависимости от пола
   * @param {number} gender - Пол клиента (0 - мальчик, 1 - девочка)
   * @returns {string} Путь к изображению
   */
  getGenderImage = (gender) => {
    switch (gender) {
      case 1:
        return "/icons/girl.svg";
      case 0:
        return "/icons/boy.svg";
      default:
        return "";
    }
  };

  /**
   * Получает или создает временного клиента
   * @param {Object} tempClients - Объект с временными клиентами
   * @param {number} index - Индекс клиента (начиная с 1)
   * @returns {Object} Данные клиента
   */
  getTempClient = (tempClients, index) => {
    if (!tempClients[index]) {
      tempClients[index] = {
        name: "",
        surname: "",
        patronymic: "",
        birthday: "",
        gender: 0,
      };
    }
    return tempClients[index];
  };

  /**
   * Подготавливает данные клиента для редактирования
   * @param {Object} client - Данные клиента
   * @returns {Object} Подготовленные данные
   */
  prepareClientForEdit = (client) => {
    const clientForStore = {
      name: client.clientName || "",
      surname: client.clientSurname || "",
      gender: client.clientGender || 0,
      birthday: formatDate(client.clientBirthday) || "",
      patronymic: client.clientPatronymic || "",
    };

    if (client.clientId) {
      clientForStore.id = client.clientId;
    }

    if (client.isFirstClient !== undefined) {
      clientForStore.isFirstClient = client.isFirstClient;
    } else if (client.is_first_client !== undefined) {
      clientForStore.isFirstClient = client.is_first_client;
    }

    return clientForStore;
  };

  /**
   * Подготавливает данные клиента из семьи
   * @param {Object} client - Данные клиента
   * @returns {Object} Подготовленные данные
   */
  prepareFamilyClient = (client) => {
    const clientForStore = {
      name: client.name || "",
      surname: client.surname || "",
      patronymic: client.patronymic || "",
      birthday: formatDate(client.birthday) || "",
      gender: client.gender === undefined ? null : client.gender,
    };

    if (client.id) {
      clientForStore.id = client.id;
    }

    if (client.isFirstClient !== undefined) {
      clientForStore.isFirstClient = client.isFirstClient;
    } else if (client.is_first_client !== undefined) {
      clientForStore.isFirstClient = client.is_first_client;
    }

    return clientForStore;
  };

  formatDate(dateString) {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", dateString);
      return "";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }

  getClientById = async (id) => {
    const params = {
      id,
    };
    const client = await this.context.$api.clients.getClientById(params);

    return client;
  };

  /**
   * Добавляет нового клиента в хранилище
   * @param {Object} store - Хранилище клиентов
   * @param {Object} tempClients - Временное хранилище клиентов
   * @param {Function} resetForm - Функция сброса формы
   * @param {Function} addInputMask - Функция добавления маски ввода
   * @returns {Promise<void>}
   */
  addOneMoreClient = async (store, tempClients, resetForm, addInputMask) => {
    if (this.isMaxClientsLimitReached(store.clients)) return;

    const newIndex = store.addEmpty();
    store.currentClientId = newIndex;

    resetForm({
      values: {
        name: "",
        surname: "",
        patronymic: "",
        birthday: "",
        gender: 0,
      },
    });

    await nextTick();
    addInputMask();

    tempClients[newIndex] = {
      name: "",
      surname: "",
      patronymic: "",
      birthday: "",
      gender: 0,
      isEditing: true,
    };

    return newIndex;
  };

  /**
   * Обрабатывает клик по кнопке добавления клиента
   * @param {Object} store - Хранилище клиентов
   * @param {Object} tempClients - Временное хранилище клиентов
   * @param {Object} currentTempClient - Текущий временный клиент
   * @param {Boolean} isEditing - Флаг режима редактирования
   * @param {Function} resetForm - Функция сброса формы
   * @param {Function} validate - Функция валидации формы
   * @param {Function} addInputMask - Функция добавления маски ввода
   * @returns {Promise<{isEditing: Boolean, newIndex?: Number}>}
   */
  handleAddClientButtonClick = async (
    store,
    tempClients,
    currentTempClient,
    isEditing,
    resetForm,
    validate,
    addInputMask,
  ) => {
    if (isEditing) {
      const isExistingClient = store.clients[store.currentClientId - 1]?.id;

      if (isExistingClient) {
        const currentClientData = { ...currentTempClient };
        store.updateActiveClient(store.currentClientId, currentClientData);
        tempClients[store.currentClientId] = { ...currentClientData };

        const hasNewUnsavedClient = store.clients.some((client) => !client.id);

        if (hasNewUnsavedClient) {
          const newClientIndex =
            store.clients.findIndex((client) => !client.id) + 1;
          store.currentClientId = newClientIndex;
          resetForm({
            values: this.getTempClient(tempClients, newClientIndex),
          });
          await nextTick();
          addInputMask();
          return { isEditing: true };
        }

        const newIndex = store.addEmpty();
        store.currentClientId = newIndex;

        resetForm({
          values: {
            name: "",
            surname: "",
            patronymic: "",
            birthday: "",
            gender: 0,
          },
        });

        tempClients[newIndex] = {
          name: "",
          surname: "",
          patronymic: "",
          birthday: "",
          gender: 0,
          isEditing: true,
        };

        await nextTick();
        addInputMask();
        return { isEditing: true, newIndex };
      }

      const resultValidate = await validate();
      if (resultValidate.valid) {
        const currentClientData = { ...currentTempClient };
        store.updateActiveClient(store.currentClientId, currentClientData);
        tempClients[store.currentClientId] = { ...currentClientData };
        return { isEditing: false };
      }
      return { isEditing: true };
    }

    const hasNewUnsavedClient = store.clients.some((client) => !client.id);

    if (hasNewUnsavedClient) {
      const newClientIndex =
        store.clients.findIndex((client) => !client.id) + 1;
      store.currentClientId = newClientIndex;
      resetForm({ values: this.getTempClient(tempClients, newClientIndex) });
      await nextTick();
      addInputMask();
      return { isEditing: true };
    }

    if (this.isMaxClientsLimitReached(store.clients)) {
      return { isEditing: false };
    }

    const newIndex = store.addEmpty();
    store.currentClientId = newIndex;

    resetForm({
      values: {
        name: "",
        surname: "",
        patronymic: "",
        birthday: "",
        gender: 0,
      },
    });

    tempClients[newIndex] = {
      name: "",
      surname: "",
      patronymic: "",
      birthday: "",
      gender: 0,
      isEditing: true,
    };

    await nextTick();
    addInputMask();
    return { isEditing: true, newIndex };
  };

  /**
   * Изменяет режим редактирования для клиента
   * @param {Object} store - Хранилище клиентов
   * @param {Object} tempClients - Временное хранилище клиентов
   * @param {Object} currentTempClient - Текущий временный клиент
   * @param {Boolean} isEditing - Текущий режим редактирования
   * @param {Number} index - Индекс клиента
   * @param {Function} resetForm - Функция сброса формы
   * @param {Function} addInputMask - Функция добавления маски ввода
   * @returns {Promise<{isEditing: Boolean, clientData: Object}>}
   */
  changeEdit = async (
    store,
    tempClients,
    currentTempClient,
    isEditing,
    index,
    resetForm,
    addInputMask,
  ) => {
    if (isEditing) {
      const currentClientData = { ...currentTempClient };
      store.updateActiveClient(store.currentClientId, currentClientData);
      tempClients[store.currentClientId] = { ...currentClientData };
    }

    store.currentClientId = index;
    const clientData = store.clients[index - 1];

    if (clientData) {
      tempClients[index] = { ...clientData };
    }

    resetForm({ values: this.getTempClient(tempClients, index) });
    await nextTick();
    addInputMask();

    return { isEditing: true, clientData };
  };

  /**
   * Переключает режим редактирования
   * @param {Boolean} value - Новое значение режима редактирования
   * @param {Function} addInputMask - Функция добавления маски ввода
   * @returns {Promise<Boolean>} Новое значение режима редактирования
   */
  toggleEditing = async (value, addInputMask) => {
    if (value === true) {
      await nextTick();
      addInputMask();
    }
    return value;
  };

  /**
   * Добавляет маску ввода для поля даты рождения
   * @param {Object} birthdayDate - Референс на поле даты рождения
   * @returns {void}
   */
  addInputMask = (birthdayDate) => {
    if (birthdayDate?.$el) {
      const inputElement = birthdayDate.$el.querySelector("input");
      if (inputElement) {
        if (inputElement._cleave) {
          inputElement._cleave.destroy();
        }
        new Cleave(inputElement, {
          date: true,
          delimiter: ".",
          datePattern: ["d", "m", "Y"],
          blocks: [2, 2, 4],
          numericOnly: true,
          dateMax: "31.12.2100",
          max: "31122100",
        });
      }
    }
  };

  /**
   * Обрабатывает изменение actionType
   * @param {Object} store - Хранилище клиентов
   * @param {Object} tempClients - Временное хранилище клиентов
   * @param {Object} actionType - Новый тип действия
   * @param {Function} resetForm - Функция сброса формы
   * @param {Function} addOneMoreClients - Функция добавления клиента
   * @returns {Promise<{isEditing: Boolean}>}
   */
  handleActionTypeChange = async (
    store,
    tempClients,
    actionType,
    resetForm,
    addOneMoreClients,
  ) => {
    store.reset();
    Object.keys(tempClients).forEach((key) => delete tempClients[key]);

    if (actionType?.type === "edit") {
      const clients = actionType.family?.clients;
      if (clients && clients.length > 0) {
        clients.forEach((client, index) => {
          const clientForStore = this.prepareClientForEdit(client);
          store.setClientOfEdit(clientForStore);
          tempClients[index + 1] = { ...clientForStore };
        });
        store.currentClientId = 1;
        resetForm({ values: { ...tempClients[1] } });
        return { isEditing: false };
      }
      await addOneMoreClients();
      return { isEditing: true };
    }

    const familyClients = actionType?.family?.clients;
    if (familyClients && familyClients.length > 0) {
      familyClients.forEach((client, index) => {
        const clientForStore = this.prepareFamilyClient(client);
        store.setClientOfEdit(clientForStore);
        tempClients[index + 1] = { ...clientForStore };
      });

      store.currentClientId = 1;
      resetForm({ values: { ...tempClients[1] } });
      return { isEditing: false };
    }

    await addOneMoreClients();
    return { isEditing: true };
  };

  /**
   * Добавляет клиента в хранилище
   * @param {Object} store - Хранилище клиентов
   * @param {Object} tempClients - Временное хранилище клиентов
   * @param {Object} currentTempClient - Текущий временный клиент
   * @param {Number} activeIndex - Индекс активного клиента
   * @param {Function} validate - Функция валидации формы
   * @param {Function} toggleEditing - Функция переключения режима редактирования
   * @param {Function} addOneMoreClients - Функция добавления клиента
   * @returns {Promise<void>}
   */
  addClientToStore = async (
    store,
    tempClients,
    currentTempClient,
    activeIndex,
    validate,
    toggleEditing,
    addOneMoreClients,
  ) => {
    try {
      const resultValidate = await validate();
      if (resultValidate.valid) {
        const tempClient = { ...currentTempClient };
        const isFirstClient = store.clients.length === 0;
        store.updateActiveClient(activeIndex, tempClient);

        if (isFirstClient) {
          await toggleEditing(false);
        } else {
          await addOneMoreClients();
        }
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Удаляет клиента и активирует следующего
   * @param {Object} store - Хранилище клиентов
   * @param {Object} tempClients - Временное хранилище клиентов
   * @param {Number} index - Индекс клиента для удаления
   * @param {Function} resetForm - Функция сброса формы
   * @param {Function} addInputMask - Функция добавления маски ввода
   * @param {Function} toggleEditing - Функция переключения режима редактирования
   * @param {Function} addOneMoreClients - Функция добавления клиента
   * @returns {Promise<{isEditing: Boolean, showOneMoreClient: Boolean}>}
   */
  deleteClient = async (
    store,
    tempClients,
    index,
    resetForm,
    addInputMask,
    toggleEditing,
    addOneMoreClients,
  ) => {
    store.deleteClient(index);
    delete tempClients[index];

    if (store.clients.length === 0) {
      await addOneMoreClients();
      return { isEditing: true, showOneMoreClient: true };
    }

    store.currentClientId = 1;
    await nextTick();
    resetForm({ values: this.getTempClient(tempClients, 1) });
    await toggleEditing(false);
    return { isEditing: false, showOneMoreClient: false };
  };
}
