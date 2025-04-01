<script setup>
const { $services } = useNuxtApp();

const daysOfCurrentMonth = ref($services.abonements._getDaysOfCurrentMonth());
</script>

<template>
  <div class="abonements-table">
    <h1 class="abonements-table__main-title">Abonements</h1>
    <div class="abonements-table__wrapper">
      <div class="abonements-table__table-values">
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
            class="abonements-table__header-cell abonements-table__header-cell--sessioon-all"
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
      </div>
      <div class="abonements-table__table-events">
        <div class="abonements-table__header-row">
          <div
            class="abonements-table__header-cell-event"
            v-for="day in daysOfCurrentMonth"
            :key="day"
          >
            {{ day }}
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

  &__title {
  }

  &__table {
    width: 100%;
  }

  &__wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  &__table-values {
  }

  &__header-row {
    display: flex;
    align-items: stretch; // Растягивает ячейки по высоте
    height: 40px;

    background-color: var(--color-main-tertiary-lightest);
  }

  &__header-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px;

    text-align: center;
    font-size: 1.4rem;

    border: 1px solid var(--color-main-tertiary-lighter);
    border-right: 0;

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

    &--sessioon-all {
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

  &__table-events {
    overflow-x: scroll;
  }

  &__header-cell-event {
    display: flex;
    justify-content: center;
    align-items: center;

    padding: 0.4rem;

    text-align: center;
    font-size: 1.4rem;

    border: 0.1rem solid var(--color-main-tertiary-lighter);
    border-right: 0;

    &:last-child {
      border: 0.1rem solid var(--color-main-tertiary-lighter);
    }
  }
}
</style>
