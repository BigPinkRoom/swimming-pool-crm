/** * @component AddGroupClient * @description Компонент для добавления и
редактирования группы клиентов * @vue-prop {String} actionType - Тип действия
(добавление/редактирование) * @vue-prop {Boolean} closeButton - Флаг отображения
кнопки закрытия */
<script setup>
import { reactive, ref, computed, nextTick } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

import Cleave from "cleave.js";
import { uuid } from "vue-uuid";

import { useClientsStore } from "@/stores/clientStore";
import Clients from "@/services/modules/clients";

const clientsService = new Clients();
const { formatDate } = clientsService;

import AbonementEntity from "@/entities/abonementEntity";

const { createFamilyModelResponse } = new AbonementEntity();

import vRadioButton from "@/components/ui/RadioButtons/mainRadioButton";
import vCloseButton from "@/components/ui/Buttons/ButtonClose.vue";
import CardTable from "@/components/Common/CardTable.vue";

import { calculateAge } from "@/helpers/calculateAge";
import ClientEntity from "@/entities/clientEntity";

import { clientAddValidationSchema } from "@/schemas/zod/clientSchemas";

import { clientsConstants } from "@/constants/clients";

const { $services } = useNuxtApp();
const { $i18n } = useNuxtApp();
const t = $i18n.t;
const clientsStore = useClientsStore();
const { checkValuesForValidateReset } = new ClientEntity();

const validationSchema = toTypedSchema(clientAddValidationSchema(t));

const props = defineProps({
  actionType: { type: Object },
  closeButton: { type: Boolean },
});

/**
 * @type {Object} Форма с валидацией
 */
const { errors, values, meta, validate, resetForm } = useForm({
  validationSchema,
  initialValues: {
    name: "",
    surname: "",
    patronymic: "",
    birthday: "",
    gender: 0,
  },
});

/**
 * @type {Array} Данные для радио-кнопок выбора пола
 */
const inputData = reactive([
  { id: 0, value: 0, label: "Мальчик" },
  { id: 1, value: 1, label: "Девочка" },
]);

/**
 * @type {Object} Временное хранилище данных клиентов
 */
const tempClients = reactive({});
const uuidV4 = uuid.v4();
const showOneMoreClient = ref(true);
const birthdayDate = ref(null);
const isEditing = ref(true);
const clientAddToStoreLoading = ref(false);

defineEmits(["close"]);

/**
 * @computed
 * @returns {String} Текст для кнопки добавления клиента
 */
const addClientText = computed(() => {
  const checkClientLessMax =
    clientsStore.clients.length < clientsConstants.MAX_QUANTITY_CLIENTS;
  const checkClientEqualMax =
    clientsStore.clients.length >= clientsConstants.MAX_QUANTITY_CLIENTS;

  if (checkClientLessMax) {
    return "+ Добавить ещё одного ребёнка";
  } else if (checkClientEqualMax) {
    return "Максимальное количество детей";
  } else {
    return "+ Добавить ребёнка";
  }
});

/**
 * @computed
 * @returns {Object} Секции клиентов
 */
const clientSections = computed(() =>
  $services.clients.getClientsSections(
    clientsStore.clients,
    clientsStore.currentClientId
  )
);

/**
 * @computed
 * @returns {Object} Текущий временный клиент
 */
const currentTempClient = computed(() =>
  getTempClient(clientsStore.currentClientId)
);

/**
 * Переключает режим редактирования
 * @param {Boolean} value - Новое значение режима редактирования
 */
const toggleEditing = async (value) => {
  if (value === true) {
    await nextTick();
    addInputMask();
  }
  isEditing.value = value;
};

const setEditClient = () => {
  clientsStore.reset();

  if (props.actionType?.type === "edit" && props.actionType.family?.clients) {
    const clients = props.actionType.family.clients;
    Object.keys(tempClients).forEach((key) => delete tempClients[key]);

    clients.forEach((client, index) => {
      const clientForStore = {
        name: client.clientName || "",
        surname: client.clientSurname || "",
        gender: client.clientGender || 0,
        birthday: formatDate(client.clientBirthday) || "",
        patronymic: client.clientPatronymic || "",
      };

      // Добавляем ID только если он пришел из БД (т.е. клиент существует)
      if (client.clientId) {
        clientForStore.id = client.clientId;
      }

      clientsStore.setClientOfEdit(clientForStore);
      tempClients[index + 1] = { ...clientForStore };
    });

    if (clients.length > 0) {
      clientsStore.currentClientId = 1;
      toggleEditing(true);
      resetForm({ values: { ...tempClients[1] } });
    }
  }
};

/**
 * Добавляет маску ввода для поля даты рождения
 */
