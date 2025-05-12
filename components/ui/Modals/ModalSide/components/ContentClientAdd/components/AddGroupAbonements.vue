<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { computed, watch, reactive, ref, onUnmounted } from "vue";

import { uuid } from "vue-uuid";

import { useAbonementsStore } from "@/stores/abonementStore";
import { formatDate } from "@/helpers/formatDate";

import vRadioButton from "@/components/ui/RadioButtons/mainRadioButton";
import vCloseButton from "@/components/ui/Buttons/ButtonClose.vue";
import CardTable from "@/components/Common/CardTable.vue";

import { abonementValidationSchema } from "@/schemas/zod/abonementSchemas";

const { $i18n } = useNuxtApp();
const t = $i18n.t;
const abonementsStore = useAbonementsStore();

const validationSchema = toTypedSchema(abonementValidationSchema(t));

const props = defineProps({
  actionType: { type: Object, default: () => ({ type: "add", family: null }) },
  closeButton: { type: Boolean },
});

/**
 * @type {Object} Форма с валидацией
 */
const { errors, values, meta, validate, resetForm } = useForm({
  validationSchema,
  initialValues: {
    quantity: null,
    duration: null,
    activationDate: "",
    abonementType: 0,
  },
});

const inputData = reactive([
  { id: 0, value: 0, label: "Добавить новый" },
  { id: 1, value: 1, label: "Изменить существующий" },
]);

// toggleAbonementType должен инициализироваться на основе actionType.type, но также
// должен учитывать, есть ли уже загруженные абонементы для выбора.
const toggleAbonementType = ref(0); // По умолчанию "Добавить новый"

// Формируем options-list для select из абонементов в сторе
const abonementOptions = computed(() => {
  // Проверяем, есть ли абонементы в сторе и является ли это массивом
  if (abonementsStore.abonements && Array.isArray(abonementsStore.abonements)) {
    return abonementsStore.abonements.map((abonement) => ({
      text: `№ ${abonement.abonement_id} - (${abonement.visits_left ?? "-"} / ${
        abonement.visits_quantity ?? "-"
      } занятий) До ${formatDate(abonement.date_end, true) ?? "-"}`, // Используем поля из лога
      value: abonement.abonement_id, // Используем поля из лога
    }));
  }
  return []; // Возвращаем пустой массив, если абонементов нет или стор некорректен
});

const tempAbonement = reactive({
  duration: null,
  quantity: null,
  activationDate: null,
  selectedActiveAbonement: null,
});

// Главный watch для загрузки данных абонементов из props.actionType
watch(
  () => props.actionType,
  (newActionType) => {
    const familyAbonements = newActionType?.family?.abonements;

    if (familyAbonements && familyAbonements.length > 0) {
      // Нормализуем структуру абонементов для корректного отображения
      const normalized = familyAbonements.map((a) => ({
        abonement_id: a.abonement_id ?? a.id ?? a.abonementId,
        visits_quantity: a.visits_quantity ?? a.visitsQuantity,
        visits_left: a.visits_left ?? a.visitsLeft,
        date_create: a.date_create ?? a.dateCreate,
        date_start: a.date_start ?? a.dateStart,
        date_end: a.date_end ?? a.dateEnd,
        user_created_id: a.user_created_id ?? a.userCreatedId,
        status_id: a.status_id ?? a.statusId,
        branch_id: a.branch_id ?? a.branchId,
      }));
      abonementsStore.setFilledObject(normalized);
      toggleAbonementType.value = 1;
      // Гарантируем выбор первого абонемента
      tempAbonement.selectedActiveAbonement =
        normalized[0]?.abonement_id ?? null;
    } else {
      abonementsStore.setFilledObject([]);
      toggleAbonementType.value = 0;
      tempAbonement.selectedActiveAbonement = null;
    }
  },
  { immediate: true, deep: true }
);

watch(abonementOptions, (newOptions) => {
  if (toggleAbonementType.value === 1) {
    const newSelectedValue = newOptions?.[0]?.value ?? null;
    // Если ничего не выбрано, выбираем первый
    if (!tempAbonement.selectedActiveAbonement && newSelectedValue) {
      tempAbonement.selectedActiveAbonement = newSelectedValue;
    }
  }
});

