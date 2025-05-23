/** * @component AddGroupClient * @description Компонент для добавления и
редактирования группы клиентов. * Позволяет управлять списком клиентов в рамках
одной сессии добавления/редактирования, * валидировать вводимые данные и
взаимодействовать с хранилищем клиентов. * * @vue-prop {Object} [actionType] -
Объект, определяющий тип действия и начальные данные. * Может содержать `{ type:
'edit', family: { clients: [...] } }` для редактирования * существующей семьи
клиентов или быть пустым для добавления новой. * @vue-prop {boolean}
[closeButton=false] - Флаг, определяющий отображение кнопки закрытия в
компоненте. */
<script setup>
import { reactive, ref, computed, nextTick, onMounted } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

import { uuid } from "vue-uuid";

import { useClientsStore } from "@/stores/clientStore";
import ClientEntity, { getClientGenderOptions } from "@/entities/clientEntity";

import vRadioButton from "@/components/ui/RadioButtons/mainRadioButton";
import vCloseButton from "@/components/ui/Buttons/ButtonClose.vue";
import CardTable from "@/components/Common/CardTable.vue";

import { calculateAge } from "@/helpers/calculateAge";

import { clientAddValidationSchema } from "@/schemas/zod/clientSchemas";

import { clientsConstants } from "@/constants/clients";

/**
 * @type {object}
 * @description Экземпляр сервисов Nuxt, предоставляющий доступ к глобальным сервисам приложения (например, `$services.clients`).
 */
const { $services } = useNuxtApp();
/**
 * @type {object}
 * @description Экземпляр плагина i18n Nuxt, предоставляющий доступ к функциям интернационализации.
 */
const { $i18n } = useNuxtApp();
/**
 * @type {Function}
 * @description Функция для перевода строк, полученная из `$i18n.t`.
 */
const t = $i18n.t;
/**
 * @type {import('@/stores/clientStore').ClientsStore}
 * @description Экземпляр хранилища клиентов Pinia.
 */
const clientsStore = useClientsStore();

/**
 * @type {ClientEntity}
 * @description Экземпляр класса ClientEntity для доступа к методам сущности клиента, например, для создания нового клиента.
 */
const clientEntityInstance = new ClientEntity();

/**
 * @type {import('@vee-validate/zod').TypedSchema}
 * @description Схема валидации Zod, преобразованная для использования с VeeValidate.
 */
const validationSchema = toTypedSchema(clientAddValidationSchema(t));

/**
 * @description Определяет принимаемые компонентом входные свойства (props).
 */
const props = defineProps({
  actionType: { type: Object },
  closeButton: { type: Boolean },
});

/**
 * @description Экземпляр VeeValidate `useForm` для управления состоянием формы, валидацией и значениями.
 * @property {object} errors - Объект с ошибками валидации для каждого поля формы.
 * @property {object} values - Реактивный объект со значениями полей формы.
 * @property {object} meta - Метаданные формы (например, `dirty`, `valid`).
 * @property {Function} validate - Функция для запуска валидации формы.
 * @property {Function} resetForm - Функция для сброса состояния формы к начальным значениям.
 */
const { errors, values, meta, validate, resetForm } = useForm({
  validationSchema,
  initialValues: clientEntityInstance.createNewClient(),
});

/**
 * @type {import('vue').ReactiveEffect<Array<{id: number, value: number, label: string}>>}
 * @description Реактивный массив данных для радио-кнопок выбора пола. Генерируется функцией `getClientGenderOptions`.
 */
const inputData = reactive(getClientGenderOptions());

/**
 * @type {import('vue').ReactiveEffect<Object<number, any>>}
 * @description Реактивный объект, служащий временным хранилищем для данных клиентов, добавляемых или редактируемых в компоненте.
 *              Ключами являются ID клиентов, значениями - объекты с данными клиента.
 */
const tempClients = reactive({});

/**
 * @type {string}
 * @description Уникальный идентификатор UUID v4, используемый для генерации уникальных ID для полей ввода в шаблоне.
 */
const uuidV4 = uuid.v4();
/**
 * @type {import('vue').Ref<boolean>}
 * @description Флаг, управляющий отображением кнопки "Добавить еще одного клиента".
 */
const showOneMoreClient = ref(true);
/**
 * @type {import('vue').Ref<HTMLInputElement|null>}
 * @description Ссылка на DOM-элемент поля ввода даты рождения, используется для применения маски ввода.
 */
const birthdayDate = ref(null);
/**
 * @type {import('vue').Ref<boolean>}
 * @description Флаг, указывающий, находится ли форма активного клиента в режиме редактирования.
 */
const isEditing = ref(true);

/**
 * @description Определяет события, которые компонент может генерировать.
 * @emits close - Событие, генерируемое при необходимости закрыть компонент (например, модальное окно).
 */
defineEmits(["close"]);

/**
 * @computed
 * @returns {String} Текст для кнопки добавления клиента
 */
const addClientText = computed(() =>
  $services.clients.getAddClientButtonText(clientsStore.clients.length),
);

