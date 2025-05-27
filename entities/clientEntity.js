/**
 * @file Модуль определяет сущность клиента и связанные с ней утилиты.
 * Включает класс ClientEntity для управления данными клиента и функцию для получения опций выбора пола.
 */
import {
  userSignInValidationSchema,
  userSignUpValidationSchema,
} from "@/schemas/zod/userSchemas";

/**
 * @class ClientEntity
 * @classdesc Представляет сущность клиента в приложении.
 * Предоставляет методы для создания и валидации данных клиента.
 */
export default class ClientEntity {
  /**
   * @type {Object | null}
   * @private
   * @description Контекст приложения (например, Nuxt контекст), который может использоваться для доступа к глобальным объектам или сервисам.
   */
  context;

  /**
   * Создает экземпляр класса ClientEntity.
   * @param {Object} [options={}] - Параметры инициализации.
   * @param {Object} [options.context=null] - Контекст приложения.
   */
  constructor({ context } = {}) {
    this.context = context || null;
  }

  /**
   * Создает новый объект клиента с полями по умолчанию.
   * Этот метод используется для инициализации формы нового клиента.
   *
   * @returns {Object} Объект нового клиента.
   * @property {string} name - Имя клиента (пустая строка).
   * @property {string} surname - Фамилия клиента (пустая строка).
   * @property {string} patronymic - Отчество клиента (пустая строка).
   * @property {string} birthday - Дата рождения клиента (пустая строка).
   * @property {number} gender - Пол клиента (0 - Мальчик, по умолчанию).
   */
  createNewClient = () => ({
    name: "",
    surname: "",
    patronymic: "",
    birthday: "",
    gender: 0,
  });

  /**
   * Проверяет, являются ли все ключевые поля объекта клиента пустыми.
   * Ключевые поля для проверки: name, surname, patronymic, birthday.
   * Этот метод может использоваться для определения, нужно ли сбрасывать форму или предупреждать пользователя
   * о несохраненных изменениях.
   *
   * @param {Object} currentTempClient - Объект данных клиента для проверки.
   * @param {string} currentTempClient.name - Имя клиента.
   * @param {string} currentTempClient.surname - Фамилия клиента.
   * @param {string} currentTempClient.patronymic - Отчество клиента.
   * @param {string} currentTempClient.birthday - Дата рождения клиента.
   * @returns {boolean} Возвращает `true`, если все указанные поля (name, surname, patronymic, birthday) являются пустыми строками, иначе `false`.
   */
  checkValuesForValidateReset = (currentTempClient) => {
    const fieldsCheck = [
      Boolean(currentTempClient.name),
      Boolean(currentTempClient.surname),
      Boolean(currentTempClient.patronymic),
      Boolean(currentTempClient.birthday),
    ].every((field) => field === false);

    return fieldsCheck;
  };
}

/**
 * Предоставляет массив опций для выбора пола клиента.
 * Каждая опция представляет собой объект с `id`, `value` и `label`.
 * Используется для генерации элементов управления, таких как радио-кнопки или выпадающие списки.
 *
 * @export
 * @function getClientGenderOptions
 * @returns {Array<{id: number, value: number, label: string}>} Массив объектов, представляющих опции для выбора пола.
 *   Каждый объект содержит:
 *   - `id` {number}: Уникальный идентификатор для использования в качестве ключа (например, в Vue v-for).
 *   - `value` {number}: Значение, которое будет присвоено модели при выборе опции (0 для "Мальчик", 1 для "Девочка").
 *   - `label` {string}: Текст метки, отображаемый пользователю ("Мальчик" или "Девочка").
 */
export function getClientGenderOptions() {
  return [
    { id: 0, value: 0, label: "Мальчик" },
    { id: 1, value: 1, label: "Девочка" },
  ];
}
