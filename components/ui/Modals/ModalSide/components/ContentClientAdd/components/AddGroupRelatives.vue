/** * @fileoverview Компонент для добавления и управления группой родственников
клиента * @module AddGroupRelatives */

<script setup>
import { reactive, ref, computed, nextTick, onMounted } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import Cleave from "cleave.js";
import { uuid } from "vue-uuid";

import vInput from "@/components/ui/Fields/Input";
import vCloseButton from "@/components/ui/Buttons/ButtonClose.vue";
import CardTable from "@/components/Common/CardTable.vue";

import { useRelativesStore } from "@/stores/relativeStore";
import { relativeAddValidationSchema } from "@/schemas/zod/relativeSchemas";
import RelativeEntity from "@/entities/relativeEntity";
import "cleave.js/dist/addons/cleave-phone.ru";
import { relativesConstants } from "@/constants/relatives";
import { unmaskPhone, maskPhone } from "@/helpers/phoneFormat";

/**
 * @typedef {Object} Props
 * @property {string} actionType - Тип действия (add/edit)
 * @property {boolean} closeButton - Флаг для отображения кнопки закрытия
 */

/**
 * @type {Props}
 */
const props = defineProps({
  actionType: {
    type: Object,
  },
  closeButton: {
    type: Boolean,
  },
});

const { $services } = useNuxtApp();
const { $i18n } = useNuxtApp();
const t = $i18n.t;
const relativesStore = useRelativesStore();
const uuidV4 = uuid.v4();
const { checkValuesForValidateReset } = new RelativeEntity();

const validationSchema = toTypedSchema(relativeAddValidationSchema(t));

/**
 * @type {Object} Форма с валидацией
 */
const { errors, values, meta, validate, resetForm } = useForm({
  validationSchema,
  initialValues: {
    name: "",
    surname: "",
    patronymic: "",
    relativeTypeId: 1,
    telephone: "",
  },
});

// Состояние компонента
const tempRelatives = reactive({});
const showOneMoreRelative = ref(true);
const telephoneMask = ref(null);
const isEditing = ref(true);
const isInitialized = ref(false); // Флаг для отслеживания инициализации компонента

defineEmits(["close"]);

// Загрузка типов родственников при инициализации компонента
const { data: relativeTypesData } = await useAsyncData(
  "relativeTypes",
  async () => {
    const relativeTypesData = await $services.relatives.getTypes();
    return relativeTypesData;
  },
);

relativesStore.setRelativesTypes(relativeTypesData.value);

/**
 * @computed
 * @returns {Object} Секции родственников
 */
const relativeSections = computed(() => {
  if (!relativesStore.relatives || relativesStore.relatives.length === 0) {
    return {
      before: [],
      active: null,
      after: [],
    };
  }

  return $services.relatives.getRelativesSections(
    relativesStore.relatives,
    relativesStore.currentRelativeId,
  );
});

/**
 * @computed
 * @returns {Object} Текущий временный родственник
 */
const currentTempRelative = computed(() => {
  const result = getTempRelative(relativesStore.currentRelativeId);
  return result;
});

/**
 * @computed
 * @returns {String} Текст для кнопки добавления родственника
 */
const addRelativeText = computed(() => {
  return $services.relatives.getAddRelativeButtonText(
    relativesStore.relatives,
    relativesConstants.MAX_QUANTITY_RELATIVES,
  );
});

/**
 * Получает временные данные родственника по индексу
 * @param {number} indexOrId - Индекс родственника (начиная с 1) или ID
 * @returns {Object} Данные родственника
 */
const getTempRelative = (indexOrId) => {
  return $services.relatives.getTempRelativeData(
    tempRelatives,
    relativesStore.relatives,
    indexOrId,
  );
};

/**
 * Переключает режим редактирования
 */
const toggleEditing = async (value) => {
  if (value === true) {
    await nextTick();
  }
  isEditing.value = value;
};

/**
 * Добавляет нового родственника
 */
const handleAddRelativeButtonClick = async () => {
  const result = await $services.relatives.handleAddRelativeWithValidation({
    relatives: relativesStore.relatives,
    activeSections: relativeSections.value,
    isEditing: isEditing.value,
    validate,
    updateActiveRelative: relativesStore.updateActiveRelative,
    currentTempRelative: currentTempRelative.value,
    currentRelativeId: relativesStore.currentRelativeId,
    maxLimit: relativesConstants.MAX_QUANTITY_RELATIVES,
  });

  if (!result.success) {
    return; // Прерываем выполнение, если операция не удалась
  }

  // Обрабатываем результат
  if (result.shouldCloseEditing) {
    isEditing.value = false;
  }

  if (result.newIndex) {
    relativesStore.currentRelativeId = result.newIndex;
    showOneMoreRelative.value = true;
  }

  if (result.formValues) {
    resetForm({ values: result.formValues });
  }

  if (result.shouldOpenEditing) {
    isEditing.value = true;
  }
};

