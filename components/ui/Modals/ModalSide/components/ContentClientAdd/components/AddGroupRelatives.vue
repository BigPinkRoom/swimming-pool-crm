/** * @fileoverview Компонент AddGroupRelatives.vue. * Предназначен для
управления группой родственников клиента. * Позволяет добавлять, редактировать и
удалять родственников, валидировать их данные, * а также управлять состоянием
формы и временным кэшем данных. * Компонент интегрирован с сервисным слоем для
обработки бизнес-логики и хранилищем Pinia (useRelativesStore). * * @module
AddGroupRelatives * @version 1.1.0 */

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
 * @typedef {Object} ActionTypeProp
 * @property {string} type - Тип действия, которое должен выполнить компонент. Может быть 'add' или 'edit'.
 * @property {Object} [family] - Данные семьи, передаваемые при type: 'edit'.
 * @property {Array<Object>} [family.relatives] - Массив объектов родственников для инициализации формы в режиме редактирования.
 */

/**
 * @typedef {Object} ComponentProps
 * @property {ActionTypeProp} actionType - Объект, определяющий режим работы компонента и начальные данные.
 * @property {boolean} [closeButton=false] - Флаг, определяющий, нужно ли отображать кнопку закрытия.
 */

/**
 * Props компонента.
 * @type {ComponentProps}
 */
const props = defineProps({
  actionType: {
    type: Object,
    required: true,
    /**
     * Валидатор для actionType. Проверяет наличие type и его значение ('add' или 'edit').
     * @param {ActionTypeProp} value - Значение пропса actionType.
     * @returns {boolean} True, если значение валидно.
     */
    validator: (value) => {
      if (!value || typeof value.type !== "string") return false;
      const isValidType = ["add", "edit"].includes(value.type);
      if (
        value.type === "edit" &&
        (!value.family || !Array.isArray(value.family.relatives))
      ) {
        // console.warn("AddGroupRelatives: 'family.relatives' is required and must be an array when actionType.type is 'edit'.");
        // Для режима редактирования family.relatives может быть пустым, если новый клиент
      }
      return isValidType;
    },
  },
  closeButton: {
    type: Boolean,
    default: false,
  },
});

/**
 * Экземпляр Nuxt-приложения для доступа к глобальным сервисам и плагинам.
 * @type {Object}
 * @property {Object} $services - Объект, содержащий все зарегистрированные сервисы приложения.
 * @property {Object} $i18n - Экземпляр i18n для локализации.
 */
const { $services, $i18n } = useNuxtApp();

/**
 * Функция для локализации строк.
 * @type {Function}
 */
const t = $i18n.t;

/**
 * Экземпляр хранилища Pinia для управления состоянием родственников.
 * @type {import('@/stores/relativeStore').useRelativesStore}
 */
const relativesStore = useRelativesStore();

/**
 * Уникальный идентификатор (UUID v4) для использования в ключах и ID элементов формы,
 * для обеспечения уникальности и предотвращения конфликтов.
 * @type {string}
 */
const uuidV4 = uuid.v4();

/**
 * Экземпляр класса RelativeEntity для работы с бизнес-сущностью "родственник".
 * @type {RelativeEntity}
 */
const relativeEntity = new RelativeEntity();

/**
 * Функция для проверки, являются ли значения формы пустыми, чтобы определить, нужно ли сбрасывать валидацию.
 * Получена из экземпляра relativeEntity.
 * @type {Function}
 */
const { checkValuesForValidateReset } = relativeEntity;

/**
 * Схема валидации Zod, адаптированная для VeeValidate.
 * @type {import('zod').ZodSchema}
 */
const validationSchema = toTypedSchema(relativeAddValidationSchema(t));

/**
 * Объект, возвращаемый хуком useForm от VeeValidate.
 * @type {Object}
 * @property {Object} errors - Объект с ошибками валидации для каждого поля формы.
 * @property {Object} values - Реактивный объект со значениями полей формы.
 * @property {Object} meta - Объект с метаданными формы (например, dirty, valid, pending).
 * @property {Function} validate - Асинхронная функция для запуска валидации всех полей формы.
 * @property {Function} resetForm - Функция для сброса значений формы и ее состояния валидации.
 */