const addInputMask = async () => {
  if (birthdayDate.value?.$el) {
    const inputElement = birthdayDate.value.$el.querySelector("input");
    if (inputElement) {
      if (inputElement._cleave) {
        inputElement._cleave.destroy();
      }
      new Cleave(inputElement, {
        date: true,
        delimiter: ".",
        datePattern: ["d", "m", "Y"],
        blocks: [2, 2, 4],
        numericOnly: true,
        dateMax: "31.12.2100",
        max: "31122100",
      });
    }
  }
};

/**
 * Получает или создает временного клиента
 * @param {number} index - Индекс клиента (начиная с 1)
 * @returns {Object} Данные клиента
 */
const getTempClient = (index) => {
  if (!tempClients[index]) {
    tempClients[index] = {
      name: "",
      surname: "",
      patronymic: "",
      birthday: "",
      gender: 0,
    };
  }
  return tempClients[index];
};

/**
 * Изменяет режим редактирования для клиента
 * @param {number} index - Индекс клиента (начиная с 1)
 */
const changeEdit = async (index) => {
  clientsStore.currentClientId = index;
  toggleEditing(true);

  // Первым получаем currentTempClient после установки clientsStore.currentClientId
  const tempClient = currentTempClient;

  if (checkValuesForValidateReset(tempClient)) {
    resetForm();
  } else {
    validate();
  }

  await nextTick();
  addInputMask();
};

/**
 * Добавляет нового клиента
 */
const addOneMoreClients = async () => {
  if ($services.clients.isMaxClientsLimitReached(clientsStore.clients)) return;

  const newIndex = clientsStore.addEmpty();
  clientsStore.currentClientId = newIndex;
  showOneMoreClient.value = true;

  resetForm({
    values: {
      name: "",
      surname: "",
      patronymic: "",
      birthday: "",
      gender: 0,
    },
  });

  await nextTick();
  addInputMask();
};

/**
 * Возвращает путь к изображению в зависимости от пола
 * @param {Number} gender - Пол клиента (0 - мальчик, 1 - девочка)
 * @returns {String} Путь к изображению
 */
const getGenderImage = (gender) => {
  switch (gender) {
    case 1:
      return "/icons/girl.svg";
    case 0:
      return "/icons/boy.svg";
    default:
      return "";
  }
};

/**
 * Добавляет клиента в хранилище
 * @param {number} activeIndex - Индекс активного клиента (начиная с 1)
 */