/**
 * Добавляет нового родственника
 */
const addOneMoreRelatives = async () => {
  const result = $services.relatives.addNewRelative(
    relativesStore.relatives,
    relativesConstants.MAX_QUANTITY_RELATIVES,
  );

  if (!result.success) {
    return;
  }

  // Устанавливаем новый относительный индекс
  relativesStore.currentRelativeId = result.newIndex;
  showOneMoreRelative.value = true;

  resetForm({
    values: $services.relatives.getEmptyFormValues(),
  });

  // Обновляем DOM перед применением маски
  isEditing.value = true;
};

/**
 * Изменяет режим редактирования для родственника
 */
const changeEdit = async (index) => {
  const result = $services.relatives.handleEditModeSwitch({
    index,
    isEditing: isEditing.value,
    currentTempRelative: currentTempRelative.value,
    updateActiveRelative: relativesStore.updateActiveRelative,
    currentRelativeId: relativesStore.currentRelativeId,
    tempRelatives,
    relatives: relativesStore.relatives,
    getTempRelative,
  });

  if (result.success) {
    relativesStore.currentRelativeId = result.newRelativeId;

    if (result.shouldOpenEditing) {
      toggleEditing(true);
    }

    resetForm({
      values: result.formValues,
    });
  }
};

function setFormToUnsavedRelative(index, relative) {
  const result = $services.relatives.prepareUnsavedRelativeData(
    index,
    relative,
  );

  relativesStore.currentRelativeId = result.currentRelativeId;
  resetForm({
    values: result.formValues,
  });

  if (result.shouldOpenEditing) {
    isEditing.value = true;
  }
}

function handleUnsavedRelative() {
  const unsavedData = $services.relatives.findUnsavedRelative(
    relativesStore.relatives,
  );

  if (unsavedData.exists) {
    setFormToUnsavedRelative(unsavedData.index, unsavedData.relative);
  } else {
    addOneMoreRelatives();
  }
}

/**
 * Добавляет родственника в хранилище
 */
const addRelativeToStore = async (activeIndex) => {
  const result = await $services.relatives.saveActiveAndAddNew({
    relatives: relativesStore.relatives,
    activeSections: relativeSections.value,
    validate,
    updateActiveRelative: relativesStore.updateActiveRelative,
    currentTempRelative: currentTempRelative.value,
    activeIndex,
    maxLimit: relativesConstants.MAX_QUANTITY_RELATIVES,
  });

  if (!result.success) {
    if (result.reason === "no_active_relative") {
      console.error("Нет активного родственника для обновления");
    } else if (result.error) {
      throw result.error;
    }
    return;
  }

  // Обрабатываем результат
  if (result.newIndex) {
    relativesStore.currentRelativeId = result.newIndex;
  }

  if (result.formValues) {
    resetForm({ values: result.formValues });
  }

  if (result.shouldOpenEditing) {
    isEditing.value = true;
  } else if (result.shouldCloseEditing) {
    isEditing.value = false;
  }
};

/**
 * Удаляет родственника
 */
const deleteRelative = async (index) => {
  const result = $services.relatives.handleRelativeDeletion({
    relatives: relativesStore.relatives,
    tempRelatives,
    index,
    getTempRelative,
    addOneMoreRelatives,
  });

  if (!result.success) {
    if (result.reason === "relative_not_found") {
      console.error(result.message);
    }
    return;
  }

  // Обрабатываем результат на основе действия
  const { nextActive } = result;

  switch (nextActive.action) {
    case "add_new":
      addOneMoreRelatives();
      break;

    case "switch_to_unsaved":
      relativesStore.currentRelativeId = nextActive.currentRelativeId;
      resetForm({ values: nextActive.formValues });
      if (nextActive.shouldOpenEditing) {
        toggleEditing(true);
      }
      break;

    case "switch_to_first":
      relativesStore.currentRelativeId = nextActive.currentRelativeId;
      resetForm({ values: nextActive.formValues });
      if (nextActive.shouldCloseEditing) {
        toggleEditing(false);
      }
      break;
  }
};

/**
 * Получает тип родственника по ID
 */
const setRelativeTypeById = (relativeId) => {
  return $services.relatives.getRelativeTypeById(
    relativesStore?.relativesTypes,
    relativeId,
  );
};

/**
 * Устанавливает данные для редактирования
 */
