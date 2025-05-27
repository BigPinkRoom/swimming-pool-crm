import { isEmpty } from "lodash-es";
import { getCurrentDate } from "@/helpers/getCurrentDate";
import { columnsHeadersEnums } from "@/constants/enums/abonementsTableFull";
import { formatDate } from "@/helpers/formatDate";

/**
 * @class Abonements
 * @classdesc Сервис для управления абонементами.
 */
export default class Abonements {
  /**
   * Создает экземпляр сервиса Abonements.
   * @param {object} context - Контекст приложения (например, Nuxt context).
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * Возвращает массив дней текущего месяца.
   * @returns {number[]} Массив чисел, представляющих дни месяца.
   */
  getDaysOfCurrentMonth() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    const monthCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return monthCells;
  }

  /**
   * Асинхронно получает полный список абонементов с возможностью сортировки и фильтрации.
   * @param {object} [options={}] - Опции для запроса.
   * @param {Array<object>} [options.sortings=[]] - Массив объектов для сортировки.
   * @param {object} [options.filters={}] - Объект с параметрами фильтрации.
   * @returns {Promise<object|undefined>} Промис, который разрешается с данными абонементов или undefined в случае ошибки.
   */
  async getFullAbonements({ sortings = [], filters = {} } = {}) {
    try {
      const params = {};

      if (!sortings.length) {
        params.sortings = [{ name: "abonements.abonement_id", type: "ASC" }];
      } else {
        params.sortings = sortings;
      }

      if (isEmpty(filters)) {
        // params.filters = {
        //   year: getCurrentDate().currentYear,
        //   month: getCurrentDate().currentMonth,
        // };
      } else {
        params.filters = filters;
      }

      const response = await this.context.$api.abonements.getFull({
        params,
      });

      return response;
    } catch (error) {
      this.context.$showError(error);
    }
  }

  /**
   * Асинхронно добавляет новую семью.
   * @param {object} params - Параметры для добавления семьи.
   * @returns {Promise<object>} Промис, который разрешается с ответом сервера.
   */
  async addFamily(params) {
    const response = await this.context.$api.abonements.addFamily(params);

    return response;
  }

  /**
   * Асинхронно обновляет данные семьи.
   * @param {object} params - Параметры для обновления семьи.
   * @returns {Promise<object>} Промис, который разрешается с ответом сервера.
   */
  async updateFamily(params) {
    const response = await this.context.$api.abonements.updateFamily(params);

    return response;
  }
}

/**
 * Нормализует структуру абонемента для единообразного использования в приложении
 * @param {Object} abonement - Исходный объект абонемента
 * @returns {Object} Нормализованный объект абонемента
 */
export function normalizeAbonement(abonement) {
  // Создаем объект через литерал для обеспечения правильного прототипа
  const normalized = {};

  normalized.abonement_id =
    abonement.abonement_id ??
    abonement.id ??
    abonement.abonementId ??
    abonement.abonement_number;

  normalized.visits_quantity =
    abonement.visits_quantity ?? abonement.visitsQuantity ?? abonement.visits;

  normalized.visits_left =
    abonement.visits_left ?? abonement.visitsLeft ?? abonement.remaining_visits;

  normalized.date_create =
    abonement.date_create ?? abonement.dateCreate ?? abonement.created_at;

  normalized.date_start =
    abonement.date_start ?? abonement.dateStart ?? abonement.start_date;

  normalized.date_end =
    abonement.date_end ?? abonement.dateEnd ?? abonement.end_date;

  normalized.user_created_id =
    abonement.user_created_id ??
    abonement.userCreatedId ??
    abonement.created_by;

  normalized.status_id =
    abonement.status_id ?? abonement.statusId ?? abonement.status;

  normalized.branch_id =
    abonement.branch_id ?? abonement.branchId ?? abonement.branch;

  return normalized;
}

