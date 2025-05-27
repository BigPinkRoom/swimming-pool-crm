/**
 * @class AbonementsTable
 * @classdesc Сервис для управления данными таблицы абонементов.
 */
export default class AbonementsTable {
  /**
   * Создает экземпляр сервиса AbonementsTable.
   * @param {object} context - Контекст приложения.
   */
  constructor(context) {
    this.context = context;
  }
}

/**
 * @typedef {object} AbonementsService - Экземпляр сервиса Abonements.
 * @property {Function} getFullAbonements - Асинхронная функция для получения полных данных абонементов.
 */

/**
 * @typedef {Function} CreateFamilyModelResponseFunction
 * @param {Array<any>} rawData - Массив необработанных данных абонементов.
 * @returns {Array<object>} - Массив обработанных объектов семей с абонементами.
 */

/**
 * Получает и обрабатывает полный список абонементов для таблицы.
 *
 * @async
 * @function fetchAndProcessAbonements
 * @param {object} dependencies - Зависимости, необходимые для выполнения функции.
 * @param {AbonementsService} dependencies.abonementsService - Экземпляр сервиса Abonements.
 * @param {CreateFamilyModelResponseFunction} dependencies.createFamilyModelResponseFn - Функция для преобразования ответа API в модель представления.
 * @returns {Promise<Array<object>>} Обработанный список абонементов.
 * @throws {Error} Если полученные данные некорректны или произошла ошибка при получении данных.
 */
export async function fetchAndProcessAbonements({
  abonementsService,
  createFamilyModelResponseFn,
}) {
  try {
    const response = await abonementsService.getFullAbonements(); // Вызов метода на экземпляре сервиса
    const createdModel = createFamilyModelResponseFn(response);

    if (!createdModel || !Array.isArray(createdModel)) {
      throw new Error(
        "[AbonementsTableService] Error: createdModel is not a valid array after initial fetch",
      );
    }
    return createdModel;
  } catch (error) {
    console.error(
      "[AbonementsTableService] Error fetching or processing abonements:",
      error,
    );
    throw error;
  }
}

/**
 * Фильтрует события семьи для указанного дня.
 * @param {number} day - День месяца.
 * @param {object} family - Объект семьи, содержащий массив событий.
 * @param {Array<object>} family.events - Массив событий семьи.
 * @returns {Array<object>} - Массив событий для указанного дня.
 */
export function getEventsForDay(day, family) {
  if (!family || !Array.isArray(family.events)) return [];

  return family.events.filter((event) => {
    const eventDay = new Date(event.date).getDate();
    return Number(eventDay) === Number(day);
    // && Number(event.abonementId) === Number(abonementId) // TO DO - параметр abonementId был удален, т.к. не использовался в оригинальной логике
  });
}

/**
 * @typedef {Array<object>} SortingsArray - Массив объектов для параметров сортировки.
 * @property {string} name - Ключ для сортировки.
 * @property {('ASC'|'DESC')} type - Направление сортировки.
 */

/**
 * Получает и обрабатывает отсортированные данные абонементов.
 *
 * @async
 * @function getProcessedSortedAbonements
 * @param {object} dependencies - Зависимости, необходимые для выполнения функции.
 * @param {AbonementsService} dependencies.abonementsService - Экземпляр сервиса Abonements.
 * @param {SortingsArray} dependencies.sortings - Массив параметров сортировки.
 * @param {CreateFamilyModelResponseFunction} dependencies.createFamilyModelResponseFn - Функция для преобразования ответа API.
 * @returns {Promise<Array<object>>} Отсортированный и обработанный список абонементов.
 * @throws {Error} Если произошла ошибка при получении или обработке данных.
 */
export async function getProcessedSortedAbonements({
  abonementsService,
  sortings,
  createFamilyModelResponseFn,
}) {
  // В этой функции нет собственного try/catch, так как getFullAbonements в abonementsService
  // уже обрабатывает ошибку и пробрасывает ее. Вызывающий код (в компоненте) будет ловить ее.
  const response = await abonementsService.getFullAbonements({ sortings });
  const createdModel = createFamilyModelResponseFn(response);

  if (!createdModel || !Array.isArray(createdModel)) {
    // Можно выбросить специфичную ошибку, если модель невалидна после сортировки
    throw new Error(
      "[AbonementsTableService] Error: Processed sorted data is not a valid array.",
    );
  }
  return createdModel;
}

/**
 * @typedef {object} FiltersObject - Объект с параметрами фильтрации.
 * // Можно детализировать типы для каждого фильтра, если они известны и постоянны
 */

/**
 * Получает и обрабатывает отфильтрованные данные абонементов.
 *
 * @async
 * @function getProcessedFilteredAbonements
 * @param {object} dependencies - Зависимости, необходимые для выполнения функции.
 * @param {AbonementsService} dependencies.abonementsService - Экземпляр сервиса Abonements.
 * @param {FiltersObject} dependencies.filters - Объект с параметрами фильтрации от компонента.
 * @param {CreateFamilyModelResponseFunction} dependencies.createFamilyModelResponseFn - Функция для преобразования ответа API.
 * @returns {Promise<Array<object>>} Отфильтрованный и обработанный список абонементов.
 * @throws {Error} Если произошла ошибка при получении или обработке данных.
 */
export async function getProcessedFilteredAbonements({
  abonementsService,
  filters,
  createFamilyModelResponseFn,
}) {
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

  const response = await abonementsService.getFullAbonements({
    filters: activeFilters,
  });
  const createdModel = createFamilyModelResponseFn(response);

  if (!createdModel || !Array.isArray(createdModel)) {
    throw new Error(
      "[AbonementsTableService] Error: Processed filtered data is not a valid array.",
    );
  }
  return createdModel;
}