const { errors, values, meta, validate, resetForm } = useForm({
  validationSchema,
  initialValues: relativeEntity.getInitialFormValues(),
});

// Состояние компонента
/**
 * Реактивный объект для временного хранения данных редактируемых родственников.
 * Ключами являются ID или временные индексы родственников.
 * @type {Object<string|number, Object>}
 */
const tempRelatives = reactive({});

/**
 * Ref-переменная, определяющая, нужно ли отображать кнопку "Добавить еще одного родственника".
 * @type {Ref<boolean>}
 */
const showOneMoreRelative = ref(true);

/**
 * Ref-переменная для хранения экземпляра маски Cleave.js для поля ввода телефона.
 * @type {Ref<null|Object>}
 */
const telephoneMask = ref(null); // В данный момент не используется, но может быть для прямого управления маской

/**
 * Ref-переменная, указывающая, находится ли форма в режиме редактирования активного родственника.
 * @type {Ref<boolean>}
 */
const isEditing = ref(true);

/**
 * Ref-переменная, указывающая, был ли компонент инициализирован (например, после загрузки данных).
 * @type {Ref<boolean>}
 */
const isInitialized = ref(false);

/**
 * Функция для эмита событий компонентом.
 * @type {Function}
 * @fires close - Событие, вызываемое при необходимости закрыть компонент (например, модальное окно).
 */
const emit = defineEmits(["close"]);

/**
 * Асинхронная загрузка и установка типов родственников в хранилище.
 * Использует `useAsyncData` для предотвращения повторных запросов и кэширования.
 * @type {Object}
 * @property {Ref<Array<Object>>} data - Реактивная ссылка на загруженные данные (типы родственников).
 * @property {Ref<boolean>} pending - Флаг, указывающий, находится ли запрос в процессе выполнения.
 * @property {Ref<Error|null>} error - Ошибка, если запрос не удался.
 * @property {Function} refresh - Функция для принудительного обновления данных.
 */
const { data: relativeTypesData } = await useAsyncData("relativeTypes", () =>
  $services.relatives.initializeRelativeTypes(relativesStore.setRelativesTypes),
);

/**
 * Вычисляемое свойство для получения разделенных секций родственников (до активного, активный, после активного).
 * Используется для удобного рендеринга списка родственников в шаблоне.
 * @type {ComputedRef<Object>}
 * @returns {{before: Array<Object>, active: Object|null, after: Array<Object>}} Объект с секциями родственников.
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
 * Вычисляемое свойство, предоставляющее доступ к данным текущего активного родственника из временного кэша.
 * Реагирует на изменение `relativesStore.currentRelativeId`.
 * @type {ComputedRef<Object|undefined>}
 * @returns {Object|undefined} Объект текущего временного родственника или undefined, если он не найден.
 */
const currentTempRelative = computed(() => {
  const result = getTempRelative(relativesStore.currentRelativeId);
  return result;
});

/**
 * Вычисляемое свойство для получения текста кнопки добавления родственника.
 * Текст зависит от текущего количества родственников и максимального лимита.
 * @type {ComputedRef<string>}
 * @returns {string} Текст для кнопки добавления.
 */
const addRelativeText = computed(() => {
  return $services.relatives.getAddRelativeButtonText(
    relativesStore.relatives,
    relativesConstants.MAX_QUANTITY_RELATIVES,
  );
});

/**
 * Получает временные данные родственника из кэша `tempRelatives` по его ID или индексу.
 * Если данные отсутствуют в кэше, они запрашиваются из сервиса `relatives.getTempRelativeData`.
 * @param {string|number} indexOrId - ID или индекс родственника.
 * @returns {Object} Объект с данными родственника из временного кэша.
 */
const getTempRelative = (indexOrId) => {
  return $services.relatives.getTempRelativeData(
    tempRelatives,
    relativesStore.relatives,
    indexOrId,
  );
};

/**
 * Асинхронно переключает состояние редактирования активного родственника.
 * @param {boolean} value - Новое состояние режима редактирования (true - включить, false - выключить).
 * @returns {Promise<void>} Promise, который разрешается после обновления DOM (если value === true).
 */
