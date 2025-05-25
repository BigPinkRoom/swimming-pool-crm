/** * @file Компонент поиска и выбора существующей семьи. * Позволяет
пользователю искать семьи по ФИО или номеру телефона и выбирать семью из
результатов поиска. * При выборе семьи, компонент эмитирует событие
`family-selected` с данными выбранной семьи. */
<script setup>
import CardTable from "@/components/Common/CardTable.vue";
import { searchValidationSchema } from "@/schemas/zod/searchScemas";
import { useRelativesStore } from "@/stores/relativeStore";
import { computed, reactive, ref, onMounted } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import SearchService from "@/services/modules/search.js";

const { $i18n, $services } = useNuxtApp();
const t = $i18n.t;

/**
 * Хранилище данных о типах родственников.
 * @type {import('@/stores/relativeStore').RelativesStoreReturnType}
 */
const relativesStore = useRelativesStore();

/**
 * Определяет события, которые компонент может эмитировать.
 * @property {function(Object): void} family-selected - Событие, возникающее при выборе семьи. Передает данные выбранной семьи.
 */
const emit = defineEmits(["family-selected"]);

/**
 * Экземпляр сервиса для выполнения операций поиска и получения данных о семье.
 * @type {SearchService | null}
 */
let searchServiceInstance = null;

/**
 * Хук жизненного цикла Vue. Вызывается после монтирования компонента.
 * Инициализирует экземпляр `SearchService`.
 */
onMounted(() => {
  searchServiceInstance = new SearchService({ $services, relativesStore });
});

/**
 * Схема валидации Zod, преобразованная для использования с vee-validate.
 * @type {import('zod').ZodSchema}
 */
const validationSchema = toTypedSchema(searchValidationSchema(t));

/**
 * Функции и состояние, предоставляемые `vee-validate` для управления формой.
 * @property {Object} errors - Объект с ошибками валидации полей формы.
 * @property {Object} values - Объект со значениями полей формы.
 * @property {Object} meta - Метаданные формы (например, dirty, valid).
 * @property {function(): Promise<{valid: boolean}>} validate - Функция для запуска валидации формы.
 * @property {function} resetForm - Функция для сброса состояния формы к начальным значениям.
 */
const { errors, values, meta, validate, resetForm } = useForm({
  validationSchema,
  initialValues: {
    search: "",
  },
});

/**
 * Реактивная переменная, хранящая текущую поисковую строку.
 * @type {import('vue').Ref<string>}
 */
const search = ref("");

/**
 * Реактивная переменная, хранящая результаты поиска семей.
 * @type {import('vue').Ref<Array<Object>>}
 */
const searchResult = ref([]);

/**
 * Реактивная переменная, управляющая видимостью/сворачиванием списка результатов поиска.
 * @type {import('vue').Ref<boolean>}
 */
const isListCollapsing = ref(true);

/**
 * Получает текстовое представление типа родственника по его идентификатору.
 * @param {number | string} relativeTypeId - Идентификатор типа родственника.
 * @returns {string} Текстовое представление типа родственника или пустая строка, если не найдено.
 */
const getRelativeType = (relativeTypeId) => {
  return searchServiceInstance?.getRelativeTypeLabel(relativeTypeId) || "";
};

/**
 * Получает текстовое представление пола по его идентификатору.
 * @param {number | string} genderId - Идентификатор пола.
 * @returns {string} Текстовое представление пола или пустая строка, если не найдено.
 */
const getGender = (genderId) => {
  return searchServiceInstance?.getGenderLabel(genderId) || "";
};

/**
 * Выполняет поиск семей на основе текущей поисковой строки.
 * Обновляет `searchResult` и `isListCollapsing`.
 * @async
 */
const searchFamily = async () => {
  const resultValidate = await validate();
  if (resultValidate.valid) {
    if (searchServiceInstance) {
      const newResults = await searchServiceInstance.searchFamilies(
        search.value,
      );
      searchResult.value = newResults;
      isListCollapsing.value = newResults.length === 0;
    } else {
      console.warn("Search service not initialized yet");
      searchResult.value = [];
      isListCollapsing.value = true;
    }
  } else {
    isListCollapsing.value = !search.value || searchResult.value.length === 0;
  }
};

/**
 * Обрабатывает выбор семьи из списка результатов.
 * Получает полные данные о выбранной семье и эмитирует событие `family-selected`.
 * Сбрасывает состояние поиска.
 * @async
 * @param {Object} element - Объект с краткой информацией о выбранной семье из результатов поиска.
 */
const selectFamilyAndEmit = async (element) => {
  if (searchServiceInstance) {
    const selectedFamilyData =
      await searchServiceInstance.fetchAndPrepareFamilyDetails(element);
    emit("family-selected", selectedFamilyData);

    isListCollapsing.value = true;
    searchResult.value = [];
    search.value = "";
    resetForm();
  } else {
    console.warn(
      "Search service not initialized yet during selectFamilyAndEmit",
    );
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
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
  position: relative;
  z-index: 1;
}

.search-item-animation-leave-to {
  opacity: 0;
  transform: translateY(300px);
}

.search-results-list {
  max-height: 80rem;

  transition:
    max-height 0.5s ease-in-out,
    min-height 0.5s ease-in-out,
    padding-top 0.5s ease-in-out,
    padding-bottom 0.5s ease-in-out,
    padding-left 0.5s ease-in-out,
    padding-right 0.5s ease-in-out;

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
