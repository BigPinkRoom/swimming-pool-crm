import RelativeEntity from "@/entities/relativeEntity";

export default class Relatives {
  constructor(context) {
    this.context = context;

    this.relativesEntity = new RelativeEntity({ context });
  }

  _addRelativeTypesToSelect(typesList) {
    return typesList?.map((item) => {
      const processedItem = {
        ...item,
        text: this.relativesEntity.setRelativeTypeName(item.name),
        value: this.relativesEntity.setRelativeTypeId(item.relative_type_id),
      };
      return processedItem;
    });
  }

  _addRelatvieTypesTranslate(typesList) {
    return typesList?.map((item) => {
      const processedItem = {
        ...item,
        text: this.relativesEntity.setRelativeTypeTranslate(item.text),
      };
      return processedItem;
    });
  }

  async getTypes({ sortings = [], filters = {}, context = null } = {}) {
    const { $api, $showError, $t } = useNuxtApp();

    try {
      const params = {};

      if (!sortings.length) {
        params.sortings = [{ name: "relative_type_id", type: "ASC" }];
      }

      const response = (await $api.relatives.getTypes(params)) || null;

      const processedResponse = this._addRelativeTypesToSelect(response);
      const translatedResponse =
        this._addRelatvieTypesTranslate(processedResponse);

      console.log("translated response", translatedResponse);

      return translatedResponse;
    } catch (error) {
      console.log("error of errors", error);
      $showError(error);
    }
  }

  getRelativesSections = (relatives, activeId) => {
    const activeIndex = relatives.findIndex(
      (relative) => relative.id === activeId
    );
    return {
      before: relatives.slice(0, activeIndex),
      active: activeIndex !== -1 ? relatives[activeIndex] : null,
      after: relatives.slice(activeIndex + 1),
    };
  };

  isMaxRelativesLimitReached = (relatives, maxLimit = 10) => {
    return relatives.length >= maxLimit;
  };

  createNewRelativeId = (relatives) => {
    return relatives.length === 0
      ? 1
      : Math.max(...relatives.map((relative) => relative.id)) + 1;
  };

  createNewRelative = (id) => {
    return this.relativesEntity.createNewRelative(id);
  };

  reassignRelativeIds = (relatives) => {
    relatives.forEach((relative, idx) => {
      relative.id = idx + 1;
    });
  };

  removeRelativeByIndex = (relatives, index) => {
    relatives.splice(index, 1);
  };

  findRelativeIndexById = (relatives, id) => {
    return relatives.findIndex((relative) => relative.id === id);
  };

  findRelativeId = (relatives, id) => {
    return relatives.find((relative) => relative.id === id);
  };

  updateActiveRelativeAfterDeletion = ({
    relatives,
    currentRelativeId,
    deletedRelativeId,
    index,
  }) => {
    if (currentRelativeId.value === deletedRelativeId) {
      if (relatives.length > 0) {
        currentRelativeId.value =
          relatives[index]?.id || relatives[index - 1]?.id;
      } else {
        currentRelativeId.value = null;
      }
    }
  };

  findRelativeById = (relatives, id) => {
    return relatives.find((relatives) => relatives.id === id);
  };
}
