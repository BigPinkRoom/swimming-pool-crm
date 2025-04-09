import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import Relatives from "@/services/modules/relatives";

export const useRelativesStore = defineStore("relatives", () => {
  const { $services } = useNuxtApp();
  const relativesService = new Relatives({ context: $services });

  const {
    createNewRelativeId,
    createNewRelative,
    findRelativeIndexById,
    findRelativeById,
    removeRelativeByIndex,
    reassignRelativeIds,
    updateActiveRelativeAfterDeletion,
  } = relativesService;

  const relatives = reactive([]);
  const relativesTypes = ref([]);

  const setRelativesTypes = (payload) => {
    relativesTypes.value = payload;
  };

  const currentRelativeId = ref(null);

  const addEmpty = () => {
    const newId = createNewRelativeId(relatives);
    relatives.push(createNewRelative(newId));
    currentRelativeId.value = newId;

    return newId;
  };

  const updateActiveRelative = (id, currentTempRelative) => {
    const activeRelative = findRelativeById(relatives, id);

    console.log("active relative", activeRelative, relatives, id);

    activeRelative.name = currentTempRelative.value.name;
    activeRelative.surname = currentTempRelative.value.surname;
    activeRelative.patronymic = currentTempRelative.value.patronymic;
    activeRelative.type = currentTempRelative.value.type;
    activeRelative.telephone = currentTempRelative.value.telephone;
  };

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

  return {
    relatives,
    relativesTypes,
    currentRelativeId,
    updateActiveRelative,
    addEmpty,
    deleteRelative,
    setRelativesTypes,
  };
});
