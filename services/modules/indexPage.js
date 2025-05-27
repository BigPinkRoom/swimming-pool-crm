import AbonementEntity from "@/entities/abonementEntity";

/**
 * Сервис для управления данными, связанными со страницей (например, создание/редактирование семей).
 * @class indexPage
 */
export default class indexPage {
  /**
   * Приватная функция для создания объекта FormData для добавления/обновления семьи.
   * @type {Function}
   * @private
   */
  #createAddFamilyFormDataFn = null;
  // this.context будет хранить $services и $i18n (для t)

  /**
   * Создает экземпляр indexPage.
   * @param {object} context - Контекст приложения, содержащий сервисы и функцию интернационализации.
   * @param {object} context.$services - Объект сервисов приложения.
   * @param {object} context.$i18n - Объект интернационализации.
   * @param {Function} context.$i18n.t - Функция для перевода строк.
   * @throws {Error} Если контекст не содержит $services или $i18n.t.
   */
  constructor(context) {
    this.context = context; // Сохраняем существующую логику конструктора

    if (
      !this.context ||
      !this.context.$services ||
      !this.context.$i18n ||
      typeof this.context.$i18n.t !== "function"
    ) {
      console.error(
        "indexPage service: Контекст должен содержать $services и $i18n.t",
      );
      // В идеале здесь должна быть более строгая обработка ошибки,
      // возможно, выброс исключения, если эти зависимости критичны.
      // throw new Error("indexPage service requires context with $services and $i18n.t");
    }

    const abonementEntityInstance = new AbonementEntity();
    this.#createAddFamilyFormDataFn =
      abonementEntityInstance.createAddFamilyFormData;
  }

  /**
   * Обновляет данные семьи на сервере.
   * @async
   * @private
   * @function #updateFamilyOnServer
   * @param {object} familyData - Данные семьи для обновления.
   * @returns {Promise<object>} Промис, который разрешается с ответом сервера.
   * @throws {Error} Если сервисы не доступны.
   */
  async #updateFamilyOnServer(familyData) {
    if (!this.context || !this.context.$services) {
      throw new Error("Сервисы не доступны в indexPage service.");
    }
    const formData = this.#createAddFamilyFormDataFn(familyData);
    return await this.context.$services.abonements.updateFamily(formData);
  }

  /**
   * Добавляет данные новой семьи на сервер.
   * @async
   * @private
   * @function #addFamilyToServer
   * @param {object} familyData - Данные семьи для добавления.
   * @returns {Promise<object>} Промис, который разрешается с ответом сервера.
   * @throws {Error} Если сервисы не доступны.
   */
  async #addFamilyToServer(familyData) {
    if (!this.context || !this.context.$services) {
      throw new Error("Сервисы не доступны в indexPage service.");
    }
    const formData = this.#createAddFamilyFormDataFn(familyData);
    return await this.context.$services.abonements.addFamily(formData);
  }

  /**
   * Обрабатывает данные семьи, подготавливает их и отправляет на сервер для добавления или обновления.
   * @async
   * @param {object} params - Параметры для обработки данных семьи.
   * @param {object} params.clientsStore - Хранилище клиентов.
   * @param {Array<object>} params.clientsStore.clients - Массив клиентов.
   * @param {object} params.relativesStore - Хранилище родственников.
   * @param {Array<object>} params.relativesStore.relatives - Массив родственников.
   * @param {object} params.abonementsStore - Хранилище абонементов.
   * @param {Array<object>} params.abonementsStore.abonements - Массив абонементов.
   * @param {object} params.contentClientAddRef - Ссылка на DOM-элемент компонента добавления клиента (Vue ref).
   * @param {object} params.actionType - Тип действия (например, 'edit' или 'add') и связанные данные.
   * @param {string} params.actionType.type - Тип действия ('edit' или 'add').
   * @param {object} [params.actionType.family] - Существующие данные семьи (для редактирования).
   * @returns {Promise<object>} Промис, который разрешается с объектом, содержащим результат операции.
   * @property {boolean} success - Флаг успешности операции.
   * @property {string} message - Сообщение о результате операции.
   * @property {object} [responseData] - Данные ответа сервера (например, при добавлении новой семьи).
   * @throws {Error} Если функция перевода t не доступна или произошла ошибка при обработке.
   */
  processFamilyData({
    clientsStore,
    relativesStore,
    abonementsStore,
    contentClientAddRef, // Это .value из компонента
    actionType, // Это .value из компонента
  }) {
    if (
      !this.context ||
      !this.context.$i18n ||
      typeof this.context.$i18n.t !== "function"
    ) {
      throw new Error("Функция перевода t не доступна в indexPage service.");
    }
    const t = this.context.$i18n.t;

    return new Promise(async (resolve, reject) => {
      try {
        const clientsForRequest = clientsStore.clients
          .filter((client) => client.name && client.name.trim() !== "")
          .map((client) => ({
            name: client.name,
            surname: client.surname,
            patronymic: client.patronymic,
            birthday: client.birthday,
            gender: client.gender,
            ...(client.id && { id: client.id }),
          }));

        const relativesForRequest = relativesStore.relatives
          .filter((relative) => relative.name && relative.name.trim() !== "")
          .map((relative) => ({
            name: relative.name,
            surname: relative.surname,
            patronymic: relative.patronymic,
            relative_type_id: relative.relativeTypeId,
            telephone: relative.telephone,
            ...(relative.id && { id: relative.id }),
          }));

        const abonementsForRequest = abonementsStore.abonements
          .filter((a) => a && a.abonement_id)
          .map((a) => ({
            abonement_id: a.abonement_id,
            visits_quantity: a.visits_quantity,
            visits_left: a.visits_left,
            date_create: a.date_create,
            date_start: a.date_start,
            date_end: a.date_end,
            user_created_id: a.user_created_id,
            status_id: a.status_id,
            branch_id: a.branch_id,
          }));

        const familyRequestData = {
          clients: clientsForRequest,
          relatives: relativesForRequest,
          abonements: abonementsForRequest,
        };

        const fieldsetAbonements =
          contentClientAddRef?.$refs?.fieldsetAbonements;
        let tempAbonement = null;
        if (
          fieldsetAbonements &&
          typeof fieldsetAbonements.getCurrentTempAbonement === "function"
        ) {
          tempAbonement = fieldsetAbonements.getCurrentTempAbonement();
        }

        if (
          tempAbonement &&
          tempAbonement.quantity &&
          tempAbonement.duration &&
          tempAbonement.activationDate
        ) {
          familyRequestData.abonements.push({
            quantity: tempAbonement.quantity,
            duration: tempAbonement.duration,
            activation_date: tempAbonement.activationDate,
          });
        }

        const familyExists =
          actionType.type === "edit" ||
          actionType.family?.clients?.some((client) => client.id) ||
          actionType.family?.relatives?.some((relative) => relative.id);

        let response;
        if (familyExists) {
          response = await this.#updateFamilyOnServer(familyRequestData);
          resolve({
            success: response.updated,
            message: t(`forms.client.notifications.${response.code}`),
          });
        } else {
          response = await this.#addFamilyToServer(familyRequestData);
          resolve({
            success: true,
            message: t("forms.client.notifications.familyAdded"),
            responseData: response,
          });
        }
      } catch (error) {
        console.error("Error processing family data in service:", error);
        let errorMessage = t("errors.genericSaveError");
        if (error.data?.error?.message && error.data?.error?.code) {
          errorMessage = t(`abonementsErrors.${error.data.error.code}`);
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        reject(errorMessage);
      }
    });
  }
}