/**
 * @computed
 * @returns {Object} Секции клиентов
 */
const clientSections = computed(() =>
  $services.clients.getClientsSections(
    clientsStore.clients,
    clientsStore.currentClientId,
  ),
);

/**
 * @computed
 * @returns {Object} Текущий временный клиент
 */
const currentTempClient = computed(() =>
  $services.clients.getTempClient(tempClients, clientsStore.currentClientId),
);

/**
 * Переключает режим редактирования
 * @param {Boolean} value - Новое значение режима редактирования
 */
const toggleEditing = async (value) => {
  isEditing.value = await $services.clients.toggleEditing(value, addInputMask);
};

/**
 * Добавляет маску ввода для поля даты рождения
 */
const addInputMask = async () => {
  $services.clients.addInputMask(birthdayDate.value);
};

/**
 * Изменяет режим редактирования для клиента
 * @param {number} index - Индекс клиента (начиная с 1)
 */
const changeEdit = async (index) => {
  const result = await $services.clients.changeEdit(
    clientsStore,
    tempClients,
    currentTempClient.value,
    isEditing.value,
    index,
    resetForm,
    addInputMask,
  );
  isEditing.value = result.isEditing;
};

/**
 * Добавляет нового клиента
 */
const handleAddClientButtonClick = async () => {
  const result = await $services.clients.handleAddClientButtonClick(
    clientsStore,
    tempClients,
    currentTempClient.value,
    isEditing.value,
    resetForm,
    validate,
    addInputMask,
  );
  isEditing.value = result.isEditing;
  if (result.newIndex) {
    showOneMoreClient.value = true;
  }
};

/**
 * Добавляет нового клиента
 */
const addOneMoreClients = async () => {
  await $services.clients.addOneMoreClient(
    clientsStore,
    tempClients,
    resetForm,
    addInputMask,
  );
  isEditing.value = true;
};

/**
 * Возвращает путь к изображению в зависимости от пола
 * @param {Number} gender - Пол клиента (0 - мальчик, 1 - девочка)
 * @returns {String} Путь к изображению
 */
const getGenderImage = (gender) => $services.clients.getGenderImage(gender);

/**
 * Добавляет клиента в хранилище
 * @param {number} activeIndex - Индекс активного клиента (начиная с 1)
 */
