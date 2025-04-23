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
const relativeAddToStoreLoading = ref(false);
const isInitialized = ref(false); // Флаг для отслеживания инициализации компонента

defineEmits(["close"]);

// Загрузка типов родственников при инициализации компонента
const { data: relativeTypesData } = await useAsyncData(
  "relativeTypes",
  async () => {
    const relativeTypesData = await $services.relatives.getTypes();
    return relativeTypesData;
  }
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
    relativesStore.currentRelativeId
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
  const checkRelativeLessMax =
    relativesStore.relatives.length < relativesConstants.MAX_QUANTITY_RELATIVES;
  const checkRelativeEqualMax =
    relativesStore.relatives.length >=
    relativesConstants.MAX_QUANTITY_RELATIVES;

  console.log("relativesStore.relatives )))))))", relativesStore.relatives);

  if (checkRelativeLessMax) {
    return "+ Добавить ещё одного родственника";
  } else if (checkRelativeEqualMax) {
    return "Максимальное количество родственников";
  } else {
    return "+ Добавить родственника";
  }
});

/**
 * Получает временные данные родственника по индексу
 * @param {number} indexOrId - Индекс родственника (начиная с 1) или ID
 * @returns {Object} Данные родственника
 */
const getTempRelative = (indexOrId) => {
  // Используем индекс или ID как ключ для tempRelatives
  if (!tempRelatives[indexOrId]) {
    tempRelatives[indexOrId] = {
      name: "",
      surname: "",
      patronymic: "",
      relativeTypeId: 1,
      telephone: "",
    };
  }
  return tempRelatives[indexOrId];
};

/**
 * Добавляет маску для ввода телефона
 */
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

/**
 * Переключает режим редактирования
 */
const toggleEditing = async (value) => {
  if (value === true) {
    await nextTick();
    addInputMask();
  }
  isEditing.value = value;
};

/**
 * Добавляет нового родственника
 */
const handleAddRelativeButtonClick = async () => {
  // Если достигнут предел родственников, не добавляем новых
  if ($services.relatives.isMaxRelativesLimitReached(relativesStore.relatives))
    return;
  // Если есть активный родственник, сначала проверяем валидацию
  if (relativeSections.value.active && isEditing.value) {
    const validationResult = await validate();

    if (!validationResult.valid) {
      // Если валидация не прошла, останавливаем добавление нового родственника
      console.log("Валидация не прошла, прерываем добавление");
      return;
    }

    // Если валидация успешна, сохраняем текущего родственника
    console.log("Обновляем активного родственника");
    relativesStore.updateActiveRelative(
      relativeSections.value.active.id || relativesStore.currentRelativeId,
      currentTempRelative
    );
  }

  // Принудительно закрываем любое текущее редактирование
  isEditing.value = false;

  // Добавляем нового родственника
  console.log("Создаем нового родственника");

  // Если несохраненного родственника нет, создаем нового
  const newRelative = {
    name: "",
    surname: "",
    patronymic: "",
    relativeTypeId: 1,
    telephone: "",
  };

  // Добавляем нового родственника напрямую в массив
  relativesStore.relatives.push(newRelative);

  // Устанавливаем новый относительный индекс
  const tempIndex = relativesStore.relatives.length;
  console.log("Создан новый родственник с индексом:", tempIndex);
  relativesStore.currentRelativeId = tempIndex;
  showOneMoreRelative.value = true;

  resetForm({
    values: {
      name: "",
      surname: "",
      patronymic: "",
      relativeTypeId: 1,
      telephone: "",
    },
  });

  // Обновляем DOM перед применением маски
  isEditing.value = true;
  await nextTick();
  addInputMask();
  console.log("handleAddRelativeButtonClick - завершено");
};

/**
 * Добавляет нового родственника
 */
const addOneMoreRelatives = async () => {
  // Если достигнут предел родственников, не добавляем новых
  if ($services.relatives.isMaxRelativesLimitReached(relativesStore.relatives))
    return;

  // Создаем нового родственника
  const newRelative = {
    name: "",
    surname: "",
    patronymic: "",
    relativeTypeId: 1,
    telephone: "",
  };

  // Добавляем нового родственника напрямую в массив
  relativesStore.relatives.push(newRelative);

  // Флаг для отслеживания, редактируем ли мы существующего родственника
  const isEditingExistingRelative = ref(false);

  // Проверяем, редактируем ли мы существующего родственника
  isEditingExistingRelative.value = relativesStore.relatives.some(
    (relative) => relative.id === relativesStore.currentRelativeId
  );

  console.log(
    "isEditingExistingRelative.value 0--------------------------------------------",
    isEditingExistingRelative.value
  );

  if (isEditingExistingRelative.value) {
  }

  // Устанавливаем новый относительный индекс
  const tempIndex = relativesStore.relatives.length;
  console.log("Создан новый родственник с индексом:", tempIndex);
  relativesStore.currentRelativeId = tempIndex;
  showOneMoreRelative.value = true;

  resetForm({
    values: {
      name: "",
      surname: "",
      patronymic: "",
      relativeTypeId: 1,
      telephone: "",
    },
  });

  // Обновляем DOM перед применением маски
  isEditing.value = true;
  await nextTick();
  addInputMask();
  console.log("addOneMoreRelatives - завершено");
};

