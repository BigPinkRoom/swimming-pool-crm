import { transformKeysToSnakeCase } from "~/helpers/CamelToSnakeCase";
import { transformKeysToCamelCase } from "~/helpers/snakeToCamelCase";
import { removeSpaces } from "~/helpers/removeSpaces";

/**
 * @typedef {object} Client
 * @property {string} name - Имя клиента.
 * @property {string} surname - Фамилия клиента.
 * // ... другие свойства клиента
 */

/**
 * @typedef {object} Relative
 * @property {string} phone - Телефон родственника.
 * // ... другие свойства родственника
 */

/**
 * @typedef {object} Abonement
 * // ... свойства абонемента
 */

/**
 * Класс для управления сущностями абонементов.
 */
export default class AbonementEntity {
  /**
   * Создает экземпляр AbonementEntity.
   * @param {object} [options={}] - Опции для конструктора.
   * @param {object} [options.context] - Контекст приложения (например, экземпляр Nuxt).
   */
  constructor({ context } = {}) {
    this.context = context;
  }

  /**
   * Создает объект запроса для семейной модели с преобразованием ключей в snake_case.
   * @param {object} params - Параметры для создания запроса.
   * @param {Client[]} params.clients - Массив объектов клиентов.
   * @param {Relative[]} params.relatives - Массив объектов родственников.
   * @param {Abonement[]} params.abonements - Массив объектов абонементов.
   * @returns {object} Объект запроса с ключами в snake_case.
   */
  createFamilyModelRequest({ clients, relatives, abonements }) {
    // const telephonesWithoutSpaces = removeSpaces(relatives); // Эта переменная не используется

    return {
      clients: transformKeysToSnakeCase(clients),
      relatives: transformKeysToSnakeCase(relatives), // Обратите внимание: removeSpaces не применяется здесь
      abonements: transformKeysToSnakeCase(abonements),
    };
  }

  /**
   * Создает объект FormData для добавления семьи.
   * @param {object} params - Параметры для создания FormData.
   * @param {Client[]} params.clients - Массив объектов клиентов.
   * @param {Relative[]} params.relatives - Массив объектов родственников.
   * @param {Abonement[]} [params.abonements] - Необязательный массив объектов абонементов.
   * @returns {FormData} Объект FormData.
   */
  createAddFamilyFormData({ clients, relatives, abonements }) {
    const formData = new FormData();

    formData.append("clients", JSON.stringify(clients));
    formData.append("relatives", JSON.stringify(relatives));
    if (abonements) {
      formData.append("abonements", JSON.stringify(abonements));
    }

    return formData;
  }

  /**
   * Создает объект ответа для семейной модели с преобразованием ключей в camelCase.
   * @param {object} rawFullAbonement - "Сырой" объект полного абонемента с ключами в snake_case.
   * @returns {object} Обработанный объект полного абонемента с ключами в camelCase.
   */
  createFamilyModelResponse(rawFullAbonement) {
    const processedFullAbonement = transformKeysToCamelCase(rawFullAbonement);

    return processedFullAbonement;
  }
}

/**
 * Объект с фильтрами для абонементов.
 * @property {string} abonementId - ID абонемента.
 * @property {string} dateStart - Дата начала.
 * @property {string} dateEnd - Дата окончания.
 * @property {string} visitsQuantity - Количество посещений.
 * @property {string} visitsLeft - Оставшееся количество посещений.
 * @property {string} statusId - ID статуса.
 * @property {string} surname - Фамилия.
 */
export const abonementFilters = {
  abonementId: "",
  dateStart: "",
  dateEnd: "",
  visitsQuantity: "",
  visitsLeft: "",
  statusId: "",
  surname: "",
};