const toggleEditing = async (value) => {
  if (value === true) {
    await nextTick();
  }
  isEditing.value = value;
};

/**
 * Выполняет массив действий, полученных от сервисного слоя.
 * Каждое действие - это объект с полем `type` и опциональными полями `value`, `values`, `message`.
 * @param {Array<Object>} actions - Массив объектов действий.
 * @example executeActions([{ type: 'setEditing', value: false }, { type: 'resetForm', values: {} }])
 */
const executeActions = (actions) => {
  actions.forEach((action) => {
    switch (action.type) {
      case "error":
        console.error(action.message || action.reason);
        break;
      case "warning":
        console.warn(action.message);
        break;
      case "setEditing":
        isEditing.value = action.value;
        break;
      case "setCurrentRelativeId":
        relativesStore.currentRelativeId = action.value;
        break;
      case "setShowOneMore":
        showOneMoreRelative.value = action.value;
        break;
      case "resetForm":
        resetForm({ values: action.values });
        break;
      case "addOneMore":
        addOneMoreRelatives();
        break;
      case "setInitialized":
        isInitialized.value = action.value;
        break;
    }
  });
};

/**
 * Форматирует отображаемое имя родственника (Имя + Фамилия).
 * Не используется в текущем шаблоне для сохранения раздельной стилизации, но доступна для использования.
 * @param {Object} relative - Объект родственника.
 * @returns {string} Отформартированное полное имя.
 */
const formatRelativeName = (relative) => {
  return relativeEntity.formatDisplayName(relative);
};

/**
 * Вычисляет корректный ключ для элемента списка родственников (для использования в `v-for`).
 * @param {Object} item - Объект родственника.
 * @param {string} section - Наименование секции ('before' или 'after'), где находится элемент.
 * @param {number} index - Индекс элемента внутри его секции.
 * @returns {string|number} Уникальный ключ для элемента.
 */
const getItemIndex = (item, section, index) => {
  return $services.relatives.calculateItemIndex(
    item,
    relativeSections.value.before,
    index,
    section,
  );
};

/**
 * Обрабатывает клик по кнопке добавления/сохранения родственника.
 * Вызывает сервис для валидации и добавления/обновления данных.
 * @async
 * @returns {Promise<void>}
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

  const { actions, shouldContinue } =
    $services.relatives.handleActionResult(result);
  if (!shouldContinue) return;

  executeActions(actions);
};

/**
 * Добавляет нового пустого родственника и переключает форму на его редактирование.
 * @async
 * @returns {Promise<void>}
 */
const addOneMoreRelatives = async () => {
  const result = $services.relatives.addNewRelative(
    relativesStore.relatives,
    relativesConstants.MAX_QUANTITY_RELATIVES,
  );

  if (!result.success) {
    return;
  }

  const actions = [
    { type: "setCurrentRelativeId", value: result.newIndex },
    { type: "setShowOneMore", value: true },
    { type: "resetForm", values: $services.relatives.getEmptyFormValues() },
    { type: "setEditing", value: true },
  ];

  executeActions(actions);
};

/**
 * Переключает режим редактирования на выбранного родственника.
 * @async
 * @param {string|number} index - ID или индекс родственника для редактирования.
 * @returns {Promise<void>}
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
    const { actions } = $services.relatives.handleActionResult(result);
    executeActions(actions);
    if (result.shouldOpenEditing) {
      toggleEditing(true);
    }
  }
};

/**
 * Устанавливает данные формы для несохраненного родственника (родственника без ID).
 * @param {number} index - Индекс несохраненного родственника в массиве.
 * @param {Object} relative - Объект несохраненного родственника.
 */
function setFormToUnsavedRelative(index, relative) {
  const result = $services.relatives.prepareUnsavedRelativeData(
    index,
    relative,
  );

  const actions = [
    { type: "setCurrentRelativeId", value: result.currentRelativeId },
    { type: "resetForm", values: result.formValues },
  ];

  if (result.shouldOpenEditing) {
    actions.push({ type: "setEditing", value: true });
  }

  executeActions(actions);
}