/**
 * Нормализует массив абонементов
 * @param {Array} abonements - Массив абонементов
 * @returns {Array} Массив нормализованных абонементов
 */
export function normalizeAbonements(abonements) {
  if (!Array.isArray(abonements)) return [];
  return abonements.map(normalizeAbonement);
}

/**
 * Формирует опции для селекта абонементов
 * @param {Array} abonements - Массив абонементов
 * @returns {Array} Массив опций для селекта
 */
export function getAbonementOptions(abonements) {
  if (!Array.isArray(abonements)) return [];

  return abonements.map((abonement) => ({
    text: `№ ${abonement.abonement_id} - (${abonement.visits_left ?? "-"} / ${
      abonement.visits_quantity ?? "-"
    } занятий) До ${formatDate(abonement.date_end, true) ?? "-"}`,
    value: abonement.abonement_id,
  }));
}

/**
 * Получает текущий активный абонемент
 * @param {Array} abonements - Массив абонементов
 * @returns {Object|null} Активный абонемент или null
 */
export function getCurrentActiveAbonement(abonements) {
  if (!Array.isArray(abonements)) return null;

  return (
    abonements.find((a) => a.statusType === "active") || abonements[0] || null
  );
}

/**
 * Сбрасывает временный абонемент к начальным значениям
 * @returns {Object} Объект с начальными значениями
 */
export function getInitialTempAbonement() {
  return {
    duration: null,
    quantity: null,
    activationDate: null,
    selectedActiveAbonement: null,
  };
}

/**
 * Получает начальные значения для формы
 * @param {number} abonementType - Тип абонемента (0 - новый, 1 - существующий)
 * @returns {Object} Начальные значения формы
 */
export function getInitialFormValues(abonementType = 0) {
  return {
    quantity: null,
    duration: null,
    activationDate: "",
    abonementType,
  };
}

/**
 * Обрабатывает переключение типа абонемента
 * @param {number} newType - Новый тип абонемента (0 - новый, 1 - существующий)
 * @param {Array} abonementOptions - Опции абонементов
 * @returns {Object} Объект с обновленными значениями
 */
export function handleAbonementTypeChange(newType, abonementOptions) {
  const selectedActiveAbonement =
    newType === 0 ? null : (abonementOptions?.[0]?.value ?? null);

  return {
    selectedActiveAbonement,
    formValues: getInitialFormValues(newType),
  };
}

/**
 * Обрабатывает изменение опций абонементов
 * @param {number} currentType - Текущий тип абонемента
 * @param {string|null} currentSelected - Текущее выбранное значение
 * @param {Array} newOptions - Новые опции абонементов
 * @returns {string|null} Новое выбранное значение
 */
export function handleAbonementOptionsChange(
  currentType,
  currentSelected,
  newOptions,
) {
  if (currentType === 1 && !currentSelected) {
    return newOptions?.[0]?.value ?? null;
  }
  return currentSelected;
}

/**
 * Обрабатывает изменение семейных абонементов
 * @param {Array} familyAbonements - Абонементы семьи
 * @returns {Object} Объект с обновленными значениями
 */
export function handleFamilyAbonementsChange(familyAbonements) {
  if (familyAbonements?.length > 0) {
    const normalized = normalizeAbonements(familyAbonements);
    return {
      abonements: normalized,
      type: 1,
      selectedAbonement: normalized[0]?.abonement_id ?? null,
    };
  }

  return {
    abonements: [],
    type: 0,
    selectedAbonement: null,
  };
}

/**
 * Получает текущий временный абонемент
 * @param {number} abonementType - Тип абонемента
 * @param {Object} tempAbonement - Временный абонемент
 * @returns {Object|null} Текущий временный абонемент или null
 */
export function getCurrentTempAbonement(abonementType, tempAbonement) {
  if (abonementType === 0) {
    return { ...tempAbonement };
  }
  return null;
}

// Функция getEventsForDay была перенесена в services/modules/abonementsTable.js
