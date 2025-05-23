/** * @file Компонент для добавления/изменения групповых абонементов *
@description Позволяет создавать новые абонементы или изменять существующие для
группы клиентов * @module AddGroupAbonements */

<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { computed, watch, reactive, ref, onUnmounted } from "vue";

import { uuid } from "vue-uuid";

import { useAbonementsStore } from "@/stores/abonementStore";
import { formatDate } from "@/helpers/formatDate";
import {
  normalizeAbonements,
  getAbonementOptions,
  getCurrentActiveAbonement,
  getInitialTempAbonement,
  getInitialFormValues,
  handleAbonementTypeChange,
  handleAbonementOptionsChange,
  handleFamilyAbonementsChange,
  getCurrentTempAbonement,
} from "@/services/modules/abonements";

import vRadioButton from "@/components/ui/RadioButtons/mainRadioButton";
import vCloseButton from "@/components/ui/Buttons/ButtonClose.vue";
import CardTable from "@/components/Common/CardTable.vue";

import { abonementValidationSchema } from "@/schemas/zod/abonementSchemas";

const { $i18n } = useNuxtApp();
const t = $i18n.t;
const abonementsStore = useAbonementsStore();

/**
 * Схема валидации для формы абонемента
 * @type {import('@vee-validate/zod').TypedSchema}
 */
const validationSchema = toTypedSchema(abonementValidationSchema(t));

/**
 * @typedef {Object} ActionType
 * @property {string} type - Тип действия ('add' или 'edit')
 * @property {Object} [family] - Данные семьи
 */

/**
 * @typedef {Object} Props
 * @property {ActionType} actionType - Тип действия и данные семьи
 * @property {boolean} closeButton - Флаг отображения кнопки закрытия
 */

/**
 * Props компонента
 */
const props = defineProps({
  actionType: { type: Object, default: () => ({ type: "add", family: null }) },
  closeButton: { type: Boolean },
});

/**
 * Форма с валидацией
 * @type {import('vee-validate').UseFormReturn<Object>}
 */
const { errors, values, meta, validate, resetForm } = useForm({
  validationSchema,
  initialValues: getInitialFormValues(),
});

/**
 * Опции для выбора типа абонемента
 * @type {Array<{id: number, value: number, label: string}>}
 */
const inputData = reactive([
  { id: 0, value: 0, label: "Добавить новый" },
  { id: 1, value: 1, label: "Изменить существующий" },
]);

/**
 * Текущий тип абонемента (0 - новый, 1 - существующий)
 * @type {import('vue').Ref<number>}
 */
const toggleAbonementType = ref(0);

/**
 * Временный абонемент для хранения данных формы
 * @type {import('vue').Reactive<{
 *   duration: number|null,
 *   quantity: number|null,
 *   activationDate: string|null,
 *   selectedActiveAbonement: string|null
 * }>}
 */
const tempAbonement = reactive(getInitialTempAbonement());

/**
 * Опции для селекта абонементов
 * @type {import('vue').ComputedRef<Array<{text: string, value: string|number}>>}
 */
const abonementOptions = computed(() =>
  getAbonementOptions(abonementsStore.abonements),
);

/**
 * Обработчик изменения данных абонементов семьи
 * @param {ActionType} newActionType - Новые данные действия
 */
watch(
  () => props.actionType,
  (newActionType) => {
    const familyAbonements = newActionType?.family?.abonements;
    const result = handleFamilyAbonementsChange(familyAbonements);

    abonementsStore.setFilledObject(result.abonements);
    toggleAbonementType.value = result.type;
    tempAbonement.selectedActiveAbonement = result.selectedAbonement;
  },
  { immediate: true, deep: true },
);

/**
 * Обработчик изменения опций абонементов
 * @param {Array<{text: string, value: string|number}>} newOptions - Новые опции абонементов
 */