const setEditRelative = () => {
  const result = $services.relatives.handleFullInitialization({
    actionType: props.actionType,
    resetStore: relativesStore.reset,
    clearTempCache: $services.relatives.clearTempRelativesCache,
    setRelativeOfEdit: relativesStore.setRelativeOfEdit,
    tempRelatives,
    addOneMoreRelatives,
  });

  // Обрабатываем результат инициализации
  switch (result.action) {
    case "add_new":
    case "add_new_client":
    case "add_new_fallback":
      if (result.shouldAddNew) {
        addOneMoreRelatives();
      }
      if (result.warning) {
        console.warn(result.warning);
      }
      break;

    case "set_first_relative":
      relativesStore.currentRelativeId = result.currentRelativeId;

      if (result.shouldCloseEditing) {
        toggleEditing(false);
      }

      // Получаем данные из временного кэша для текущего родственника
      const currentRelativeData = getTempRelative(
        relativesStore.currentRelativeId,
      );

      // Сбрасываем форму с данными текущего родственника
      resetForm({
        values: $services.relatives.getRelativeFormValues(currentRelativeData),
      });
      break;

    case "no_action":
      // Ничего не делаем
      break;
  }
};

/**
 * Закрывает модальное окно
 */
const close = () => {
  emit("close");
};

// Отслеживаем изменения в семье клиента
watch(
  () => props.actionType,
  (newActionType) => {
    const result = $services.relatives.handleFullInitialization({
      actionType: newActionType,
      resetStore: relativesStore.reset,
      clearTempCache: $services.relatives.clearTempRelativesCache,
      setRelativeOfEdit: relativesStore.setRelativeOfEdit,
      tempRelatives,
      addOneMoreRelatives,
    });

    // Обрабатываем результат инициализации
    switch (result.action) {
      case "add_new":
      case "add_new_client":
      case "add_new_fallback":
        if (result.shouldAddNew) {
          addOneMoreRelatives();
        }
        break;

      case "set_first_relative":
        relativesStore.currentRelativeId = result.currentRelativeId;

        if (result.formValues) {
          resetForm({ values: result.formValues });
        }

        if (result.shouldCloseEditing) {
          isEditing.value = false;
        }
        break;
    }

    isInitialized.value = true;
  },
  { immediate: true, deep: true },
);

// Отслеживаем изменения в списке родственников
watch(
  () => relativesStore.relatives.length,
  (newLength) => {
    // Если список стал пуст и компонент уже инициализирован, открываем форму
    if (newLength === 0 && isInitialized.value) {
      addOneMoreRelatives();
    }
  },
);

// Инициализация компонента
onMounted(async () => {
  const initCheck = $services.relatives.shouldInitializeOnMount({
    isInitialized: isInitialized.value,
    relativesCount: relativesStore.relatives.length,
    actionType: props.actionType,
  });

  if (initCheck.shouldInitialize) {
    addOneMoreRelatives();
  }

  await nextTick();
});

const maskedTelephone = computed({
  get() {
    return maskPhone(currentTempRelative.value.telephone || "");
  },
  set(val) {
    currentTempRelative.value.telephone = unmaskPhone(val);
  },
});
</script>