// Watch для реакции на переключение радиокнопок "Добавить новый" / "Изменить существующий"
watch(toggleAbonementType, (newValue, oldValue) => {
  if (newValue === 0) {
    tempAbonement.selectedActiveAbonement = null;
  } else {
    const firstOptionValue = abonementOptions.value?.[0]?.value ?? null;
    if (tempAbonement.selectedActiveAbonement !== firstOptionValue) {
      tempAbonement.selectedActiveAbonement = firstOptionValue;
    }
  }
  resetTempAbonement();
});

const resetTempAbonement = () => {
  tempAbonement.quantity = null;
  tempAbonement.duration = null;
  tempAbonement.activationDate = null;

  resetForm({
    values: {
      quantity: null,
      duration: null,
      activationDate: "",
      abonementType: toggleAbonementType.value,
    },
  });
};

const uuidV4 = uuid.v4();
const clientAddToStoreLoading = ref(false);
// Получаем текущий абонемент (например, первый активный)
const currentAbonement = computed(
  () =>
    abonementsStore.abonements.find((a) => a.statusType === "active") ||
    abonementsStore.abonements[0] ||
    null
);

onUnmounted(() => {
  abonementsStore.setFilledObject([]);
  resetTempAbonement();
  toggleAbonementType.value = 0;
  tempAbonement.selectedActiveAbonement = null;
});

defineExpose({
  getCurrentTempAbonement: () => {
    if (toggleAbonementType.value === 0) {
      return { ...tempAbonement };
    }
    return null;
  },
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
                  name="abonementType"
                  :input-data="inputData"
                  class="card-table__radio"
                  v-model="toggleAbonementType"
                  @update:modelValue="resetTempAbonement"
                />
              </div>
              <div class="card-table__block" v-if="toggleAbonementType === 0">
                <div class="card-table__field card-table__field--quantity">
                  <ui-selects-select
                    :id="`abonementQuantity_${uuidV4}`"
                    type="number"
                    :title="
                      $t(
                        `forms.client.add.fieldsets.abonement.fields.quantity.label`
                      )
                    "
                    name="quantity"
                    :options-list="[
                      { text: '1', value: 1 },
                      { text: '3', value: 3 },
                      { text: '5', value: 5 },
                    ]"
                    :success-message="$t('zod.success')"
                    :errorSubmit="errors.quantity"
                    v-model="tempAbonement.quantity"
                  ></ui-selects-select>
                </div>
                <div class="card-table__field card-table__field--duration">
                  <ui-selects-select
                    :id="`abonementDuration_${uuidV4}`"
                    type="text"
                    :disabled="!tempAbonement.quantity"
                    :title="
                      $t(
                        `forms.client.add.fieldsets.abonement.fields.duration.label`
                      )
                    "
                    name="duration"
                    :options-list="[
                      { text: '5', value: 5 },
                      { text: '10', value: 10 },
                      { text: '15', value: 15 },
                    ]"
                    :success-message="$t('zod.success')"
                    :errorSubmit="errors.duration"
                    v-model="tempAbonement.duration"
                  ></ui-selects-select>
                </div>
                <div
                  class="card-table__field card-table__field--abonements-activation-date"
                >
                  <ui-fields-input
                    :id="`abonementActivationDate_${uuidV4}`"
                    type="date"
                    :title="
                      $t(
                        `forms.client.add.fieldsets.abonement.fields.activationDate.label`
                      )
                    "
                    name="activationDate"
                    :success-message="$t('zod.success')"
                    :errorSubmit="errors.activationDate"
                    v-model="tempAbonement.activationDate"
                  ></ui-fields-input>
                </div>
              </div>
              <div class="card-table__block" v-else>
                <div
                  class="card-table__field card-table__field--active-abonements"
                >
                  <ui-selects-select
                    :id="`abonementSelectedActiveAbonement${uuidV4}`"
                    :title="
                      $t(
                        `forms.client.add.fieldsets.abonement.fields.activeAbonements.label`
                      )
                    "
                    name="selectedActiveAbonement"
                    :options-list="abonementOptions"
                    :success-message="$t('zod.success')"
                    :errorSubmit="errors.selectedActiveAbonement"
                    v-model="tempAbonement.selectedActiveAbonement"
                  ></ui-selects-select>
                </div>
              </div>
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
