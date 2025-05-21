<script setup>
import { nextTick, computed, ref, onMounted, onUnmounted } from "vue";

import { statusImagesConstants } from "@/constants/statusImages";
import AbonementEntity from "@/entities/abonementEntity";
import { abonementFilters } from "@/entities/abonementEntity";
import { handleFilterChange } from "@/services/modules/abonements";
import {
  getEventsForDay,
  fetchAndProcessAbonements,
  getProcessedSortedAbonements,
} from "@/services/modules/abonementsTable";
import { formatDate } from "@/helpers/formatDate";

const { $services } = useNuxtApp();

const { createFamilyModelResponse } = new AbonementEntity();

const fullAbonements = ref([]);
const originalFullAbonements = ref([]);

const { data: fullAbonementsData, error: asyncDataError } = await useAsyncData(
  "fullAbonements",
  async () => {
    return fetchAndProcessAbonements({
      abonementsService: $services.abonements,
      createFamilyModelResponseFn: createFamilyModelResponse,
    });
  },
);

if (asyncDataError.value) {
  fullAbonements.value = [];
  originalFullAbonements.value = [];

  throw asyncDataError.value;
} else if (fullAbonementsData.value) {
  fullAbonements.value = JSON.parse(JSON.stringify(fullAbonementsData.value));
  originalFullAbonements.value = JSON.parse(
    JSON.stringify(fullAbonementsData.value),
  );
} else {
  fullAbonements.value = [];
  originalFullAbonements.value = [];
}

const daysOfCurrentMonth = ref($services.abonements.getDaysOfCurrentMonth());

const getStatusImage = (status) => {
  return statusImagesConstants[status] || null;
};

const emit = defineEmits(["openModalAdd", "openModalEdit"]);

const syncRowHeights = () => {
  nextTick(() => {
    const leftRows = document.querySelectorAll(".js-left-row");
    const rightRows = document.querySelectorAll(".js-right-row");

    rightRows.forEach((row) => {
      row.style.height = "auto";
    });

    leftRows.forEach((leftRow, index) => {
      const rightRow = rightRows[index];
      if (rightRow) {
        const leftHeight = leftRow.getBoundingClientRect().height;
        rightRow.style.height = `${leftHeight}px`;
      }
    });
  });
};

const openModalEdit = (familyFromTable) => {
  const representativeClientId = familyFromTable.clients?.[0]?.clientId;

  if (representativeClientId === undefined) {
    console.warn(
      "[AbonementsTable] Could not extract representativeClientId from familyFromTable. Modal might show filtered data.",
    );
    emit("openModal", { type: "edit", family: familyFromTable });
    return;
  }

  const originalFamily = originalFullAbonements.value.find((originalFam) =>
    originalFam.clients?.some(
      (client) => client.clientId === representativeClientId,
    ),
  );

  if (originalFamily) {
    emit("openModal", { type: "edit", family: originalFamily });
  } else {
    console.warn(
      `[AbonementsTable] Original family with client ID '${representativeClientId}' not found. Modal will show table version.`,
    );
    emit("openModal", { type: "edit", family: familyFromTable });
  }
};

const openModalAdd = () => {
  emit("openModal", { type: "add" });
};

const sortState = ref([]);

function handleSort(columnKey) {
  const idx = sortState.value.findIndex((s) => s.key === columnKey);
  if (idx !== -1) {
    const currentOrder = sortState.value[idx].order;
    if (currentOrder === "asc") sortState.value[idx].order = "desc";
    else if (currentOrder === "desc") sortState.value.splice(idx, 1);
  } else {
    sortState.value.unshift({ key: columnKey, order: "asc" });
  }

  const sortings = sortState.value.map(({ key, order }) => ({
    name: key,
    type: order?.toUpperCase(),
  }));

  getProcessedSortedAbonements({
    abonementsService: $services.abonements,
    sortings: sortings,
    createFamilyModelResponseFn: createFamilyModelResponse,
  })
    .then((sortedData) => {
      fullAbonements.value = JSON.parse(JSON.stringify(sortedData));
      syncRowHeights();
    })
    .catch((error) => {
      throw error;
    });
}

const columnSortOrdersMap = computed(() => {
  return sortState.value.reduce((map, sortEntry) => {
    map[sortEntry.key] = sortEntry.order;
    return map;
  }, {});
});