<template>
  <fieldset class="client-main__fieldset">
    <CardTable class="card-table__wrapper--gray">
      <template #title>
        <legend class="card-table__title card-table__title--gray">
          {{ $t("forms.client.edit.fieldsets.relatives.label") }}
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
            v-for="(item, index) in relativeSections.before"
            :key="item.id || 'before-' + (index + 1)"
            class="card-table__table-tr"
          >
            <div class="card-table__table-td card-table--name">
              {{ item.name }}
              <span class="card-table__name--surname">{{ item.surname }}</span>
            </div>
            <div class="card-table__table-td card-table--type">
              {{ setRelativeTypeById(item.relativeTypeId) }}
            </div>
            <div class="card-table__table-td card-table--actions">
              <div class="card-table__actions">
                <img
                  class="card-table__actions--edit"
                  src="/icons/edit.svg"
                  alt=""
                  @click="
                    changeEdit(
                      item.id || relativeSections.before.indexOf(item) + 1,
                    )
                  "
                />
              </div>
            </div>
          </div>
          <div v-if="relativeSections.active" class="card-table__table-tr">
            <div v-if="!isEditing" class="card-table__table-tr">
              <div class="card-table__table-td card-table--name">
                {{ relativeSections.active.name }}
                <span class="card-table__name--surname">{{
                  relativeSections.active.surname
                }}</span>
              </div>
              <div class="card-table__table-td card-table--type">
                {{
                  setRelativeTypeById(relativeSections.active.relativeTypeId)
                }}
              </div>
              <div class="card-table__table-td card-table--actions">
                <div class="card-table__actions">
                  <img
                    class="card-table__actions--edit"
                    src="/icons/edit.svg"
                    alt=""
                    @click="
                      changeEdit(
                        relativeSections.active.id ||
                          relativesStore.currentRelativeId,
                      )
                    "
                  />
                </div>
              </div>
            </div>
            <div
              v-else
              class="card-table__table-td card-table__table-td--edit"
              colspan="4"
            >
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
                  class="card-table__actions-img card-table__actions-img--arrow"
                  @click="toggleEditing(false)"
                />
                <img
                  src="/icons/ok_icon.svg"
                  alt=""
                  class="card-table__actions-img card-table__actions-img--ok"
                  @click="
                    addRelativeToStore(
                      relativeSections.active.id ||
                        relativesStore.currentRelativeId,
                    )
                  "
                />
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`RelativeSurname_${uuidV4}`"
                  v-model="currentTempRelative.surname"
                  type="text"
                  name="surname"
                  :title="
                    $t(
                      'forms.client.add.fieldsets.relatives.fields.surname.label',
                    )
                  "
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.surname"
                ></ui-fields-input>
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`relativeName_${uuidV4}`"
                  v-model="currentTempRelative.name"
                  type="text"
                  name="name"
                  :title="
                    $t('forms.client.add.fieldsets.relatives.fields.name.label')
                  "
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.name"
                ></ui-fields-input>
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`relativePatronymic_${uuidV4}`"
                  v-model="currentTempRelative.patronymic"
                  type="text"
                  name="patronymic"
                  :title="
                    $t(
                      'forms.client.add.fieldsets.relatives.fields.patronymic.label',
                    )
                  "
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.patronymic"
                ></ui-fields-input>
              </div>
              <div class="card-table__field">
                <ui-selects-select
                  :id="`relativeType_${uuidV4}`"
                  v-model="currentTempRelative.relativeTypeId"
                  type="text"
                  name="type"
                  :title="
                    $t('forms.client.add.fieldsets.relatives.fields.type.label')
                  "
                  :options-list="relativesStore.relativesTypes"
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.type"
                ></ui-selects-select>
              </div>
              <div class="card-table__field card-table__field--telephone">
                <ui-fields-input
                  :id="`relativeTelephone_${uuidV4}`"
                  v-model="maskedTelephone"
                  type="text"
                  name="telephone"
                  :title="
                    $t(
                      'forms.client.add.fieldsets.relatives.fields.telephone.label',
                    )
                  "
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.telephone"
                  :maxlength="relativesConstants.MAX_FIELD_TELEPHONE_NUMBERS"
                ></ui-fields-input>
              </div>
              <div
                v-if="!relativeSections.active.isFirstClient"
                class="card-table__delete"
                @click="
                  deleteRelative(
                    relativeSections.active.id ||
                      relativesStore.currentRelativeId,
                  )
                "
              >
                <div class="card-table__delete-text">Удалить</div>
                <img
                  src="/icons/delete_icon.svg"
                  alt=""
                  class="card-table__delete-img"
                />
              </div>
              <img
                v-if="relativeSections.active.isFirstClient"
                v-tooltip="
                  'Так как это первый (основной) родственник, то он не может быть удален'
                "
                src="/icons/lock_icon.svg"
                alt=""
                class="card-table__lock-img"
              />
            </div>
          </div>
          <div
            v-for="(item, index) in relativeSections.after"
            :key="item.id || 'after-' + (index + 1)"
            class="card-table__table-tr"
          >
            <div class="card-table__table-td card-table--name">
              {{ item.name }}
              <span class="card-table__name--surname">{{ item.surname }}</span>
            </div>
            <div class="card-table__table-td card-table--type">
              {{ setRelativeTypeById(item.relativeTypeId) }}
            </div>
            <div class="card-table__table-td card-table--actions">
              <div class="card-table__actions">
                <img
                  class="card-table__actions--edit"
                  src="/icons/edit.svg"
                  alt=""
                  @click="
                    changeEdit(
                      item.id || relativeSections.before.length + 1 + index + 1,
                    )
                  "
                />
              </div>
            </div>
          </div>
          <tr v-if="showOneMoreRelative" class="card-table__tr-add">
            <div class="card-table__add">
              <button
                class="card-table__button card-table__button--add"
                :disabled="
                  $services.relatives.isMaxRelativesLimitReached(
                    relativesStore.relatives,
                  )
                "
                @click.prevent="handleAddRelativeButtonClick"
              >
                {{ addRelativeText }}
              </button>
            </div>
          </tr>
        </div>
      </template>
      <template #footer>
        <div v-if="closeButton" class="client-main__close">
          <v-close-button @click="close" />
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

    &--telephone {
      margin: 0 0 0 0;
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

  &__lock-img {
    width: 2.3rem;
    height: 2.3rem;
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
