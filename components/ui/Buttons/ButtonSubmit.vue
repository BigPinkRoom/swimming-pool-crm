<script setup>
const props = defineProps({
  id: {
    type: [String, Number],
  },
  isDisabled: {
    type: Boolean,
  },
  textSuccess: {
    type: String,
    required: true,
  },
  textInvalid: {
    type: String,
  },
  styleType: {
    type: String,
  },
});
</script>

<template>
  <button :id="id" class="button" :class="styleType" :disabled="true">
    {{ $t(`${textInvalid || textSuccess}`) }}
  </button>
</template>

<style lang="scss" scoped>
.button {
  padding: 0.6rem;

  color: var(--color-main);

  background-color: var(--color-main-lighter);
  border: 1px solid var(--color-main);
  border-radius: 4px;

  cursor: pointer;

  &:disabled {
    color: var(--color-white);

    background-color: var(--color-main-tertiary-lighter);
    border: 1px solid var(--color-main-tertiary-light-2);

    cursor: default;
  }
}
</style>
