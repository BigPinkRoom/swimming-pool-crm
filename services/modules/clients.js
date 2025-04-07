import ClientEntity from "@/entities/clientEntity";

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
  constructor({ context } = {}) {
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
   * Генерирует новый уникальный идентификатор для клиента на основе текущего списка клиентов.
   *
   * @param {Array<Object>} clients - Список существующих клиентов.
   * @returns {number} - Новый уникальный идентификатор клиента.
   */
  createNewClientId = (clients) => {
    return clients.length === 0
      ? 1
      : Math.max(...clients.map((client) => client.id)) + 1;
  };

  /**
   * Находит клиента по его идентификатору.
   *
   * @param {Array<Object>} clients - Список клиентов.
   * @param {number} id - Идентификатор клиента.
   * @returns {Object|null} - Объект клиента, если найден, или null, если клиент не существует.
   */
  findClientById = (clients, id) => {
    return clients.find((client) => client.id === id);
  };

  /**
   * Находит индекс клиента в массиве по его идентификатору.
   *
   * @param {Array<Object>} clients - Список клиентов.
   * @param {number} id - Идентификатор клиента.
   * @returns {number} - Индекс клиента в массиве, или -1, если клиент не найден.
   */
  findClientIndexById = (clients, id) => {
    return clients.findIndex((client) => client.id === id);
  };

  /**
   * Разделяет список клиентов на три секции: до активного клиента, активный клиент и после активного клиента.
   *
   * @param {Array<Object>} clients - Список клиентов.
   * @param {number} activeId - Идентификатор активного клиента.
   * @returns {Object} - Объект с тремя секциями:
   *   - before: Массив клиентов до активного клиента.
   *   - active: Активный клиент (или null, если активный клиент не найден).
   *   - after: Массив клиентов после активного клиента.
   */
  getClientsSections = (clients, activeId) => {
    const activeIndex = clients.findIndex((client) => client.id === activeId);
    return {
      before: clients.slice(0, activeIndex),
      active: activeIndex !== -1 ? clients[activeIndex] : null,
      after: clients.slice(activeIndex + 1),
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
   * @param {number} id - Идентификатор нового клиента.
   * @returns {Object} - Объект нового клиента со следующими полями:
   *   - id: Идентификатор клиента.
   *   - name: Имя клиента (пустая строка по умолчанию).
   *   - surname: Фамилия клиента (пустая строка по умолчанию).
   *   - patronymic: Отчество клиента (пустая строка по умолчанию).
   *   - birthday: Дата рождения клиента (пустая строка по умолчанию).
   *   - gender: Пол клиента (null по умолчанию).
   */
  createNewClient = (id) => {
    return this.clientsEntity.createNewClient(id);
  };

  /**
   * Переопределяет идентификаторы клиентов в списке, начиная с 1.
   *
   * @param {Array<Object>} clients - Список клиентов для переопределения ID.
   */
  reassignClientIds = (clients) => {
    clients.forEach((client, idx) => {
      client.id = idx + 1;
    });
  };

  /**
   * Обновляет активного клиента после удаления другого клиента.
   *
   * @param {Object} options - Параметры для обновления активного клиента.
   * @param {Array<Object>} options.clients - Список клиентов.
   * @param {Object} options.currentClientId - Реактивный объект, содержащий ID текущего активного клиента.
   * @param {number} options.deletedClientId - ID удаленного клиента.
   * @param {number} options.index - Индекс удаленного клиента в массиве.
   */
  updateActiveClientAfterDeletion = ({
    clients,
    currentClientId,
    deletedClientId,
    index,
  }) => {
    if (currentClientId.value === deletedClientId) {
      if (clients.length > 0) {
        currentClientId.value = clients[index]?.id || clients[index - 1]?.id;
      } else {
        currentClientId.value = null;
      }
    }
  };

  /**
   * Удаляет клиента из списка по его индексу.
   *
   * @param {Array<Object>} clients - Список клиентов.
   * @param {number} index - Индекс клиента, которого нужно удалить.
   */
  removeClientByIndex = (clients, index) => {
    clients.splice(index, 1);
  };
}
