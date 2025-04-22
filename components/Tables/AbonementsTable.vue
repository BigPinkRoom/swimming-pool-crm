<script setup>
import { nextTick } from "vue";
import { statusImagesConstants } from "@/constants/statusImages";
import AbonementEntity from "@/entities/abonementEntity";

const { $services } = useNuxtApp();

const { createFamilyModelResponse } = new AbonementEntity();

const fullAbonements = ref([]);

const { data: fullAbonementsData } = await useAsyncData(
  "fullAbonements",
  async () => {
    const response = await $services.abonements.getFullAbonements();
    const createResponseModel = createFamilyModelResponse(response);
    return createResponseModel;
  }
);

fullAbonements.value = fullAbonementsData.value;

const daysOfCurrentMonth = ref($services.abonements.getDaysOfCurrentMonth());

const getStatusImage = (status) => {
  return statusImagesConstants[status] || null;
};

const getEvents = (day, abonementId) => {
  // Проверяем, существует ли fullAbonements
  if (!Array.isArray(fullAbonements.value)) {
    return [];
  }

  // Ищем абонемент по ID
  const abonement = fullAbonements.value.find(
    (item) => item.abonement.abonementId === abonementId
  );

  if (!abonement || !abonement.events) {
    return [];
  }

  // Фильтруем события по указанному дню
  const filteredEvents = abonement.events.filter((event) => {
    const eventDate = new Date(event.date);
    const eventDay = eventDate.getDate();
    return eventDay === Number(day);
  });

  return filteredEvents;
};

const emit = defineEmits(["openModalAdd", "openModalEdit"]);

const syncRowHeights = () => {
  nextTick(() => {
    const leftRows = document.querySelectorAll(".js-left-row");
    const rightRows = document.querySelectorAll(".js-right-row");

    // Сначала сбросим высоты
    rightRows.forEach((row) => {
      row.style.height = "auto";
    });

    // Затем установим новые высоты
    leftRows.forEach((leftRow, index) => {
      const rightRow = rightRows[index];
      if (rightRow) {
        const leftHeight = leftRow.getBoundingClientRect().height;
        rightRow.style.height = `${leftHeight}px`;
      }
    });
  });
};

const openModalEdit = (family) => {
  emit("openModal", { type: "edit", family });
};

const openModalAdd = () => {
  emit("openModal", { type: "add" });
};

onMounted(() => {
  // Вызываем синхронизацию после монтирования
  syncRowHeights();

  // Добавляем наблюдатель за изменениями размеров
  const observer = new ResizeObserver(() => {
    syncRowHeights();
  });

  const tableWrapper = document.querySelector(".abonements-table__wrapper");
  if (tableWrapper) {
    observer.observe(tableWrapper);
  }

  // Добавляем обработчик изменения размера окна
  window.addEventListener("resize", syncRowHeights);

  // Удаляем обработчик при размонтировании компонента
  onUnmounted(() => {
    window.removeEventListener("resize", syncRowHeights);
    observer.disconnect();
  });
});
</script>

