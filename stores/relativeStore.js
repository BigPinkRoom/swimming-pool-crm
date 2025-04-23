import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import Relatives from "@/services/modules/relatives";

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

  // Состояние: список родственников и типы родственников
  const relatives = reactive([]);
  const relativesTypes = ref([]);

  // Текущий активный ID родственника
  const currentRelativeId = ref(null);

  /**
   * Устанавливает типы родственников.
   * @param {Array} payload - Массив типов родственников.
   */
  const setRelativesTypes = (payload) => {
    relativesTypes.value = payload;
  };

  /**
   * Добавляет нового пустого родственника в список.
   * @returns {number} Временный индекс для идентификации родственника в UI
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
   * @param {number|string} idOrIndex - ID или индекс родственника для обновления.
   * @param {Object} currentTempRelative - Временный объект с новыми данными.
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
   * Удаляет родственника по ID.
   * @param {number|string} id - ID родственника для удаления.
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
   * Форматирует родственников для отправки на сервер.
   * @returns {Array} Массив родственников, готовый для отправки на сервер.
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
   * Сбрасывает состояние хранилища.
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
