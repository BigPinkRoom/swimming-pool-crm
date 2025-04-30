<script setup>
import CardTable from "@/components/Common/CardTable.vue";
import { searchValidationSchema } from "@/schemas/zod/searchScemas";

const { $i18n } = useNuxtApp();
const t = $i18n.t;
const { $services } = useNuxtApp();

const relativesStore = useRelativesStore();

const validationSchema = toTypedSchema(searchValidationSchema(t));

const { errors, values, meta, validate, resetForm } = useForm({
  validationSchema,
  initialValues: {
    search: "",
  },
});

const search = ref("");
const searchResult = ref([]);

const getSearch = async (searchString) => {
  const resultSearch = await $services.families.search({ searchString });
  return resultSearch;
};

const getRelativeType = (relativeTypeId) => {
  const relativesType = relativesStore.relativesTypes.find((item) => {
    return Number(item.value) === Number(relativeTypeId);
  });
  return relativesType.text;
};

const getGender = (genderId) => {
  const foundGender = gender.find((item) => {
    return Number(item.value) === Number(genderId);
  });
  return foundGender.label;
};

const gender = reactive([
  { id: 0, value: 0, label: "Сын" },
  { id: 1, value: 1, label: "Дочка" },
]);

const searchFamily = async () => {
  const resultValidate = await validate();
  if (resultValidate.valid) {
    searchResult.value = await getSearch(search.value);
  } else {
    return "";
  }
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
                type="text"
                title="Поиск по ФИО и по номеру телефона"
                name="search"
                :success-message="$t('zod.success')"
                :errorSubmit="errors.search"
                v-model="search"
                @input="searchFamily"
              ></ui-fields-input>
            </div>
          </div>
        </div>
        <div class="card-table__table-td card-table__table-td--edit">
          <div
            class="card-table__table-block"
            v-for="item in searchResult"
            :key="item.id"
          >
            <div
              class="card-table__table-block-title"
              v-for="element in item.relatives"
              :key="element.id"
            >
              <span class="card-table__table-block--semi-bold"
                >{{ getRelativeType(element.relative_type_id) }}:</span
              >
              {{ element.name }} {{ element.surname }} {{ element.patronymic }}
              <br />
              <span class="card-table__table-block--semi-bold"
                >Телефон: {{ element.telephone }}</span
              >
            </div>
            <div
              class="card-table__table-block-title"
              v-for="element in item.clients"
              :key="element.id"
            >
              <span class="card-table__table-block--semi-bold"
                >{{ getGender(element.gender) }}:</span
              >
              {{ element.name }} {{ element.surname }} {{ element.patronymic }}
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="client-main__close" v-if="closeButton">
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

    border-top: 0;
    border-left: 0;
    border-bottom: 0;

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

    border: 1px solid var(--color-main-tertiary-lighter);
    border-left: 6px solid var(--color-main-tertiary-lighter);
    border-radius: 5px;

    cursor: pointer;
    transition: all 0.6s ease;

    &:hover {
      background-color: var(--color-main-tertiary-lightest);
      border-left: 6px solid var(--color-main-tertiary-light-2);
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
</style>
