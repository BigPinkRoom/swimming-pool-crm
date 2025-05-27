import ClientEntity from "@/entities/clientEntity";
import { formatDate } from "@/helpers/formatDate";
import { clientsConstants } from "@/constants/clients";
import Cleave from "cleave.js";

/**
 * Класс Clients управляет списком клиентов в приложении.
 * Он предоставляет методы для создания, поиска, удаления и управления клиентами.
 * @class Clients
 */
export default class Clients {
  /**
   * Создает экземпляр класса Clients.
   * @param {Object} context - Контекст приложения (например, Nuxt context).
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
   * @param {number} [maxLimit=10] - Максимально допустимое количество клиентов.
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
    // Создаем объект через литерал для обеспечения правильного прототипа
    const newClient = {};
    newClient.name = "";
    newClient.surname = "";
    newClient.patronymic = "";
    newClient.birthday = "";
    newClient.gender = null;

    return newClient;
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
   * @returns {string} Путь к изображению или пустая строка, если пол не определен.
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
   * @param {Object} tempClients - Объект с временными клиентами, где ключи - индексы клиентов.
   * @param {number} index - Индекс клиента (начиная с 1).
   * @returns {Object} Данные клиента (name, surname, patronymic, birthday, gender).
   */
  getTempClient = (tempClients, index) => {
    if (!tempClients[index]) {
      // Создаем объект через литерал для обеспечения правильного прототипа
      tempClients[index] = {};
      tempClients[index].name = "";
      tempClients[index].surname = "";
      tempClients[index].patronymic = "";
      tempClients[index].birthday = "";
      tempClients[index].gender = 0;
    }
    return tempClients[index];
  };

