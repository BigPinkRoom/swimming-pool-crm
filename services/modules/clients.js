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
}