/**
 * Изменяет режим редактирования для родственника
 */
const changeEdit = async (index) => {
  // Если мы уже в режиме редактирования, сначала сохраняем текущего родственника
  if (isEditing.value) {
    const currentRelative = { ...currentTempRelative.value };
    relativesStore.updateActiveRelative(
      relativesStore.currentRelativeId,
      currentRelative
    );
    tempRelatives[relativesStore.currentRelativeId] = { ...currentRelative };
  }

  relativesStore.currentRelativeId = index;
  toggleEditing(true);

  // Обновляем данные формы на основе выбранного родственника
  const relativeData = getTempRelative(index);
  resetForm({
    values: {
      name: relativeData.name || "",
      surname: relativeData.surname || "",
      patronymic: relativeData.patronymic || "",
      relativeTypeId: relativeData.relativeTypeId || 1,
      telephone: relativeData.telephone || "",
    },
  });

  await nextTick();
  addInputMask();
};

/**
 * Показывает индикатор загрузки при добавлении родственника
 */
const showRelativeAddToStoreLoading = () => {
  relativeAddToStoreLoading.value = true;
  setTimeout(() => {
    relativeAddToStoreLoading.value = false;

    // Проверяем наличие несохраненного родственника (без id)
    const unsavedRelative = relativesStore.relatives.find(
      (relative) => !relative.id
    );

    // Если уже есть новый несохраненный родственник, переключаемся на него
    if (unsavedRelative) {
      const newRelativeIndex = relativesStore.relatives.findIndex(
        (relative) => !relative.id
      );

      // Индекс относительный (начиная с 1)
      const relativePosition = newRelativeIndex + 1;

      // Переключаемся на этого родственника
      relativesStore.currentRelativeId = relativePosition;

      // Устанавливаем данные формы
      resetForm({
        values: {
          name: unsavedRelative.name || "",
          surname: unsavedRelative.surname || "",
          patronymic: unsavedRelative.patronymic || "",
          relativeTypeId: unsavedRelative.relativeTypeId || 1,
          telephone: unsavedRelative.telephone || "",
        },
      });

      // Активируем режим редактирования
      isEditing.value = true;
      nextTick().then(() => {
        addInputMask();
      });
    } else {
      // Если нет несохраненного родственника, добавляем нового
      addOneMoreRelatives();
    }
  }, 1000);
};

/**
 * Добавляет родственника в хранилище
 */