/**
 * Проверяет наличие несохраненного родственника и, если он есть, переключает форму на его редактирование.
 * В противном случае, добавляет нового пустого родственника.
 */
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
 * Сохраняет данные текущего активного родственника в хранилище Pinia.
 * Вызывает сервис для валидации и сохранения.
 * @async
 * @param {string|number} activeIndex - ID или индекс активного родственника для сохранения.
 * @returns {Promise<void>}
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

  const { actions, shouldContinue } =
    $services.relatives.handleActionResult(result);
  if (!shouldContinue) return;

  executeActions(actions);
};

/**
 * Удаляет родственника по указанному ID или индексу.
 * Вызывает сервис для удаления и обработки состояния после удаления.
 * @async
 * @param {string|number} index - ID или индекс родственника для удаления.
 * @returns {Promise<void>}
 */
const deleteRelative = async (index) => {
  const result = $services.relatives.handleRelativeDeletion({
    relatives: relativesStore.relatives,
    tempRelatives,
    index,
    getTempRelative,
    addOneMoreRelatives,
  });

  const { actions, shouldContinue } =
    $services.relatives.handleDeletionResult(result);
  if (!shouldContinue) return;

  executeActions(actions);
};

/**
 * Получает отображаемое имя типа родственника по его ID.
 * @param {number} relativeTypeId - ID типа родственника.
 * @returns {string|undefined} Имя типа родственника или undefined, если тип не найден.
 */
const setRelativeTypeById = (relativeTypeId) => {
  return $services.relatives.getRelativeTypeById(
    relativesStore?.relativesTypes,
    relativeTypeId,
  );
};

/**
 * Эмитирует событие `close`, сигнализируя родительскому компоненту о необходимости закрыться.
 */
const close = () => {
  emit("close");
};

/**
 * Watcher для отслеживания изменений пропса `actionType`.
 * При изменении `actionType` выполняет полную реинициализацию состояния компонента,
 * включая сброс хранилища Pinia, очистку временного кэша и обработку новых данных.
 * Использует `immediate: true` для запуска при монтировании и `deep: true` для отслеживания вложенных изменений.
 * @param {ActionTypeProp} newActionType - Новое значение пропса `actionType`.
 */
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

    const { actions } = $services.relatives.handleInitializationResult(
      result,
      getTempRelative,
    );
    executeActions(actions);
  },
  { immediate: true, deep: true },
);

/**
 * Watcher для отслеживания изменения длины массива родственников в хранилище Pinia.
 * Если массив родственников становится пустым и компонент уже был инициализирован,
 * автоматически добавляет нового пустого родственника для редактирования.
 * @param {number} newLength - Новая длина массива `relativesStore.relatives`.
 */
watch(
  () => relativesStore.relatives.length,
  (newLength) => {
    if (newLength === 0 && isInitialized.value) {
      addOneMoreRelatives();
    }
  },
);

/**
 * Lifecycle hook, вызываемый после монтирования компонента.
 * Проверяет, нужно ли инициализировать компонент добавлением первого пустого родственника,
 * если это не было сделано watcher-ом `actionType` (например, при type: 'add' без pre-loaded данных).
 * @async
 */
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

/**
 * Вычисляемое свойство для работы с маскированным телефонным номером.
 * Обеспечивает двустороннюю привязку (v-model) к полю ввода телефона,
 * автоматически применяя и удаляя маску.
 * @type {ComputedRef<string>}
 * @property {function} get - Возвращает маскированный номер телефона для отображения.
 * @property {function} set - Принимает маскированное значение, удаляет маску и сохраняет чистое значение.
 */
const maskedTelephone = computed({
  get() {
    return maskPhone(currentTempRelative.value?.telephone || "");
  },
  set(val) {
    if (currentTempRelative.value) {
      currentTempRelative.value.telephone = unmaskPhone(val);
      // Можно добавить валидацию: relativeEntity.isValidTelephone(unmaskPhone(val))
    }
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
            :key="relativeEntity.createRelativeKey(item, index, 'before')"
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
                  @click="changeEdit(getItemIndex(item, 'before', index))"
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
            :key="relativeEntity.createRelativeKey(item, index, 'after')"
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
                  @click="changeEdit(getItemIndex(item, 'after', index))"
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