const addClientToStore = async (activeIndex) => {
  try {
    const resultValidate = await validate();
    if (resultValidate.valid) {
      // Явно получаем значение из computed свойства
      const tempClient = { ...currentTempClient.value };
      clientsStore.updateActiveClient(activeIndex, tempClient);
      showClientAddToStoreLoading();
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Показывает индикатор загрузки при добавлении клиента
 */
const showClientAddToStoreLoading = () => {
  clientAddToStoreLoading.value = true;
  setTimeout(() => {
    clientAddToStoreLoading.value = false;
    addOneMoreClients();
  }, 1000);
};

/**
 * Закрывает модальное окно
 */
const close = () => {
  $emit("close");
};

/**
 * Удаляет клиента и активирует следующего
 * @param {number} index - Индекс клиента для удаления (начиная с 1)
 */
const deleteClient = async (index) => {
  clientsStore.deleteClient(index);
  delete tempClients[index];

  if (clientsStore.clients.length > 0) {
    clientsStore.currentClientId = 1;
    await nextTick();
    resetForm({ values: getTempClient(1) });
    toggleEditing(true);
  }
};

watch(
  () => props.actionType.family,
  () => {
    if (props.actionType.type === "edit") {
      setEditClient();
    } else {
      clientsStore.reset();
    }
  }
);
</script>

<template>
  <fieldset class="client-main__fieldset">
    <card-table class="card-table__wrapper--gray">
      <template #title>
        <legend class="card-table__title card-table__title--gray">
          {{ $t(`forms.client.add.fieldsets.client.label`) }}
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
              class="card-table__table-title-td card-table__table-title--age card-table__table-title-td--gray"
            >
              Возраст
            </div>
            <div
              class="card-table__table-title-td card-table__table-title--gender card-table__table-title-td--gray"
            >
              Пол
            </div>
            <div
              class="card-table__table-title-td card-table__table-title--actions card-table__table-title-td--gray"
            >
              Действия
            </div>
          </div>
          <div
            class="card-table__table-tr"
            v-for="(item, index) in clientSections.before"
            :key="index"
          >
            <div class="card-table__table-td card-table--name">
              {{ item.name }}
              <span class="card-table__name--surname">{{ item.surname }}</span>
            </div>
            <div class="card-table__table-td card-table--age">
              {{ calculateAge(item.birthday) }}
            </div>
            <div class="card-table__table-td card-table--gender">
              <img :src="getGenderImage(item.gender)" alt="" />
            </div>
            <div class="card-table__table-td card-table--actions">
              <div class="card-table__actions">
                <img
                  class="card-table__actions--edit"
                  src="/icons/edit.svg"
                  @click="changeEdit(index + 1)"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div class="card-table__table-tr" v-if="clientSections.active">
            <div v-if="!isEditing" class="card-table__table-tr">
              <div class="card-table__table-td card-table--name">
                {{ clientSections.active.name }}
                <span class="card-table__name--surname">{{
                  clientSections.active.surname
                }}</span>
              </div>
              <div class="card-table__table-td card-table--age">
                {{ calculateAge(clientSections.active.birthday) }}
              </div>
              <div class="card-table__table-td card-table--gender">
                <img
                  :src="getGenderImage(clientSections.active.gender)"
                  alt=""
                />
              </div>
              <div class="card-table__table-td card-table--actions">
                <div class="card-table__actions">
                  <img
                    class="card-table__actions--edit"
                    src="/icons/edit.svg"
                    @click="changeEdit(clientsStore.currentClientId)"
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
                v-if="clientAddToStoreLoading"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <!-- Путь, описывающий периметр -->
                <path d="M 0 0 H 100 V 100 H 0 V 0 Z" />
              </svg>
              <div class="card-table__name-title">
                {{ clientSections.active.name }}
                <div class="card-table__name-title--surname">
                  {{ clientSections.active.surname }}
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
                  @click="addClientToStore(clientsStore.currentClientId)"
                />
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`clientSurname_${uuidV4}`"
                  type="text"
                  :title="
                    $t(`forms.client.add.fieldsets.client.fields.surname.label`)
                  "
                  name="surname"
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.surname"
                  v-model="currentTempClient.surname"
                ></ui-fields-input>
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`clientName_${uuidV4}`"
                  type="text"
                  :title="
                    $t(`forms.client.add.fieldsets.client.fields.name.label`)
                  "
                  name="name"
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.name"
                  v-model="currentTempClient.name"
                ></ui-fields-input>
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`clientPatronymic_${uuidV4}`"
                  type="text"
                  :title="
                    $t(
                      `forms.client.add.fieldsets.client.fields.patronymic.label`
                    )
                  "
                  name="patronymic"
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.patronymic"
                  v-model="currentTempClient.patronymic"
                ></ui-fields-input>
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`clientBirthday_${uuidV4}`"
                  type="text"
                  :title="
                    $t(
                      `forms.client.add.fieldsets.client.fields.birthday.label`
                    )
                  "
                  name="birthday"
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.birthday"
                  ref="birthdayDate"
                  v-model="currentTempClient.birthday"
                  :maxlength="clientsConstants.MAX_FIELD_BIRTHDAY_NUMBERS"
                ></ui-fields-input>
              </div>
              <v-radio-button
                name="genderType"
                :input-data="inputData"
                class="card-table__radio"
                v-model="currentTempClient.gender"
              />
              <div
                class="card-table__delete"
                @click="deleteClient(clientsStore.currentClientId)"
              >
                <div class="card-table__delete-text">Удалить</div>
                <img
                  src="/icons/delete_icon.svg"
                  alt=""
                  class="card-table__delete-img"
                />
                {{ clientSections.active.id }}
              </div>
            </div>
          </div>
          <div
            class="card-table__table-tr"
            v-for="(item, index) in clientSections.after"
            :key="index"
          >
            <div class="card-table__table-td card-table--name">
              {{ item.name }}
              <span class="card-table__name--surname">{{ item.surname }}</span>
            </div>
            <div class="card-table__table-td card-table--age">
              {{ calculateAge(item.birthday) }}
            </div>
            <div class="card-table__table-td card-table--gender">
              <img :src="getGenderImage(item.gender)" alt="" />
            </div>
            <div class="card-table__table-td card-table--actions">
              <div class="card-table__actions">
                <img
                  class="card-table__actions--edit"
                  src="/icons/edit.svg"
                  @click="
                    changeEdit(clientSections.before.length + 1 + index + 1)
                  "
                  alt=""
                />
              </div>
            </div>
          </div>
          <tr class="card-table__tr-add" v-if="showOneMoreClient">
            <div class="card-table__add">
              <button
                class="card-table__button card-table__button--add"
                @click.prevent="addOneMoreClients"
                :disabled="
                  $services.clients.isMaxClientsLimitReached(
                    clientsStore.clients
                  )
                "
              >
                {{ addClientText }}
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
