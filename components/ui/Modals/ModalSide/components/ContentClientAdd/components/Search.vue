<script setup>
import CardTable from "@/components/Common/CardTable.vue";
import { searchValidationSchema } from "@/schemas/zod/searchScemas";
import { useRelativesStore } from "@/stores/relativeStore";
import { computed, reactive, ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

const { $i18n } = useNuxtApp();
const t = $i18n.t;
const { $services } = useNuxtApp();

const relativesStore = useRelativesStore();

const emit = defineEmits(["family-selected"]);

const validationSchema = toTypedSchema(searchValidationSchema(t));

const { errors, values, meta, validate, resetForm } = useForm({
  validationSchema,
  initialValues: {
    search: "",
  },
});

const search = ref("");
const searchResult = ref([]);
const isListCollapsing = ref(true);

const getSearch = async (searchString) => {
  const resultSearch = await $services.families.search({ searchString });
  return resultSearch;
};

const getRelativeType = (relativeTypeId) => {
  const relativesType = relativesStore.relativesTypes.find((item) => {
    return Number(item.value) === Number(relativeTypeId);
  });
  return relativesType?.text;
};

const getGender = (genderId) => {
  const foundGender = gender.find((item) => {
    return Number(item.value) === Number(genderId);
  });
  return foundGender?.label;
};

const gender = reactive([
  { id: 0, value: 0, label: "Сын" },
  { id: 1, value: 1, label: "Дочка" },
]);

const searchFamily = async () => {
  const resultValidate = await validate();
  if (resultValidate.valid) {
    const newResults = await getSearch(search.value);
    searchResult.value = newResults || [];
    if (searchResult.value.length > 0) {
      isListCollapsing.value = false;
    } else {
      isListCollapsing.value = true;
    }
  } else {
    if (!search.value && searchResult.value.length === 0) {
      isListCollapsing.value = true;
    } else if (searchResult.value.length > 0) {
      isListCollapsing.value = false;
    } else if (search.value && searchResult.value.length === 0) {
      isListCollapsing.value = true;
    }
  }
};

const selectFamilyAndEmit = async (element) => {
  const selectedFamilyData = {
    id: element._id,
    clients: [],
    relatives: [],
    abonements: [],
  };

  if (element.clients) {
    for (const item of element.clients) {
      const clientDataArray = await $services.clients.getClientById(
        item.client_id
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

  if (element.relatives) {
    for (const item of element.relatives) {
      const relativeDataArray = await $services.relatives.getRelativeById(
        item.relative_id
      );
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

  if (element.abonements) {
    selectedFamilyData.abonements = [...element.abonements];
  }

  emit("family-selected", selectedFamilyData);

  isListCollapsing.value = true;
  searchResult.value = [];
  search.value = "";
  resetForm();
};
</script>

<template>
  <fieldset class="client-main__fieldset">
    <card-table class="card-table__wrapper--gray">
      <template #title>
        <legend class="card-table__title card-table__title--gray">
          Поиск добавленной семьи
        </legend>
      </template>
      <template #content>
        <div class="card-table__table-td card-table__table-td--edit">
          <div class="card-table__table-title card-table__table-title--gray">
            <div class="card-table__field">
              <ui-fields-input
                :id="`clientName_${uuidV4}`"
                v-model="search"
                type="text"
                title="Поиск по ФИО и по номеру телефона"
                name="search"
                :success-message="$t('zod.success')"
                :errorSubmit="errors.search"
                @input="searchFamily"
              ></ui-fields-input>
            </div>
          </div>
        </div>
        <transition-group
          tag="div"
          name="search-item-animation"
          class="card-table__table-td card-table__table-td--edit search-results-list"
          :class="{ 'is-collapsing': isListCollapsing }"
        >
          <div
            v-for="item in searchResult"
            :key="item.id"
            class="card-table__table-block"
            @click="selectFamilyAndEmit(item)"
          >
            <div
              v-for="element_relative in item.relatives"
              :key="element_relative.id"
              class="card-table__table-block-title"
            >
              <span class="card-table__table-block--semi-bold"
                >{{ getRelativeType(element_relative.relative_type_id) }}:</span
              >
              {{ element_relative.surname }} {{ element_relative.name }}
              {{ element_relative.patronymic }}
              <br />
              <span class="card-table__table-block--semi-bold"
                >Телефон: {{ element_relative.telephone }}</span
              >
            </div>
            <div
              v-for="element_client in item.clients"
              :key="element_client.id"
              class="card-table__table-block-title"
            >
              <span class="card-table__table-block--semi-bold"
                >{{ getGender(element_client.gender) }}:</span
              >
              {{ element_client.surname }} {{ element_client.name }}
              {{ element_client.patronymic }}
            </div>
          </div>
        </transition-group>
      </template>
      <template #footer>
        <div v-if="closeButton" class="client-main__close">
          <v-close-button @click="close" />
        </div>
      </template>
    </card-table>
  </fieldset>
</template>

<style lang="scss" scoped>
.client-main {
  &__fieldset {
    position: relative;
    border: 0;

    padding-left: 0;
  }

  &__legend {
    width: 100%;
    display: block;
  }

  &__close {
    position: absolute;
    top: -0.5rem;
    right: 0;
  }
}

.card-table {
  &__table-title-td {
    display: flex;
    justify-content: center;
    padding: 0.4rem 0;

    font-size: 1.4rem;
    white-space: nowrap;

    border-left: 0;
  }

  &__table-tr {
    display: flex;
    align-items: center;
    width: 100%;
  }

  &__table-td {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
    min-height: 3.8rem;

    padding: 1.2rem 1.4rem;

    display: flex;

    border: 0;

    &:last-child {
      border-right: 0;
    }

    &--edit {
    }
  }

  &__title {
    font-size: 16px;
    font-weight: 500;

    border-bottom: 0.1rem solid var(--color-main-light);
  }

  &__name-title {
    width: 17.6rem;
    margin-bottom: 1.4rem;

    text-align: left;
    font-size: 14px;
    font-weight: 700;

    &--surname {
      font-size: 12px;
      font-weight: 500;
    }
  }

  &__actions {
    &--edit {
      cursor: pointer;
    }

    &-img {
      margin-right: 10px;
      margin-bottom: 10px;

      cursor: pointer;
    }
  }

  &__field {
    position: relative;

    width: 100%;
  }

  &__label {
    position: absolute;
    top: -0.7rem;
    left: 1rem;

    display: flex;
    padding: 0 0.3rem;

    font-size: 1.2rem;
    text-align: left;

    background-color: var(--color-white);
  }

  &__radio {
    display: flex;
    align-items: center;
  }

  &__delete {
    display: flex;

    cursor: pointer;
    &-img {
      margin-right: 10px;
      margin-bottom: 10px;
    }

    &-text {
      margin-right: 8px;

      color: var(--color-warning);
      font-size: 12px;
    }
  }

  &__tr-add {
    display: flex;
    width: 100%;
  }

  &__add {
    width: 100%;
  }

  &__button {
    &--add {
      font-size: 1.4rem;
      color: var(--color-main-tertiary-light);

      background-color: var(--color-main-tertiary-lightest);
      border: 1px solid var(--color-main-tertiary-lighter);

      :disabled {
      }
    }
  }

  &__table-block {
    width: 100%;
    margin: 0 0 10px 0;
    padding: 1rem;

    font-size: 1.4rem;

    background-color: var(--color-main-tertiary-lightest);
    border-left: 6px solid var(--color-main-tertiary-lighter);
    border-radius: 5px;

    cursor: pointer;
    transition: all 0.6s ease;

    &:hover {
      color: var(--color-main);

      background-color: var(--color-main-lighter);
      border-left: 6px solid var(--color-main-light);
    }

    &:last-child {
      margin-bottom: 0;
    }

    &-title {
      margin: 0 0 10px 0;

      font-size: 1.4rem;

      &:last-child {
        margin-bottom: 0;
      }
    }

    &--semi-bold {
      font-size: 1.4rem;
      font-weight: 500;
    }
  }
}

.search-item-animation-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
  position: relative;
  z-index: 1;
}

.search-item-animation-leave-to {
  opacity: 0;
  transform: translateY(300px);
}

.search-results-list {
  max-height: 80rem;

  transition: max-height 0.5s ease-in-out, min-height 0.5s ease-in-out,
    padding-top 0.5s ease-in-out, padding-bottom 0.5s ease-in-out,
    padding-left 0.5s ease-in-out, padding-right 0.5s ease-in-out;

  &.is-collapsing {
    max-height: 0 !important;
    min-height: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
}
</style>