watch(abonementOptions, (newOptions) => {
  tempAbonement.selectedActiveAbonement = handleAbonementOptionsChange(
    toggleAbonementType.value,
    tempAbonement.selectedActiveAbonement,
    newOptions,
  );
});

/**
 * Обработчик изменения типа абонемента
 * @param {number} newValue - Новый тип абонемента
 */
watch(toggleAbonementType, (newValue) => {
  const result = handleAbonementTypeChange(newValue, abonementOptions.value);
  tempAbonement.selectedActiveAbonement = result.selectedActiveAbonement;
  resetForm({ values: result.formValues });
});

/**
 * Сбрасывает временный абонемент к начальным значениям
 * @function resetTempAbonement
 */
const resetTempAbonement = () => {
  Object.assign(tempAbonement, getInitialTempAbonement());
  resetForm({
    values: getInitialFormValues(toggleAbonementType.value),
  });
};

/**
 * Уникальный идентификатор для компонента
 * @type {string}
 */
const uuidV4 = uuid.v4();

/**
 * Флаг загрузки данных
 * @type {import('vue').Ref<boolean>}
 */
const clientAddToStoreLoading = ref(false);

/**
 * Текущий активный абонемент
 * @type {import('vue').ComputedRef<Object|null>}
 */
const currentAbonement = computed(() =>
  getCurrentActiveAbonement(abonementsStore.abonements),
);

/**
 * Очистка при размонтировании компонента
 */
onUnmounted(() => {
  abonementsStore.setFilledObject([]);
  resetTempAbonement();
  toggleAbonementType.value = 0;
  tempAbonement.selectedActiveAbonement = null;
});

/**
 * Экспортируемые методы компонента
 */
defineExpose({
  /**
   * Получает текущий временный абонемент
   * @returns {Object|null} Текущий временный абонемент или null
   */
  getCurrentTempAbonement: () =>
    getCurrentTempAbonement(toggleAbonementType.value, tempAbonement),
});
</script>

