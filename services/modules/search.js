/**
 * @class Search
 * @classdesc Сервис для выполнения поиска семей и подготовки данных для отображения результатов поиска.
 */
export default class Search {
  /**
   * Создает экземпляр сервиса Search.
   * @param {object} dependencies - Зависимости сервиса.
   * @param {object} dependencies.$services - Объект с другими сервисами приложения (например, families, clients, relatives).
   * @param {object} dependencies.relativesStore - Хранилище (Pinia store) данных о родственниках, используется для получения типов родственников.
   */
  constructor(dependencies) {
    this.$services = dependencies.$services;
    this.relativesStore = dependencies.relativesStore;

    /**
     * @private
     * @type {Array<object>}
     * @description Статический массив данных о поле, используемый для получения метки пола.
     */
    this.genderData = [
      { id: 0, value: 0, label: "Сын" },
      { id: 1, value: 1, label: "Дочка" },
    ];
  }

  /**
   * Асинхронно выполняет поиск семей по заданной строке.
   * @param {string} searchString - Строка для поиска семей.
   * @returns {Promise<Array<object>>} Промис, который разрешается массивом найденных семей (или пустым массивом, если ничего не найдено).
   */
  async searchFamilies(searchString) {
    const results = await this.$services.families.search({ searchString });
    return results || [];
  }

  /**
   * Получает текстовую метку для типа родственника по его ID.
   * @param {number|string} relativeTypeId - ID типа родственника.
   * @returns {string} Текстовая метка типа родственника или пустая строка, если тип не найден или хранилище недоступно.
   */
  getRelativeTypeLabel(relativeTypeId) {
    if (!this.relativesStore || !this.relativesStore.relativesTypes) {
      console.warn("Relatives store or types not available in Search service");
      return "";
    }
    const relativeType = this.relativesStore.relativesTypes.find(
      (item) => Number(item.value) === Number(relativeTypeId),
    );
    return relativeType?.text || "";
  }

  /**
   * Получает текстовую метку для пола по его ID.
   * @param {number|string} genderId - ID пола (0 для мужского, 1 для женского).
   * @returns {string} Текстовая метка пола ("Сын", "Дочка") или пустая строка, если ID не найден.
   */
  getGenderLabel(genderId) {
    const foundGender = this.genderData.find(
      (item) => Number(item.value) === Number(genderId),
    );
    return foundGender?.label || "";
  }

  /**
   * Асинхронно загружает и подготавливает детальную информацию о выбранной семье.
   * @param {object} familyStub - "Заглушка" семьи, полученная из результатов поиска. Содержит ID и, возможно, списки ID клиентов/родственников.
   * @param {string} familyStub._id - ID семьи.
   * @param {Array<object>} [familyStub.clients] - Массив объектов с `client_id`.
   * @param {Array<object>} [familyStub.relatives] - Массив объектов с `relative_id`.
   * @param {Array<object>} [familyStub.abonements] - Массив абонементов семьи.
   * @returns {Promise<object>} Промис, который разрешается объектом с детальной информацией о семье:
   * { id: string, clients: Array<object>, relatives: Array<object>, abonements: Array<object> }.
   * Каждый клиент содержит: id, name, surname, patronymic, birthday, gender.
   * Каждый родственник содержит: id, name, surname, patronymic, relativeTypeId, telephone.
   */
  async fetchAndPrepareFamilyDetails(familyStub) {
    const selectedFamilyData = {
      id: familyStub._id,
      clients: [],
      relatives: [],
      abonements: familyStub.abonements ? [...familyStub.abonements] : [],
    };

    if (familyStub.clients) {
      for (const item of familyStub.clients) {
        const clientDataArray = await this.$services.clients.getClientById(
          item.client_id,
        );
        if (clientDataArray && clientDataArray.length > 0) {
          const clientData = clientDataArray[0];
          selectedFamilyData.clients.push({
            id: clientData.client_id,
            name: clientData.name,
            surname: clientData.surname,
            patronymic: clientData.patronymic,
            birthday: clientData.birthday,
            gender: clientData.gender,
          });
        }
      }
    }

    if (familyStub.relatives) {
      for (const item of familyStub.relatives) {
        const relativeDataArray =
          await this.$services.relatives.getRelativeById(item.relative_id);
        if (relativeDataArray && relativeDataArray.length > 0) {
          const relativeData = relativeDataArray[0];
          selectedFamilyData.relatives.push({
            id: relativeData.relative_id,
            name: relativeData.name,
            surname: relativeData.surname,
            patronymic: relativeData.patronymic,
            relativeTypeId: relativeData.relative_type_id,
            telephone: relativeData.telephone,
          });
        }
      }
    }
    return selectedFamilyData;
  }
}