const filters = ref({ ...abonementFilters });

function onFilterChange() {
  handleFilterChange({
    filters: { ...filters.value },
    fullAbonements,
    createFamilyModelResponse,
    $services,
  });
}

onMounted(async () => {
  syncRowHeights();

  console.log("full abonements", fullAbonements.value);

  const observer = new ResizeObserver(() => {
    syncRowHeights();
  });

  const tableWrapper = document.querySelector(".abonements-table__wrapper");
  if (tableWrapper) {
    observer.observe(tableWrapper);
  }

  window.addEventListener("resize", syncRowHeights);

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
              @click="handleSort('abonements.abonement_id')"
            >
              №
              <img
                class="abonements-table__sort-icon"
                src="public/icons/arrow_down_icon-long.svg"
                alt="arrow"
                :class="{
                  'abonements-table__sort-icon--asc':
                    columnSortOrdersMap['abonements.abonement_id'] === 'asc',
                  'abonements-table__sort-icon--desc':
                    columnSortOrdersMap['abonements.abonement_id'] === 'desc',
                  'abonements-table__sort-icon--hidden':
                    !columnSortOrdersMap['abonements.abonement_id'],
                }"
              />
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--date-active"
              @click="handleSort('abonements.date_start')"
            >
              Д.Акт
              <img
                class="abonements-table__sort-icon"
                src="public/icons/arrow_down_icon-long.svg"
                alt="arrow"
                :class="{
                  'abonements-table__sort-icon--asc':
                    columnSortOrdersMap['abonements.date_start'] === 'asc',
                  'abonements-table__sort-icon--desc':
                    columnSortOrdersMap['abonements.date_start'] === 'desc',
                  'abonements-table__sort-icon--hidden':
                    !columnSortOrdersMap['abonements.date_start'],
                }"
              />
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--date-end"
              @click="handleSort('abonements.date_end')"
            >
              Д.Зав
              <img
                class="abonements-table__sort-icon"
                src="public/icons/arrow_down_icon-long.svg"
                alt="arrow"
                :class="{
                  'abonements-table__sort-icon--asc':
                    columnSortOrdersMap['abonements.date_end'] === 'asc',
                  'abonements-table__sort-icon--desc':
                    columnSortOrdersMap['abonements.date_end'] === 'desc',
                  'abonements-table__sort-icon--hidden':
                    !columnSortOrdersMap['abonements.date_end'],
                }"
              />
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--session-all"
              @click="handleSort('abonements.visits_quantity')"
            >
              Зн.<br />
              Всг.
              <img
                class="abonements-table__sort-icon"
                src="public/icons/arrow_down_icon-long.svg"
                alt="arrow"
                :class="{
                  'abonements-table__sort-icon--asc':
                    columnSortOrdersMap['abonements.visits_quantity'] === 'asc',
                  'abonements-table__sort-icon--desc':
                    columnSortOrdersMap['abonements.visits_quantity'] ===
                    'desc',
                  'abonements-table__sort-icon--hidden':
                    !columnSortOrdersMap['abonements.visits_quantity'],
                }"
              />
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--session-left"
              @click="handleSort('abonements.visits_left')"
            >
              Зн.<br />
              Ост.
              <img
                class="abonements-table__sort-icon"
                src="public/icons/arrow_down_icon-long.svg"
                alt="arrow"
                :class="{
                  'abonements-table__sort-icon--asc':
                    columnSortOrdersMap['abonements.visits_left'] === 'asc',
                  'abonements-table__sort-icon--desc':
                    columnSortOrdersMap['abonements.visits_left'] === 'desc',
                  'abonements-table__sort-icon--hidden':
                    !columnSortOrdersMap['abonements.visits_left'],
                }"
              />
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--status"
              @click="handleSort('abonements.status_id')"
            >
              Ст.
              <img
                class="abonements-table__sort-icon"
                src="public/icons/arrow_down_icon-long.svg"
                alt="arrow"
                :class="{
                  'abonements-table__sort-icon--asc':
                    columnSortOrdersMap['abonements.status_id'] === 'asc',
                  'abonements-table__sort-icon--desc':
                    columnSortOrdersMap['abonements.status_id'] === 'desc',
                  'abonements-table__sort-icon--hidden':
                    !columnSortOrdersMap['abonements.status_id'],
                }"
              />
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--surname"
              @click="handleSort('clients.surname')"
            >
              ФИО ребёнка
              <img
                class="abonements-table__sort-icon abonements-table__sort-icon--abosolute"
                src="public/icons/arrow_down_icon-long.svg"
                alt="arrow"
                :class="{
                  'abonements-table__sort-icon--asc':
                    columnSortOrdersMap['clients.surname'] === 'asc',
                  'abonements-table__sort-icon--desc':
                    columnSortOrdersMap['clients.surname'] === 'desc',
                  'abonements-table__sort-icon--hidden':
                    !columnSortOrdersMap['clients.surname'],
                }"
              />
            </div>
          </div>

          <!-- second row -->

          <div
            class="abonements-table__header-row abonements-table__header-row--secondary"
          >
            <div
              class="abonements-table__header-cell abonements-table__header-cell--filter abonements-table__header-cell--settings"
            ></div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--filter abonements-table__header-cell--number"
            >
              <ui-fields-input-table-filter
                :id="`abonementId_${uuidV4}`"
                v-model="filters.abonementId"
                class="abonements-table__field"
                type="number"
                name="abonementId"
                @update:modelValue="onFilterChange"
              ></ui-fields-input-table-filter>
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--filter abonements-table__header-cell--date-active"
            >
              <ui-fields-input-table-filter
                :id="`dateStart_${uuidV4}`"
                v-model="filters.dateStart"
                class="abonements-table__field"
                type="date"
                name="dateStart"
                @update:modelValue="onFilterChange"
              ></ui-fields-input-table-filter>
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--filter abonements-table__header-cell--date-end"
            >
              <ui-fields-input-table-filter
                :id="`dateEnd_${uuidV4}`"
                v-model="filters.dateEnd"
                class="abonements-table__field"
                type="date"
                name="dateEnd"
                @update:modelValue="onFilterChange"
              ></ui-fields-input-table-filter>
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--filter abonements-table__header-cell--session-all"
            >
              <ui-fields-input-table-filter
                :id="`visitsQuantity_${uuidV4}`"
                v-model="filters.visitsQuantity"
                class="abonements-table__field"
                type="number"
                name="visitsQuantity"
                @update:modelValue="onFilterChange"
              ></ui-fields-input-table-filter>
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--filter abonements-table__header-cell--session-left"
            >
              <ui-fields-input-table-filter
                :id="`visitsLeft_${uuidV4}`"
                v-model="filters.visitsLeft"
                class="abonements-table__field"
                type="number"
                name="visitsLeft"
                @update:modelValue="onFilterChange"
              ></ui-fields-input-table-filter>
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--filter abonements-table__header-cell--status"
            >
              <ui-fields-input-table-filter
                :id="`statusId_${uuidV4}`"
                v-model="filters.statusId"
                class="abonements-table__field"
                type="number"
                name="statusId"
                @update:modelValue="onFilterChange"
              ></ui-fields-input-table-filter>
            </div>
            <div
              class="abonements-table__header-cell abonements-table__header-cell--filter abonements-table__header-cell--surname"
            >
              Ф
              <ui-fields-input-table-filter
                :id="`surname_${uuidV4}`"
                v-model="filters.surname"
                class="abonements-table__field-filter"
                type="text"
                name="surname"
                placeholder="Фамилия"
                @update:modelValue="onFilterChange"
              >
              </ui-fields-input-table-filter>
              И
              <ui-fields-input-table-filter
                :id="`name_${uuidV4}`"
                v-model="filters.name"
                class="abonements-table__field-filter"
                type="text"
                name="name"
                placeholder="Имя"
                @update:modelValue="onFilterChange"
              >
              </ui-fields-input-table-filter>
              О
              <ui-fields-input-table-filter
                :id="`patronymic_${uuidV4}`"
                v-model="filters.patronymic"
                class="abonements-table__field-filter"
                type="text"
                name="patronymic"
                placeholder="Отчество"
                @update:modelValue="onFilterChange"
              ></ui-fields-input-table-filter>
            </div>
          </div>
          <div
            v-for="(family, familyIdx) in fullAbonements"
            :key="'family-' + familyIdx"
          >
            <div
              v-for="abonement in family.abonements"
              :key="'abonement-' + abonement.abonementId"
              class="abonements-table__body-row js-left-row"
            >
              <div
                class="abonements-table__body-cell abonements-table__body-cell--settings"
              >
                <img
                  class="abonements-table__ellipis-img"
                  src="public/icons/more_table_settings.svg"
                  @click="openModalEdit(family)"
                />
              </div>
              <div
                class="abonements-table__body-cell abonements-table__body-cell--number"
              >
                {{ abonement.abonementId }}
              </div>
              <div
                class="abonements-table__body-cell abonements-table__body-cell--date-active"
              >
                {{ formatDate(abonement.dateStart, true) }}
              </div>
              <div
                class="abonements-table__body-cell abonements-table__body-cell--date-end"
              >
                {{ formatDate(abonement.dateEnd, true) }}
              </div>
              <div
                class="abonements-table__body-cell abonements-table__body-cell--session-all"
              >
                {{ abonement.visitsQuantity }}
              </div>
              <div
                class="abonements-table__body-cell abonements-table__body-cell--session-left"
              >
                {{ abonement.visitsLeft }}
              </div>
              <div
                class="abonements-table__body-cell abonements-table__body-cell--status"
              >
                <img :src="getStatusImage(abonement.statusId)" />
              </div>
              <div
                class="abonements-table__body-cell abonements-table__body-cell--surname"
              >
                <div class="abonements-table__clients-list">
                  <div
                    v-for="client in family.clients"
                    :key="client.clientId"
                    class="abonements-table__client-info"
                  >
                    {{ client.clientSurname }} {{ client.clientName }}
                    <span class="abonements-table__client-info--patronymic">
                      {{ client.clientPatronymic }}
                    </span>
                  </div>
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
              v-for="day in daysOfCurrentMonth"
              :key="day"
              class="abonements-table__header-cell-event"
            >
              {{ day }}
            </div>
          </div>
          <div
            class="abonements-table__header-row abonements-table__header-row--secondary"
          >
            <div
              v-for="day in daysOfCurrentMonth"
              :key="day"
              class="abonements-table__header-cell-event"
            >
              <!-- {{ day }} -->
            </div>
          </div>

          <div class="abonements-table__events-rows">
            <div
              v-for="(family, familyIdx) in fullAbonements"
              :key="'events-family-' + familyIdx"
            >
              <div
                v-for="abonement in family.abonements"
                :key="'events-abonement-' + abonement.abonementId"
                class="abonements-table__body-row js-right-row"
              >
                <div
                  v-for="day in daysOfCurrentMonth"
                  :key="day"
                  class="abonements-table__body-cell-event"
                >
                  <div
                    v-for="event in getEventsForDay(day, family)"
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

  &__field {
    display: flex;
  }

  &__field-filter {
    display: flex;
    margin: 0 4px 0 4px;
  }

  &__header-surname {
    margin-left: auto;

    font-size: 1.4rem;

    &--sort {
      margin-left: auto;
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
    height: 4rem;

    color: var(--color-main-tertiary);

    background-color: var(--color-main-tertiary-lightest);
    border-bottom: 1px solid var(--color-main-tertiary-lighter);

    &--secondary {
      height: 2.9rem;
    }
  }

  &__header-cell {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 4px;

    text-align: center;
    font-size: 1.4rem;

    border-right: 1px solid var(--color-main-tertiary-lighter);
    cursor: pointer;

    transition: background-color 0.3s;
    &:hover {
      background-color: var(--color-main-tertiary-lighter);
    }

    &--filter {
      &:hover {
        background-color: var(--color-main-tertiary-lightest);
        cursor: default;
      }
    }

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
      position: relative;

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

  &__sort-icon {
    opacity: 0.4;
    cursor: pointer;
    transition:
      opacity 0.3s,
      transform 0.3s;
    &--desc {
      opacity: 1;
      transform: rotate(180deg);
    }
    &--asc {
      opacity: 1;
      transform: rotate(0deg);
    }
    &--hidden {
      opacity: 0.4;
      pointer-events: none;
    }
    &--abosolute {
      position: absolute;
      right: 0.6rem;
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
    width: 2.499rem;
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
    width: 2.499rem;
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
