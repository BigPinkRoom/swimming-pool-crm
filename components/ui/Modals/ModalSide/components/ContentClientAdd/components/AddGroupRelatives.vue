<script setup>
import vInput from "@/components/ui/Fields/Input";
import CardTable from "@/components/Common/CardTable.vue";

import { uuid } from "vue-uuid";

import { useRelativesStore } from "@/stores/relativeStore";

import { relativeAddValidationSchema } from "@/schemas/zod/relativeSchemas";

import RelativeEntity from "@/entities/relativeEntity";
import "cleave.js/dist/addons/cleave-phone.ru";

import { relativesConstants } from "@/constants/relatives";

const props = defineProps({
  actionType: {
    type: String,
  },
});

const { $services } = useNuxtApp();
const { $i18n } = useNuxtApp();
const t = $i18n.t;
const relativesStore = useRelativesStore();
const uuidV4 = uuid.v4();

const showOneMoreRelative = ref(true);
const relativeAddToStoreLoading = ref(false);
const tempRelatives = reactive({});
const telephoneMask = ref(null);
const isEditing = ref(true);
const { checkValuesForValidateReset } = new RelativeEntity();

const relativeSections = computed(() =>
  $services.relatives.getRelativesSections(
    relativesStore.relatives,
    relativesStore.currentRelativeId
  )
);

const validationSchema = toTypedSchema(relativeAddValidationSchema(t));

const addOneMoreRelatives = async () => {
  if ($services.relatives.isMaxRelativesLimitReached(relativesStore.relatives))
    return;

  const newRelativeId = relativesStore.addEmpty();

  relativesStore.currentRelativeId = newRelativeId;

  showOneMoreRelative.value = true;
  getTempRelative(newRelativeId);
  resetForm();
  await nextTick();
  addInputMask();
};

const { errors, values, meta, validate, resetForm } = useForm({
  validationSchema,
  initialValues: {
    name: "",
    surname: "",
    patronymic: "",
    type: 1,
    telephone: "",
  },
});

const getTempRelative = (relativeId) => {
  if (!tempRelatives[relativeId]) {
    tempRelatives[relativeId] = {
      id: relativeId,
      name: "",
      surname: "",
      patronymic: "",
      type: 1,
      telephone: "",
    };
  }
  return tempRelatives[relativeId];
};

const addRelativeText = computed(() => {
  const checkRelativeLessMax =
    relativesStore.relatives.length <
      relativesConstants.MAX_QUANTITY_RELATIVES &&
    relativesConstants.MAX_QUANTITY_RELATIVES !== 0;
  const checkRelativeEqualMax =
    relativesStore.relatives.length >=
    relativesConstants.MAX_QUANTITY_RELATIVES;

  if (checkRelativeLessMax) {
    return "+ Добавить ещё одного родственника"; //TODO
  } else if (checkRelativeEqualMax) {
    return "Максимальное количество родственников"; //TODO
  } else {
    return "+ Добавить родственника";
  }
});

const addInputMask = () => {
  if (telephoneMask.value?.$el) {
    const inputElement = telephoneMask.value.$el.querySelector("input");
    if (inputElement) {
      if (inputElement._cleave) {
        inputElement._cleave.destroy();
      }
      new Cleave(inputElement, {
        phone: true,
        phoneRegionCode: "RU",
        prefix: "+7",
        noImmediatePrefix: true,
        delimiter: " ",
        blocks: [3, 0, 3, 3, 2, 2],
        numericOnly: true,
      });
    }
  }
};

const changeEdit = async (id) => {
  relativesStore.currentRelativeId = id;

  toggleEditing(true);

  if (checkValuesForValidateReset(currentTempRelative)) {
    resetForm();
  } else {
    validate();
  }

  await nextTick();
  addInputMask();
};

const toggleEditing = async (value) => {
  if (value === true) {
    await nextTick();
    addInputMask();
  }
  isEditing.value = value;
};