<template>
  <fieldset class="client-main__fieldset">
    <card-table class="card-table__wrapper--gray">
      <template #title>
        <legend
          class="card-table__title card-table__title--gray card-table__title--abonements"
        >
          {{ $t(`forms.client.add.fieldsets.abonement.label`) }}
        </legend>
      </template>
      <template #content>
        <div class="card-table__table-title card-table__table-title--gray">
          <div class="card-table__table-tr">
            <div
              class="card-table__table-td card-table__table-td--edit"
              colspan="4"
            >
              <svg
                v-if="clientAddToStoreLoading"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <!-- Путь, описывающий периметр -->
                <path d="M 0 0 H 100 V 100 H 0 V 0 Z" />
              </svg>
              <div class="card-table__field card-table__field--abonements-type">
                <v-radio-button
                  v-model="toggleAbonementType"
                  name="abonementType"
                  class="card-table__radio"
                  :input-data="inputData"
                  @update:modelValue="resetTempAbonement"
                />
              </div>
              <div v-if="toggleAbonementType === 0" class="card-table__block">
                <div class="card-table__field card-table__field--quantity">
                  <ui-selects-select
                    :id="`abonementQuantity_${uuidV4}`"
                    v-model="tempAbonement.quantity"
                    type="number"
                    name="quantity"
                    :title="
                      $t(
                        `forms.client.add.fieldsets.abonement.fields.quantity.label`,
                      )
                    "
                    :options-list="[
                      { text: '1', value: 1 },
                      { text: '3', value: 3 },
                      { text: '5', value: 5 },
                    ]"
                    :success-message="$t('zod.success')"
                    :errorSubmit="errors.quantity"
                  ></ui-selects-select>
                </div>
                <div class="card-table__field card-table__field--duration">
                  <ui-selects-select
                    :id="`abonementDuration_${uuidV4}`"
                    v-model="tempAbonement.duration"
                    type="text"
                    name="duration"
                    :disabled="!tempAbonement.quantity"
                    :title="
                      $t(
                        `forms.client.add.fieldsets.abonement.fields.duration.label`,
                      )
                    "
                    :options-list="[
                      { text: '5', value: 5 },
                      { text: '10', value: 10 },
                      { text: '15', value: 15 },
                    ]"
                    :success-message="$t('zod.success')"
                    :errorSubmit="errors.duration"
                  ></ui-selects-select>
                </div>
                <div
                  class="card-table__field card-table__field--abonements-activation-date"
                >
                  <ui-fields-input
                    :id="`abonementActivationDate_${uuidV4}`"
                    v-model="tempAbonement.activationDate"
                    type="date"
                    name="activationDate"
                    :title="
                      $t(
                        `forms.client.add.fieldsets.abonement.fields.activationDate.label`,
                      )
                    "
                    :success-message="$t('zod.success')"
                    :errorSubmit="errors.activationDate"
                  ></ui-fields-input>
                </div>
              </div>
              <div v-else class="card-table__block">
                <div
                  class="card-table__field card-table__field--active-abonements"
                >
                  <ui-selects-select
                    :id="`abonementSelectedActiveAbonement${uuidV4}`"
                    v-model="tempAbonement.selectedActiveAbonement"
                    name="selectedActiveAbonement"
                    :title="
                      $t(
                        `forms.client.add.fieldsets.abonement.fields.activeAbonements.label`,
                      )
                    "
                    :options-list="abonementOptions"
                    :success-message="$t('zod.success')"
                    :errorSubmit="errors.selectedActiveAbonement"
                  ></ui-selects-select>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    padding-left: 0;

    border: 0;
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
  &__table-title {
    &--name {
      width: 48%;
    }
    &--age {
      width: 18%;
    }
    &--gender {
      width: 12%;
    }
    &--actions {
      width: 22%;
    }
  }

  &__table-tr {
    display: flex;
    align-items: center;
    width: 100%;
  }

  &__table-td {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 3.8rem;

    border-top: 0;
    border-left: 0;

    &:last-child {
      border-right: 0;
    }

    &--edit {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      padding: 1.2rem 1.4rem;
    }
  }
  &--name {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    width: 48%;
    padding-left: 1.8rem;

    &--surname {
      font-size: 1.2rem;
    }
  }
  &--age {
    width: 18%;
  }
  &--gender {
    width: 12%;
  }
  &--actions {
    width: 22%;
  }

  &__title {
    font-size: 16px;
    font-weight: 500;
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
  &__block {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  &__field {
    position: relative;

    width: 17.1rem;

    margin-bottom: 2.2rem;
    // margin-right: 12px;

    &--abonements-type {
      width: 100%;
    }

    &--abonements-activation-date {
      width: 100%;
    }

    &--quantity {
      width: 17.5rem;
    }

    &--duration {
      width: 17.5rem;
    }

    &--active-abonements {
      width: 100%;
    }

    &--activation-text {
      display: flex;
      font-size: 14px;
    }
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
}

// Анимация загрузки
.card-table {
  &__table-td {
    &--edit {
      position: relative; // Для позиционирования SVG
      overflow: hidden; // Скрываем выходящие за границы элементы

      &::before {
        content: ""; // Создаем псевдоэлемент
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none; // Чтобы SVG не мешал взаимодействию с элементом
      }

      svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none; // Чтобы SVG не мешал взаимодействию с элементом
      }

      path {
        fill: none;
        stroke: var(--color-main); // Цвет линии
        stroke-width: 1px; // Толщина линии
        stroke-dasharray: 100; // Длина пунктирной линии
        stroke-dashoffset: 1000; // Смещение для анимации
        animation: draw-border 5s linear infinite; // Анимация
      }
    }
  }
}

// Ключевые кадры для анимации
@keyframes draw-border {
  to {
    stroke-dashoffset: 0; // Линия "рисуется" полностью
  }
}
</style>
