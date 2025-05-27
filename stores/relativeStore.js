import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import Relatives from "@/services/modules/relatives";

/**
 * @module stores/relativeStore
 * @description Хранилище для управления данными о родственниках.
 */
export const useRelativesStore = defineStore("relatives", () => {
  // Инициализация сервиса родственников
  const { $services } = useNuxtApp();
  const relativesService = new Relatives({ context: $services });

  // Деструктуризация методов из сервиса
  const {
    createNewRelativeId,
    createNewRelative,
    findRelativeIndexById,
    findRelativeById,
    removeRelativeByIndex,
    reassignRelativeIds,
    updateActiveRelativeAfterDeletion,
  } = relativesService;

  /**
   * Реактивный массив объектов родственников.
   * @type {Array<Object>}
   */
  const relatives = reactive([]);
  /**
   * Реактивный массив типов родственных связей.
   * @type {import("vue").Ref<Array<Object>>}
   */
  const relativesTypes = ref([]);

  /**
   * Реактивное значение ID текущего активного родственника.
   * Может быть числом или строкой (для временных ID).
   * @type {import("vue").Ref<number|string|null>}
   */
  const currentRelativeId = ref(null);

  /**
   * Устанавливает типы родственников.
   * @param {Array<Object>} payload - Массив типов родственников.
   */
  const setRelativesTypes = (payload) => {
    relativesTypes.value = payload;
  };

  /**
   * Добавляет нового пустого родственника в список и устанавливает его как активного.
   * В качестве временного ID используется индекс в массиве (начиная с 1).
   * @returns {number} Временный индекс для идентификации родственника в UI.
   */
  const addEmpty = () => {
    // Создаем нового родственника без ID
    const newRelative = createNewRelative();

    // Добавляем родственника в список
    relatives.push(newRelative);

    // Используем индекс массива как временный идентификатор для UI
    const tempIndex = relatives.length;
    currentRelativeId.value = tempIndex;

    return tempIndex;
  };

  /**
   * Обновляет данные активного родственника.
   * @param {number|string} idOrIndex - ID или временный индекс родственника для обновления.
   * @param {Object|import("vue").Ref<Object>} currentTempRelative - Временный объект или ref с новыми данными родственника.
   */
  const updateActiveRelative = (idOrIndex, currentTempRelative) => {
    console.log("Главный стор родственников", relatives);
    const activeRelative = findRelativeById(relatives, idOrIndex);

    if (activeRelative) {
      // Проверяем есть ли value для совместимости со старым кодом
      const relativeData = currentTempRelative.value
        ? currentTempRelative.value
        : currentTempRelative;

      // Обновляем данные активного родственника
      activeRelative.name = relativeData.name || "";
      activeRelative.surname = relativeData.surname || "";
      activeRelative.patronymic = relativeData.patronymic || "";
      activeRelative.relativeTypeId = Number(relativeData.relativeTypeId || 1);
      activeRelative.telephone = relativeData.telephone || "";

      // Сохраняем ID, если он есть
      if (relativeData.id) {
        activeRelative.id = relativeData.id;
      }

      console.log("Родственник успешно обновлен:", activeRelative);
    } else {
      console.warn("Не удалось найти активного родственника для обновления", {
        idOrIndex,
        relatives,
        currentRelativeId: currentRelativeId.value,
        currentTempRelative,
      });
    }
  };

  /**
   * Удаляет родственника по ID (или временному ID).
   * После удаления переназначает ID и обновляет активного родственника.
   * @param {number|string} id - ID или временный ID родственника для удаления.
   */
  const deleteRelative = (id) => {
    const index = findRelativeIndexById(relatives, id);
    if (index === -1) return;

    removeRelativeByIndex(relatives, index);
    reassignRelativeIds(relatives);

    updateActiveRelativeAfterDeletion({
      relatives,
      currentRelativeId,
      deletedRelativeId: id,
      index,
    });
  };

  /**
   * Устанавливает данные родственника при редактировании.
   * Добавляет родственника в список, если он содержит данные и ID (или relativeId).
   * @param {Object} payload - Данные родственника.
   */
  function setRelativeOfEdit(payload) {
    // Проверяем, не пустой ли payload
    if (!payload) return;

    // Проверяем, что есть хотя бы одно заполненное поле
    const hasData =
      payload.name ||
      payload.surname ||
      payload.patronymic ||
      payload.telephone;
    if (!hasData) return;

    // Если у родственника есть ID из БД, сохраняем его
    if (payload.id) {
      relatives.push(payload);
    } else if (payload.relativeId) {
      // Если вместо id используется relativeId
      relatives.push({
        ...payload,
        id: payload.relativeId,
      });
    } else {
      // Для новых родственников без ID
      relatives.push(payload);
    }
  }

  /**
   * Форматирует список родственников для отправки на сервер.
   * Приводит поля к формату, ожидаемому бэкендом (например, `name` -> `relativeName`).
   * Добавляет `relativeId` только если `id` существует и не является временным.
   * @returns {Array<Object>} Массив родственников, готовый для отправки на сервер.
   */
  const getFormattedRelativesForBackend = () => {
    return relatives.map((relative) => {
      const formattedRelative = {
        relativeName: relative.name,
        relativeSurname: relative.surname,
        relativePatronymic: relative.patronymic,
        relativeTypeId: relative.relativeTypeId,
        relativeTelephone: relative.telephone,
      };

      // Добавляем ID только если он существует и это не временный ID
      if (relative.id && !relative.id.toString().startsWith("temp_")) {
        formattedRelative.relativeId = relative.id;
      }

      return formattedRelative;
    });
  };

  /**
   * Сбрасывает состояние хранилища: очищает список родственников и ID текущего активного родственника.
   */
  const reset = () => {
    relatives.splice(0, relatives.length);
    currentRelativeId.value = null;
  };

  return {
    relatives,
    relativesTypes,
    currentRelativeId,
    updateActiveRelative,
    addEmpty,
    deleteRelative,
    setRelativesTypes,
    setRelativeOfEdit,
    getFormattedRelativesForBackend,
    reset,
  };
});