  /**
   * Подготавливает данные клиента для редактирования
   * @param {Object} client - Данные клиента.
   * @param {string} [client.clientName] - Имя клиента.
   * @param {string} [client.clientSurname] - Фамилия клиента.
   * @param {number} [client.clientGender=0] - Пол клиента.
   * @param {string|Date} [client.clientBirthday] - Дата рождения клиента.
   * @param {string} [client.clientPatronymic] - Отчество клиента.
   * @param {number|string} [client.clientId] - ID клиента.
   * @param {boolean} [client.isFirstClient] - Флаг первого клиента.
   * @param {boolean} [client.is_first_client] - Альтернативный флаг первого клиента.
   * @returns {Object} Подготовленные данные (name, surname, gender, birthday, patronymic, id?, isFirstClient?).
   */
  prepareClientForEdit = (client) => {
    // Создаем объект через литерал для обеспечения правильного прототипа
    const clientForStore = {};

    clientForStore.name = client.clientName || "";
    clientForStore.surname = client.clientSurname || "";
    clientForStore.gender = client.clientGender || 0;
    clientForStore.birthday = formatDate(client.clientBirthday) || "";
    clientForStore.patronymic = client.clientPatronymic || "";

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
   * @param {Object} client - Данные клиента из объекта семьи.
   * @param {string} [client.name] - Имя клиента.
   * @param {string} [client.surname] - Фамилия клиента.
   * @param {string} [client.patronymic] - Отчество клиента.
   * @param {string|Date} [client.birthday] - Дата рождения клиента.
   * @param {number} [client.gender] - Пол клиента.
   * @param {number|string} [client.id] - ID клиента.
   * @param {number|string} [client.clientId] - Альтернативный ID клиента.
   * @param {number|string} [client.client_id] - Еще один альтернативный ID клиента.
   * @param {boolean} [client.isFirstClient] - Флаг первого клиента.
   * @param {boolean} [client.is_first_client] - Альтернативный флаг первого клиента.
   * @returns {Object} Подготовленные данные (name, surname, patronymic, birthday, gender, id?, isFirstClient?).
   */
  prepareFamilyClient = (client) => {
    // Создаем объект через литерал для обеспечения правильного прототипа
    const clientForStore = {};

    clientForStore.name = client.name || "";
    clientForStore.surname = client.surname || "";
    clientForStore.patronymic = client.patronymic || "";
    clientForStore.birthday = formatDate(client.birthday) || "";
    clientForStore.gender = client.gender === undefined ? null : client.gender;

    // Обрабатываем ID из разных источников
    if (client.id) {
      clientForStore.id = client.id;
    } else if (client.clientId) {
      clientForStore.id = client.clientId;
    } else if (client.client_id) {
      clientForStore.id = client.client_id;
    }

    if (client.isFirstClient !== undefined) {
      clientForStore.isFirstClient = client.isFirstClient;
    } else if (client.is_first_client !== undefined) {
      clientForStore.isFirstClient = client.is_first_client;
    }

    return clientForStore;
  };

  /**
   * Форматирует строку с датой в формат ДД.ММ.ГГГГ.
   * @param {string|Date} dateString - Строка или объект Date для форматирования.
   * @returns {string} Отформатированная дата или пустая строка в случае невалидной даты.
   */
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

  /**
   * Асинхронно получает данные клиента по его ID.
   * @param {number|string} id - ID клиента.
   * @returns {Promise<Object|null>} Промис, который разрешается с объектом клиента или null, если клиент не найден.
   */
  getClientById = async (id) => {
    const params = {
      id,
    };
    const client = await this.context.$api.clients.getClientById(params);

    return client;
  };

  /**
   * Добавляет нового клиента в хранилище
   * @param {Object} store - Хранилище клиентов (Pinia store).
   * @param {Function} store.addEmpty - Метод хранилища для добавления пустого клиента.
   * @param {number} store.currentClientId - Свойство хранилища для установки текущего ID клиента.
   * @param {Array<Object>} store.clients - Массив клиентов в хранилище.
   * @param {Object} tempClients - Временное хранилище клиентов (реактивный объект).
   * @param {Function} resetForm - Функция сброса формы (например, из VeeValidate).
   * @param {Function} addInputMask - Функция добавления маски ввода для поля даты.
   * @returns {Promise<number|undefined>} Промис, который разрешается с индексом нового клиента или undefined, если достигнут лимит.
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
   * @param {Object} store - Хранилище клиентов (Pinia store).
   * @param {Array<Object>} store.clients - Массив клиентов.
   * @param {number} store.currentClientId - ID текущего активного клиента.
   * @param {Function} store.updateActiveClient - Метод обновления активного клиента в хранилище.
   * @param {Function} store.addEmpty - Метод добавления нового пустого клиента.
   * @param {Object} tempClients - Временное хранилище данных клиентов (реактивный объект).
   * @param {Object} currentTempClient - Текущие данные временного клиента из формы.
   * @param {Boolean} isEditing - Флаг, указывающий, находится ли форма в режиме редактирования.
   * @param {Function} resetForm - Функция сброса формы (VeeValidate).
   * @param {Function} validate - Функция валидации формы (VeeValidate).
   * @param {Function} addInputMask - Функция для добавления маски ввода к полю даты.
   * @returns {Promise<{isEditing: Boolean, newIndex?: Number}>} Промис с объектом, указывающим новый режим редактирования и опционально индекс нового клиента.
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
   * @param {Object} store - Хранилище клиентов (Pinia store).
   * @param {Array<Object>} store.clients - Массив клиентов.
   * @param {number} store.currentClientId - ID текущего активного клиента.
   * @param {Function} store.updateActiveClient - Метод обновления активного клиента в хранилище.
   * @param {Object} tempClients - Временное хранилище данных клиентов (реактивный объект).
   * @param {Object} currentTempClient - Текущие данные временного клиента из формы.
   * @param {Boolean} isEditing - Текущий флаг режима редактирования.
   * @param {Number} index - Индекс клиента, для которого переключается режим редактирования (начиная с 1).
   * @param {Function} resetForm - Функция сброса формы (VeeValidate).
   * @param {Function} addInputMask - Функция для добавления маски ввода к полю даты.
   * @returns {Promise<{isEditing: Boolean, clientData: Object}>} Промис с объектом, указывающим новый режим редактирования и данные клиента для формы.
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
   * @param {Boolean} value - Новое значение режима редактирования (true - редактирование, false - просмотр).
   * @param {Function} addInputMask - Функция добавления маски ввода для поля даты.
   * @returns {Promise<Boolean>} Промис, который разрешается с новым значением режима редактирования.
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
   * @param {Object} birthdayDate - Референс (Vue ref) на компонент поля ввода даты рождения (например, UiInput).
   * @param {Object} birthdayDate.$el - DOM-элемент компонента.
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
   * Обрабатывает изменение actionType (например, при открытии модального окна в режиме редактирования существующей семьи или добавления новой).
   * @param {Object} store - Хранилище клиентов (Pinia store).
   * @param {Function} store.reset - Метод сброса состояния хранилища.
   * @param {Function} store.setClientOfEdit - Метод установки данных клиента для редактирования.
   * @param {Object} tempClients - Временное хранилище данных клиентов (реактивный объект).
   * @param {Object} actionType - Объект, описывающий тип действия и связанные данные.
   * @param {string} actionType.type - Тип действия ('edit', 'add' и т.д.).
   * @param {Object} [actionType.family] - Данные семьи, если применимо.
   * @param {Array<Object>} [actionType.family.clients] - Список клиентов семьи.
   * @param {Function} resetForm - Функция сброса формы (VeeValidate).
   * @param {Function} addOneMoreClients - Функция добавления еще одного пустого клиента.
   * @returns {Promise<{isEditing: Boolean}>} Промис с объектом, указывающим новый режим редактирования.
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

    // Для данных из поиска семьи или других источников семейных данных
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

    // Если нет предзагруженных клиентов, добавляем пустого
    await addOneMoreClients();
    return { isEditing: true };
  };

  /**
   * Добавляет клиента в хранилище
   * @param {Object} store - Хранилище клиентов (Pinia store).
   * @param {Array<Object>} store.clients - Массив клиентов.
   * @param {Function} store.updateActiveClient - Метод обновления активного клиента в хранилище.
   * @param {Object} tempClients - Временное хранилище данных клиентов (не используется в текущей реализации этой функции).
   * @param {Object} currentTempClient - Текущие данные временного клиента из формы.
   * @param {Number} activeIndex - Индекс активного клиента (начиная с 1).
   * @param {Function} validate - Функция валидации формы (VeeValidate).
   * @param {Function} toggleEditing - Функция переключения режима редактирования.
   * @param {Function} addOneMoreClients - Функция добавления еще одного пустого клиента.
   * @returns {Promise<void>} Промис завершается после выполнения операций.
   * @throws {Error} Пробрасывает ошибку, если валидация не пройдена.
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
   * @param {Object} store - Хранилище клиентов (Pinia store).
   * @param {Function} store.deleteClient - Метод удаления клиента из хранилища.
   * @param {Array<Object>} store.clients - Массив клиентов.
   * @param {Object} tempClients - Временное хранилище данных клиентов (реактивный объект).
   * @param {Number} index - Индекс клиента для удаления (начиная с 1).
   * @param {Function} resetForm - Функция сброса формы (VeeValidate).
   * @param {Function} addInputMask - Функция для добавления маски ввода к полю даты.
   * @param {Function} toggleEditing - Функция переключения режима редактирования.
   * @param {Function} addOneMoreClients - Функция добавления еще одного пустого клиента.
   * @returns {Promise<{isEditing: Boolean, showOneMoreClient: Boolean}>} Промис с объектом, указывающим новый режим редактирования и флаг показа нового клиента.
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