const showRelativeAddToStoreLoading = () => {
  relativeAddToStoreLoading.value = true;
  setTimeout(() => {
    relativeAddToStoreLoading.value = false;
  }, 1000);
};

const addRelativeToStore = async (activeRelativeId) => {
  try {
    const resultValidate = await validate();
    console.log("result validate", resultValidate);
    if (resultValidate.valid) {
      relativesStore.updateActiveRelative(
        activeRelativeId,
        currentTempRelative
      );
      showRelativeAddToStoreLoading();
    }
  } catch (error) {
    throw error;
  }
};

const currentTempRelative = computed(() =>
  getTempRelative(relativesStore.currentRelativeId)
);

const deleteRelative = (id) => {
  relativesStore.deleteRelative(id);
  delete tempRelatives[id];
};
const setRelativeTypesToStore = async () => {
  const relativeTypesValues = await $services.relatives.getTypes();
  relativesStore.setRelativesTypes(relativeTypesValues);
};

setRelativeTypesToStore();

const setRelativeTypeById = (relativeId) => {
  const relativeType = relativesStore.relativesTypes.find((type) => {
    return type.value === relativeId;
  });

  return relativeType?.text;
};
</script>

<template>
  <fieldset class="client-main__fieldset">
    <CardTable class="card-table__wrapper--gray">
      <template #title>
        <legend class="card-table__title card-table__title--gray">
          {{ $t(`forms.client.${actionType}.fieldsets.relatives.label`) }}
        </legend>
      </template>
      <template #content>
        <div class="card-table__table-title card-table__table-title--gray">
          <div class="card-table__table-tr">
            <div
              class="card-table__table-title-td card-table__table-title--name card-table__table-title-td--gray"
            >
              Имя / фамилия
            </div>
            <div
              class="card-table__table-title-td card-table__table-title--type card-table__table-title-td--gray"
            >
              Роль
            </div>
            <div
              class="card-table__table-title-td card-table__table-title--actions card-table__table-title-td--gray"
            >
              Действия
            </div>
          </div>
          <div
            class="card-table__table-tr"
            v-for="item in relativeSections.before"
            :key="item.id"
          >
            <div class="card-table__table-td card-table--name">
              {{ item.name }}
              <span class="card-table__name--surname">{{ item.surname }}</span>
            </div>
            <div class="card-table__table-td card-table--type">
              {{ setRelativeTypeById(item.type) }}
            </div>
            <div class="card-table__table-td card-table--actions">
              <div class="card-table__actions">
                <img
                  class="card-table__actions--edit"
                  src="/icons/edit.svg"
                  @click="changeEdit(item.id)"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div class="card-table__table-tr" v-if="relativeSections.active">
            <div v-if="!isEditing" class="card-table__table-tr">
              <div class="card-table__table-td card-table--name">
                {{ relativeSections.active.name }}
                <span class="card-table__name--surname">{{
                  relativeSections.active.surname
                }}</span>
              </div>
              <div class="card-table__table-td card-table--type"></div>
              <div class="card-table__table-td card-table--actions">
                <div class="card-table__actions">
                  <img
                    class="card-table__actions--edit"
                    src="/icons/edit.svg"
                    @click="changeEdit(relativeSections.active.id)"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div
              v-else
              class="card-table__table-td card-table__table-td--edit"
              colspan="4"
            >
              <svg
                v-if="relativeAddToStoreLoading"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <!-- Путь, описывающий периметр -->
                <path d="M 0 0 H 100 V 100 H 0 V 0 Z" />
              </svg>
              <div class="card-table__name-title">
                {{ relativeSections.active.name }}
                <div class="card-table__name-title--surname">
                  {{ relativeSections.active.surname }}
                </div>
              </div>
              <div class="card-table__actions">
                <img
                  src="/icons/arrow_down_icon.svg"
                  alt=""
                  class="card-table__actions-img"
                  @click="toggleEditing(false)"
                />
                <img
                  src="/icons/ok_icon.svg"
                  alt=""
                  class="card-table__actions-img"
                  @click="addRelativeToStore(relativeSections.active.id)"
                />
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`RelativeSurname_${uuidV4}`"
                  type="text"
                  :title="
                    $t(
                      `forms.client.add.fieldsets.relatives.fields.surname.label`
                    )
                  "
                  name="surname"
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.surname"
                  v-model="currentTempRelative.surname"
                ></ui-fields-input>
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`relativeName_${uuidV4}`"
                  type="text"
                  :title="
                    $t(`forms.client.add.fieldsets.relatives.fields.name.label`)
                  "
                  name="name"
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.name"
                  v-model="currentTempRelative.name"
                ></ui-fields-input>
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`relativePatronymic_${uuidV4}`"
                  type="text"
                  :title="
                    $t(
                      `forms.client.add.fieldsets.relatives.fields.patronymic.label`
                    )
                  "
                  name="patronymic"
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.patronymic"
                  v-model="currentTempRelative.patronymic"
                ></ui-fields-input>
              </div>
              <div class="card-table__field">
                <ui-selects-select
                  :id="`relativeType_${uuidV4}`"
                  type="text"
                  :title="
                    $t(`forms.client.add.fieldsets.relatives.fields.type.label`)
                  "
                  name="type"
                  :options-list="relativesStore.relativesTypes"
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.type"
                  v-model="currentTempRelative.type"
                ></ui-selects-select>
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`relativeTelephone_${uuidV4}`"
                  type="text"
                  :title="
                    $t(
                      `forms.client.add.fieldsets.relatives.fields.telephone.label`
                    )
                  "
                  name="telephone"
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.telephone"
                  :maxlength="relativesConstants.MAX_FIELD_TELEPHONE_NUMBERS"
                  ref="telephoneMask"
                  v-model="currentTempRelative.telephone"
                ></ui-fields-input>
              </div>
              <div
                class="card-table__delete"
                @click="deleteRelative(relativeSections.active.id)"
              >
                <div class="card-table__delete-text">Удалить</div>
                <img
                  src="/icons/delete_icon.svg"
                  alt=""
                  class="card-table__delete-img"
                />
              </div>
            </div>
          </div>
          <div
            class="card-table__table-tr"
            v-for="item in relativeSections.after"
            :key="item.id"
          >
            <div class="card-table__table-td card-table--name">
              {{ item.name }}
              <span class="card-table__name--surname">{{ item.surname }}</span>
            </div>
            <div class="card-table__table-td card-table--type">
              {{ setRelativeTypeById(item.type) }}
            </div>
            <div class="card-table__table-td card-table--actions">
              <div class="card-table__actions">
                <img
                  class="card-table__actions--edit"
                  src="/icons/edit.svg"
                  @click="changeEdit(item.id)"
                  alt=""
                />
              </div>
            </div>
          </div>
          <tr class="card-table__tr-add" v-if="showOneMoreRelative">
            <div class="card-table__add">
              <button
                class="card-table__button card-table__button--add"
                @click.prevent="addOneMoreRelatives"
                :disabled="
                  $services.relatives.isMaxRelativesLimitReached(
                    relativesStore.relatives
                  )
                "
              >
                {{ addRelativeText }}
              </button>
            </div>
          </tr>
        </div>
      </template>
    </CardTable>
  </fieldset>
</template>

<style lang="scss" scoped>
.client-main {
  &__fieldset {
    position: relative;
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
    &--type {
      width: 31%;
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

      border-left: 6px solid var(--color-main-light);
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
  &--type {
    width: 31%;
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

  &__field {
    position: relative;

    width: 17.1rem;

    margin-bottom: 2.2rem;
    // margin-right: 12px;
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
    margin-left: auto;

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

.card-table {
  &__table-td {
    &--edit {
      position: relative; // Для позиционирования SVG
      border-left: 6px solid var(--color-main-tertiary-lighter); // Основной бордер
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