const addClientToStore = async (activeIndex) => {
  try {
    await $services.clients.addClientToStore(
      clientsStore,
      tempClients,
      currentTempClient.value,
      activeIndex,
      validate,
      toggleEditing,
      addOneMoreClients,
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Генерирует событие `close`.
 * Используется для сигнализации родительскому компоненту о необходимости закрытия
 * данного компонента (например, модального окна).
 * @emits close
 */
const close = () => {
  $emit("close");
};

/**
 * Удаляет клиента и активирует следующего
 * @param {number} index - Индекс клиента для удаления (начиная с 1)
 */
const deleteClient = async (index) => {
  const result = await $services.clients.deleteClient(
    clientsStore,
    tempClients,
    index,
    resetForm,
    addInputMask,
    toggleEditing,
    addOneMoreClients,
  );
  isEditing.value = result.isEditing;
  showOneMoreClient.value = result.showOneMoreClient;
};

/**
 * @description Отслеживает изменения в `props.actionType`.
 * При изменении типа действия (например, при переключении с добавления на редактирование семьи),
 * вызывает сервисную функцию `handleActionTypeChange` для обновления состояния клиентов
 * и соответствующим образом устанавливает флаг `isEditing`.
 * Выполняется немедленно при монтировании компонента благодаря `{ immediate: true }`.
 */
watch(
  () => props.actionType,
  async (newActionType) => {
    const result = await $services.clients.handleActionTypeChange(
      clientsStore,
      tempClients,
      newActionType,
      resetForm,
      addOneMoreClients,
    );
    isEditing.value = result.isEditing;
  },
  { immediate: true, deep: true },
);

/**
 * @description Хук жизненного цикла, выполняемый после монтирования компонента.
 * Проверяет условия: если список клиентов в `clientsStore` пуст,
 * текущее действие не является редактированием (`props.actionType.type !== "edit"`),
 * и нет предзагруженных клиентов из `props.actionType.family.clients`,
 * то автоматически добавляется форма для одного нового клиента через вызов `addOneMoreClients`.
 * Это обеспечивает инициализацию формы для новой семьи клиентов.
 */
onMounted(() => {
  // Проверяем, есть ли предзагруженные клиенты из props (например, из поиска)
  const hasPreloadedClients =
    props.actionType?.family?.clients &&
    props.actionType.family.clients.length > 0;

  // Если список клиентов пуст, И это не режим редактирования существующей семьи,
  // И НЕТ предзагруженных клиентов, ТОГДА добавляем пустого клиента для новой семьи.
  if (
    clientsStore.clients.length === 0 &&
    props.actionType?.type !== "edit" &&
    !hasPreloadedClients
  ) {
    addOneMoreClients();
  }
});
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
            v-for="(item, index) in clientSections.before"
            :key="index"
            class="card-table__table-tr"
          >
            <div class="card-table__table-td card-table--name">
              {{ item.name }}
              <span class="card-table__name--surname">{{ item.surname }}</span>
            </div>
            <div class="card-table__table-td card-table--age">
              {{ calculateAge(item.birthday) }}
            </div>
            <div class="card-table__table-td card-table--gender">
              <img alt="" :src="getGenderImage(item.gender)" />
            </div>
            <div class="card-table__table-td card-table--actions">
              <div class="card-table__actions">
                <img
                  class="card-table__actions--edit"
                  src="/icons/edit.svg"
                  alt=""
                  @click="changeEdit(index + 1)"
                />
              </div>
            </div>
          </div>
          <div v-if="clientSections.active" class="card-table__table-tr">
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
                  alt=""
                  :src="getGenderImage(clientSections.active.gender)"
                />
              </div>
              <div class="card-table__table-td card-table--actions">
                <div class="card-table__actions">
                  <img
                    class="card-table__actions--edit"
                    src="/icons/edit.svg"
                    alt=""
                    @click="changeEdit(clientsStore.currentClientId)"
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
                {{ clientSections.active.name }}
                <div class="card-table__name-title--surname">
                  {{ clientSections.active.surname }}
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
                  @click="addClientToStore(clientsStore.currentClientId)"
                />
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`clientSurname_${uuidV4}`"
                  v-model="currentTempClient.surname"
                  type="text"
                  name="surname"
                  :title="
                    $t(`forms.client.add.fieldsets.client.fields.surname.label`)
                  "
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.surname"
                ></ui-fields-input>
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`clientName_${uuidV4}`"
                  v-model="currentTempClient.name"
                  type="text"
                  name="name"
                  :title="
                    $t(`forms.client.add.fieldsets.client.fields.name.label`)
                  "
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.name"
                ></ui-fields-input>
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`clientPatronymic_${uuidV4}`"
                  v-model="currentTempClient.patronymic"
                  type="text"
                  name="patronymic"
                  :title="
                    $t(
                      `forms.client.add.fieldsets.client.fields.patronymic.label`,
                    )
                  "
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.patronymic"
                ></ui-fields-input>
              </div>
              <div class="card-table__field">
                <ui-fields-input
                  :id="`clientBirthday_${uuidV4}`"
                  ref="birthdayDate"
                  v-model="currentTempClient.birthday"
                  type="text"
                  name="birthday"
                  :title="
                    $t(
                      `forms.client.add.fieldsets.client.fields.birthday.label`,
                    )
                  "
                  :success-message="$t('zod.success')"
                  :errorSubmit="errors.birthday"
                  :maxlength="clientsConstants.MAX_FIELD_BIRTHDAY_NUMBERS"
                ></ui-fields-input>
              </div>
              <v-radio-button
                v-model="currentTempClient.gender"
                name="genderType"
                class="card-table__radio"
                :input-data="inputData"
              />
              <div
                class="card-table__delete"
                @click="deleteClient(clientsStore.currentClientId)"
              >
                <div
                  v-if="!clientSections.active.isFirstClient"
                  class="card-table__delete-text"
                >
                  Удалить
                </div>
                <img
                  v-if="!clientSections.active.isFirstClient"
                  src="/icons/delete_icon.svg"
                  alt=""
                  class="card-table__delete-img"
                />
              </div>
              <img
                v-if="clientSections.active.isFirstClient"
                v-tooltip="
                  'Так как это первый (основной) клиент, то он не может быть удален'
                "
                src="/icons/lock_icon.svg"
                alt=""
                class="card-table__lock-img"
              />
            </div>
          </div>
          <div
            v-for="(item, index) in clientSections.after"
            :key="index"
            class="card-table__table-tr"
          >
            <div class="card-table__table-td card-table--name">
              {{ item.name }}
              <span class="card-table__name--surname">{{ item.surname }}</span>
            </div>
            <div class="card-table__table-td card-table--age">
              {{ calculateAge(item.birthday) }}
            </div>
            <div class="card-table__table-td card-table--gender">
              <img alt="" :src="getGenderImage(item.gender)" />
            </div>
            <div class="card-table__table-td card-table--actions">
              <div class="card-table__actions">
                <img
                  class="card-table__actions--edit"
                  src="/icons/edit.svg"
                  alt=""
                  @click="
                    changeEdit(clientSections.before.length + 1 + index + 1)
                  "
                />
              </div>
            </div>
          </div>
          <tr v-if="showOneMoreClient" class="card-table__tr-add">
            <div class="card-table__add">
              <button
                class="card-table__button card-table__button--add"
                :disabled="
                  $services.clients.isMaxClientsLimitReached(
                    clientsStore.clients,
                  )
                "
                @click.prevent="handleAddClientButtonClick"
              >
                {{ addClientText }}
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
    position: relative;
    right: 8px;
    top: -2px;

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

  &__lock-img {
    width: 2.3rem;
    height: 2.3rem;
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
