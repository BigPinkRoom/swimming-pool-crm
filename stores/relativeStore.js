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
   * @returns {number|string} - ID нового родственника.
   */
  const addEmpty = () => {
    const newId = createNewRelativeId(relatives);
    relatives.push(createNewRelative(newId));
    currentRelativeId.value = newId;
    return newId;
  };

  /**
   * Обновляет данные активного родственника.
   * @param {number|string} id - ID родственника для обновления.
   * @param {Object} currentTempRelative - Временный объект с новыми данными.
   */

  const updateActiveRelative = (id, currentTempRelative) => {
    console.log("Главный стор родственников", relatives);
    const activeRelative = findRelativeById(relatives, id);

    if (activeRelative) {
      activeRelative.name = currentTempRelative.value.name;
      activeRelative.surname = currentTempRelative.value.surname;
      activeRelative.patronymic = currentTempRelative.value.patronymic;
      activeRelative.relativeTypeId = Number(
        currentTempRelative.value.relativeTypeId
      );
      activeRelative.telephone = currentTempRelative.value.telephone;
      activeRelative.isNew = true;
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

  function setRelativeOfEdit(payload) {
    relatives.push(payload);
  }

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
    reset,
  };
});
