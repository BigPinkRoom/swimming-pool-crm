<template>
  <div class="card-table__wrapper">
    <slot name="title"></slot>
    <slot name="table"></slot>
    <slot name="table-title"></slot>
    <slot name="content"></slot>
  </div>
</template>

<script setup></script>

<style lang="scss">
.card-table {
  &__wrapper {
    border-radius: 0.5rem;
  }

  &__title {
    width: 100%;
    padding: 0.8rem 1.8rem;

    border-bottom: 0;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
  &__title--green {
    color: var(--color-main);
    font-weight: 600;
    background-color: var(--color-main-lighter);
  }
  &__wrapper--green {
    border: 0.1rem solid var(--color-main-light);
  }

  &__title--pink {
    color: var(--color-main-secondary);
    background-color: var(--color-main-secondary-light-extra);
    border-bottom: 0.1rem solid var(--color-main-secondary-light);
  }
  &__wrapper--pink {
    border: 0.1rem solid var(--color-main-secondary-light);
  }

  &__title--gray {
    color: var(--color-main-tertiary);
    background-color: var(--color-main-tertiary-lightest);
  }
  &__wrapper--gray {
    border: 0.1rem solid var(--color-main-tertiary-light-extra);
  }

  &__title--abonements {
    border-bottom: 0.1rem solid var(--color-main-tertiary-light-extra);
  }

  &__table {
    &-title {
      width: 100%;

      text-align: center;
      color: var(--color-main-tertiary);

      border-collapse: collapse;
      &-td {
        border-top: 0;

        &--green {
          border: 1px solid var(--color-main-light);
          &:last-child {
            border-right: 0;
          }
          &:first-child {
            border-left: 0;
          }
        }

        &--gray {
          border: 1px solid var(--color-main-tertiary-light-extra);
          &:last-child {
            border-right: 0;
          }
          &:first-child {
            border-left: 0;
          }
        }
      }
    }
    &-td {
      font-size: 1.4rem;
      color: var(--color-main-tertiary-light);

      border: 1px solid var(--color-main-tertiary-lighter);
      // &:last-child {
      //   border-right: 0;
      // }
      // &:first-child {
      //   border-left: 0;
      // }
    }
  }
  &__name {
    flex-direction: column;

    padding: 0.4rem 1.8rem;

    border-right: 0;
    border-top: 0;

    text-align: left;
    font-size: 1.4rem;
    font-weight: 400;
    color: var(--color-main-tertiary);
    &--surname {
      display: block;

      font-size: 1.2rem;
      font-weight: 300;
      color: var(--color-main-tertiary-light);
    }
  }
  &__add {
  }
  &__edit {
    cursor: pointer;
  }
  &__button {
    display: block;
    width: calc(100% - 8px);
    padding: 6px;
    margin: 4px;

    color: var(--color-main);

    border: 1px solid var(--color-main-light);
    border-radius: 5px;
    background-color: var(--color-main-lighter);

    cursor: pointer;
  }
}
</style>