<template>
  <div class="abonements-table">
    <h1 class="abonements-table__main-title">Abonements</h1>
    <div class="abonements-table__wrapper">
      <div class="abonements-table__subwrapper">
        <div class="abonements-table__table-values">
          <div
            class="abonements-table__header-sup-row abonements-table__header-sup-row--values"
          >
            <div class="abonements-table__header-add">
              <img src="/icons/icon_add-new-client.svg" @click="openModalAdd" />
            </div>
          </div>
          <div class="abonements-table__header-row">
            <div
              class="abonements-table__header-cell abonements-table__header-cell--settings"
            ></div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--number"
            >
              №
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--date-active"
            >
              Д.Акт
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--date-end"
            >
              Д.Зав
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--session-all"
            >
              З.Всг
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--session-left"
            >
              З.Ост
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--status"
            >
              Ст.
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--surname"
            >
              ФИО ребёнка
            </div>
          </div>
          <div
            class="abonements-table__body-row js-left-row"
            v-for="(item, index) in fullAbonements"
            :key="index"
          >
            <div
              class="abonements-table__body-cell abonements-table__body-cell--settings"
            >
              <img
                src="public/icons/more_table_settings.svg"
                @click="openModalEdit(item)"
              />
            </div>
            <div
              class="abonements-table__body-cell abonements-table__body-cell--number"
            >
              {{ item.abonement.abonementId }}
            </div>
            <div
              class="abonements-table__body-cell abonements-table__body-cell--date-active"
            >
              <!-- {{ item.abonement.dateStart }} -->
            </div>
            <div
              class="abonements-table__body-cell abonements-table__body-cell--date-end"
            >
              <!-- {{ item.abonement.dateEnd }} -->
            </div>
            <div
              class="abonements-table__body-cell abonements-table__body-cell--session-all"
            >
              {{ item.abonement.visitsQuantity }}
            </div>
            <div
              class="abonements-table__body-cell abonements-table__body-cell--session-left"
            >
              {{ item.abonement.visitsLeft }}
            </div>
            <div
              class="abonements-table__body-cell abonements-table__body-cell--status"
            >
              <img :src="getStatusImage(item.abonement.statusType)" />
            </div>
            <div
              class="abonements-table__body-cell abonements-table__body-cell--surname"
            >
              <div class="abonements-table__clients-list">
                <div
                  v-for="client in item.clients"
                  :key="client.id"
                  class="abonements-table__client-info"
                >
                  {{ client.clientName }} {{ client.clientSurname }}
                  <span class="abonements-table__client-info--patronymic">{{
                    client.clientPatronymic
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="abonements-table__table-events">
          <div
            class="abonements-table__header-sup-row abonements-table__header-sup-row--events"
          ></div>
          <div class="abonements-table__header-row">
            <div
              class="abonements-table__header-cell-event"
              v-for="day in daysOfCurrentMonth"
              :key="day"
            >
              {{ day }}
            </div>
          </div>
          <div class="abonements-table__events-rows">
            <div
              class="abonements-table__body-row js-right-row"
              v-for="item in fullAbonements"
              :key="item.abonement.abonementId"
            >
              <div
                class="abonements-table__body-cell-event"
                v-for="day in daysOfCurrentMonth"
                :key="day"
              >
                <div
                  v-for="event in getEvents(day, item.abonement.abonementId)"
                  :key="event.eventId"
                >
                  {{ event.value || null }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.abonements-table {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  overflow-x: hidden;

  &__wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    border-radius: 0.4rem;
  }

  &__subwrapper {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  &__table-values {
    border: 1px solid var(--color-main-tertiary-lighter);
    border-right: 0;
    border-bottom: 0;
    border-radius: 0.4rem 0 0 0.4rem;
  }

  &__header-sup-row {
    display: flex;
    align-items: center;
    height: 40px;
    background-color: var(--color-main-tertiary-lightest);
    border-bottom: 1px solid var(--color-main-tertiary-lighter);

    &--values {
      border-bottom: 1px solid var(--color-main-tertiary-lighter);
    }
  }

  &__header-add {
    height: 2.2rem;
    margin-left: 9px;
    cursor: pointer;
  }

  &__header-row {
    display: flex;
    align-items: stretch;
    height: 40px;

    color: var(--color-main-tertiary);

    background-color: var(--color-main-tertiary-lightest);
    border-bottom: 1px solid var(--color-main-tertiary-lighter);
  }

  &__header-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px;
    text-align: center;
    font-size: 1.4rem;
    border-right: 1px solid var(--color-main-tertiary-lighter);

    &--settings {
      width: 2rem;
    }

    &--number {
      width: 5rem;
    }

    &--date-active {
      width: 6.4rem;
    }

    &--date-end {
      width: 6.4rem;
    }

    &--session-all {
      width: 4.4rem;
    }

    &--session-left {
      width: 4.4rem;
    }

    &--status {
      width: 4rem;
    }

    &--surname {
      width: 28.8rem;
    }
  }

  &__body-row {
    display: flex;

    color: var(--color-main-tertiary);

    border-bottom: 1px solid var(--color-main-tertiary-lighter);
  }

  &__body-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px;
    text-align: center;
    font-size: 1.4rem;
    border-right: 1px solid var(--color-main-tertiary-lighter);

    &--settings {
      width: 2rem;

      cursor: pointer;
    }

    &--number {
      width: 5rem;
    }

    &--date-active {
      width: 6.4rem;
    }

    &--date-end {
      width: 6.4rem;
    }

    &--session-all {
      width: 4.4rem;
    }

    &--session-left {
      width: 4.4rem;
    }

    &--status {
      width: 4rem;
    }

    &--surname {
      width: 28.8rem;
      padding: 0;
    }
  }

  &__clients-list {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  &__client-info {
    width: 100%;
    padding: 4px;

    font-size: 1.4rem;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;

    border-bottom: 1px solid var(--color-main-tertiary-lighter);
    overflow: hidden;

    &:last-child {
      border-bottom: none;
    }

    &--patronymic {
      font-weight: 300;
      font-size: 1.2rem;
    }
  }

  &__table-events {
    overflow-x: auto;
    background-color: var(--color-main-tertiary-lightest);
    border: 1px solid var(--color-main-tertiary-lighter);
    border-left: 0;
    border-bottom: 0;
    border-radius: 0 0.4rem 0.4rem 0;
  }

  &__header-cell-event {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 2.499rem;
    padding: 0.4rem;

    text-align: center;
    font-size: 1.4rem;

    border-right: 1px solid var(--color-main-tertiary-lighter);

    &:last-child {
      border-right: 0;
    }
  }

  &__events-rows {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
  }

  &__body-cell-event {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 2.499rem;
    padding: 0.4rem;
    text-align: center;
    font-size: 1.4rem;
    border-right: 1px solid var(--color-main-tertiary-lighter);
    background-color: var(--color-white);

    &:last-child {
      border-right: 0;
    }
  }

  &__table-events &__body-row {
    display: flex;
    background-color: var(--color-white);
  }
}
</style>