const addRelativeToStore = async (activeIndex) => {
  try {
    // Проверка, что у нас есть активный родственник
    if (!relativeSections.value.active) {
      console.error("Нет активного родственника для обновления");
      return;
    }

    const resultValidate = await validate();
    if (resultValidate.valid) {
      relativesStore.updateActiveRelative(activeIndex, currentTempRelative);

      // Проверяем наличие несохраненного родственника (без id)
      // Исключаем текущего родственника из проверки
      const unsavedRelative = relativesStore.relatives.find(
        (relative, index) => !relative.id && index + 1 !== activeIndex
      );

      if (unsavedRelative) {
        // Если уже есть другой несохраненный родственник, переключаемся на него
        const newRelativeIndex = relativesStore.relatives.findIndex(
          (relative, index) => !relative.id && index + 1 !== activeIndex
        );

        // Индекс относительный (начиная с 1)
        const relativePosition = newRelativeIndex + 1;

        // Переключаемся на этого родственника
        relativesStore.currentRelativeId = relativePosition;

        // Устанавливаем данные формы
        resetForm({
          values: {
            name: unsavedRelative.name || "",
            surname: unsavedRelative.surname || "",
            patronymic: unsavedRelative.patronymic || "",
            relativeTypeId: unsavedRelative.relativeTypeId || 1,
            telephone: unsavedRelative.telephone || "",
          },
        });

        // Активируем режим редактирования
        isEditing.value = true;
        await nextTick();
        addInputMask();
      } else {
        // Иначе скрываем режим редактирования и создаем анимацию загрузки
        isEditing.value = false;
        showRelativeAddToStoreLoading();
      }
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Удаляет родственника
 */
const deleteRelative = async (index) => {
  console.log("Удаление родственника с индексом/id:", index);
  console.log(
    "Список родственников до удаления:",
    JSON.stringify(relativesStore.relatives)
  );

  // Проверяем, существует ли родственник перед удалением
  const relativeIndex = $services.relatives.findRelativeIndexById(
    relativesStore.relatives,
    index
  );

  if (relativeIndex === -1) {
    console.error(
      "Не удалось найти родственника для удаления с индексом/id:",
      index
    );
    return;
  }

  console.log("Найденный индекс родственника в массиве:", relativeIndex);

  // Удаляем родственника напрямую из массива, минуя хранилище
  relativesStore.relatives.splice(relativeIndex, 1);

  // Очищаем временные данные
  delete tempRelatives[index];

  console.log(
    "Список родственников после удаления:",
    JSON.stringify(relativesStore.relatives)
  );

  // Проверяем наличие несохраненного родственника (без id)
  const unsavedRelative = relativesStore.relatives.find(
    (relative) => !relative.id
  );

  // Если после удаления еще остались родственники
  if (relativesStore.relatives.length > 0) {
    if (unsavedRelative) {
      // Если есть несохраненный родственник, переключаемся на него
      const newRelativeIndex = relativesStore.relatives.findIndex(
        (relative) => !relative.id
      );

      // Индекс относительный (начиная с 1)
      const relativePosition = newRelativeIndex + 1;

      // Переключаемся на этого родственника
      relativesStore.currentRelativeId = relativePosition;

      // Устанавливаем данные формы
      resetForm({
        values: {
          name: unsavedRelative.name || "",
          surname: unsavedRelative.surname || "",
          patronymic: unsavedRelative.patronymic || "",
          relativeTypeId: unsavedRelative.relativeTypeId || 1,
          telephone: unsavedRelative.telephone || "",
        },
      });

      toggleEditing(true); // Открываем форму редактирования
    } else {
      // Иначе устанавливаем текущим родственником первого в списке
      relativesStore.currentRelativeId = relativesStore.relatives[0].id || 1;
      resetForm({ values: getTempRelative(relativesStore.currentRelativeId) });
      toggleEditing(false); // Закрываем форму редактирования
    }

    await nextTick();
    addInputMask();
  } else {
    // Если больше нет родственников, автоматически открываем форму для добавления
    addOneMoreRelatives();
  }
};

/**
 * Получает тип родственника по ID
 */
const setRelativeTypeById = (relativeId) => {
  const relativeType = relativesStore.relativesTypes.find(
    (type) => type.value === relativeId
  );
  return relativeType?.text;
};

/**
 * Устанавливает данные для редактирования
 */
const setEditRelative = () => {
  relativesStore.reset();

  if (props.actionType?.type === "edit" && props.actionType.family?.relatives) {
    const relatives = props.actionType.family.relatives;

    // Проверяем, есть ли вообще родственники в массиве
    if (!relatives || relatives.length === 0) {
      // Если родственников нет, автоматически открываем форму для добавления
      addOneMoreRelatives();
      return;
    }

    Object.keys(tempRelatives).forEach((key) => delete tempRelatives[key]);

    relatives.forEach((relative, index) => {
      // Убедимся, что объект relative не undefined и не null
      if (!relative) return;

      const relativeForStore = {
        name: relative.relativeName || "",
        surname: relative.relativeSurname || "",
        patronymic: relative.relativePatronymic || "",
        relativeTypeId: relative.relativeTypeId || 1,
        telephone: relative.relativeTelephone || "",
      };

      // Если это существующий родственник из БД, добавляем его id
      if (relative.relativeId) {
        relativeForStore.id = relative.relativeId;
      }

      relativesStore.setRelativeOfEdit(relativeForStore);
      tempRelatives[index + 1] = { ...relativeForStore };
    });

    if (relatives.length > 0) {
      relativesStore.currentRelativeId = 1;
      // Скрываем режим редактирования только если есть родственники
      toggleEditing(false);
      resetForm({ values: { ...tempRelatives[1] } });
    }
  } else if (props.actionType?.type === "add") {
    // Если это добавление нового клиента, автоматически открываем форму
    addOneMoreRelatives();
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
  () => props.actionType?.family,
  () => {
    if (props.actionType?.type === "edit") {
      setEditRelative();
    } else {
      relativesStore.reset();

      // Проверяем наличие несохраненного родственника (без id)
      const unsavedRelative = relativesStore.relatives.find(
        (relative) => !relative.id
      );

      // Если уже есть новый несохраненный родственник, переключаемся на него
      if (unsavedRelative) {
        const newRelativeIndex = relativesStore.relatives.findIndex(
          (relative) => !relative.id
        );

        // Индекс относительный (начиная с 1)
        const relativePosition = newRelativeIndex + 1;

        // Переключаемся на этого родственника
        relativesStore.currentRelativeId = relativePosition;

        // Устанавливаем данные формы
        resetForm({
          values: {
            name: unsavedRelative.name || "",
            surname: unsavedRelative.surname || "",
            patronymic: unsavedRelative.patronymic || "",
            relativeTypeId: unsavedRelative.relativeTypeId || 1,
            telephone: unsavedRelative.telephone || "",
          },
        });

        // Активируем режим редактирования
        isEditing.value = true;
        nextTick().then(() => {
          addInputMask();
        });
      } else {
        // Если нет несохраненного родственника, добавляем нового
        addOneMoreRelatives();
      }
    }
  },
  { immediate: true } // Запускаем watcher сразу при создании компонента
);

// Отслеживаем изменения в списке родственников
watch(
  () => relativesStore.relatives.length,
  (newLength) => {
    // Если список стал пуст и компонент уже инициализирован, открываем форму
    if (newLength === 0 && isInitialized.value) {
      addOneMoreRelatives();
    }
  }
);

// Инициализация компонента
onMounted(async () => {
  isInitialized.value = true;

  // Если родственники заданы в props, используем setEditRelative
  if (props.actionType?.family?.relatives) {
    setEditRelative();
  } else if (relativesStore.relatives.length === 0) {
    // Если родственников нет, добавляем пустого родственника
    addOneMoreRelatives();
  } else {
    // Если родственники уже есть в store, но не из props
    // Проверяем наличие несохраненного родственника (без id)
    const unsavedRelative = relativesStore.relatives.find(
      (relative) => !relative.id
    );

    // Если уже есть новый несохраненный родственник, переключаемся на него
    if (unsavedRelative) {
      const newRelativeIndex = relativesStore.relatives.findIndex(
        (relative) => !relative.id
      );

      // Индекс относительный (начиная с 1)
      const relativePosition = newRelativeIndex + 1;

      // Переключаемся на этого родственника
      relativesStore.currentRelativeId = relativePosition;

      // Устанавливаем данные формы
      resetForm({
        values: {
          name: unsavedRelative.name || "",
          surname: unsavedRelative.surname || "",
          patronymic: unsavedRelative.patronymic || "",
          relativeTypeId: unsavedRelative.relativeTypeId || 1,
          telephone: unsavedRelative.telephone || "",
        },
      });

      // Активируем режим редактирования
      isEditing.value = true;
    } else {
      // Иначе выбираем первого родственника
      relativesStore.currentRelativeId = relativesStore.relatives[0].id || 1;
      resetForm({ values: getTempRelative(relativesStore.currentRelativeId) });
      isEditing.value = false;
    }
  }

  await nextTick();
  if (isEditing.value) {
    addInputMask();
  }
});
</script>

<template>
  <fieldset class="client-main__fieldset">
    <CardTable class="card-table__wrapper--gray">
      <template #title>
        <legend class="card-table__title card-table__title--gray">
          {{ $t(`forms.client.${actionType.type}.fieldsets.relatives.label`) }}
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
            v-for="(item, index) in relativeSections.before"
            :key="item.id || 'before-' + (index + 1)"
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
                  @click="
                    changeEdit(
                      item.id || relativeSections.before.indexOf(item) + 1
                    )
                  "
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
                    @click="
                      changeEdit(
                        relativeSections.active.id ||
                          relativesStore.currentRelativeId
                      )
                    "
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
                  @click="
                    addRelativeToStore(
                      relativeSections.active.id ||
                        relativesStore.currentRelativeId
                    )
                  "
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
                  v-model="currentTempRelative.relativeTypeId"
                ></ui-selects-select>
              </div>
              <div class="card-table__field card-table__field--telephone">
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
                @click="
                  deleteRelative(
                    relativeSections.active.id ||
                      relativesStore.currentRelativeId
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
              {{
                relativeSections.active.id || relativesStore.currentRelativeId
              }}
            </div>
          </div>
          <div
            class="card-table__table-tr"
            v-for="(item, index) in relativeSections.after"
            :key="item.id || 'after-' + (index + 1)"
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
                  @click="
                    changeEdit(
                      item.id || relativeSections.before.length + 1 + index + 1
                    )
                  "
                  alt=""
                />
              </div>
            </div>
          </div>
          <tr class="card-table__tr-add" v-if="showOneMoreRelative">
            <div class="card-table__add">
              <button
                class="card-table__button card-table__button--add"
                @click.prevent="handleAddRelativeButtonClick"
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
      <template #footer>
        <div class="client-main__close" v-if="closeButton">
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
