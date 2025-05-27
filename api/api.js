/**
 * @module api/api
 * @description Этот модуль предоставляет главный класс `Api`, который агрегирует все доступные модули API.
 * Он служит единой точкой входа для взаимодействия с различными частями API.
 */

import Menus from "./modules/menus";
import Branches from "./modules/branches";
import User from "./modules/user.js";
import Abonements from "./modules/abonements";
import Relatives from "./modules/relatives";
import Families from "./modules/families";
import Clients from "./modules/clients";

/**
 * @class Api
 * @classdesc Главный класс API, агрегирующий все модули API.
 * Предоставляет доступ к различным модулям через свои свойства.
 *
 * @property {Menus} menus - Экземпляр модуля `Menus` для работы с API меню.
 * @property {Branches} branches - Экземпляр модуля `Branches` для работы с API филиалов.
 * @property {User} user - Экземпляр модуля `User` для работы с API пользователей и аутентификации.
 * @property {Abonements} abonements - Экземпляр модуля `Abonements` для работы с API абонементов.
 * @property {Relatives} relatives - Экземпляр модуля `Relatives` для работы с API родственников.
 * @property {Families} families - Экземпляр модуля `Families` для работы с API семей.
 * @property {Clients} clients - Экземпляр модуля `Clients` для работы с API клиентов.
 */
export default class Api {
  /**
   * @constructor
   * @param {object} app - Контекст приложения или API, передаваемый в конструкторы модулей.
   * @description Создает экземпляр класса Api и инициализирует все доступные модули API,
   * передавая им контекст `app`.
   */
  constructor(app) {
    this.menus = new Menus(app);
    this.branches = new Branches(app);
    this.user = new User(app);
    this.abonements = new Abonements(app);
    this.relatives = new Relatives(app);
    this.families = new Families(app);
    this.clients = new Clients(app);
  }
}
