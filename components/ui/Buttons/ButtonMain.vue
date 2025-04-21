<script setup>
const props = defineProps({
  id: {
    type: [String, Number],
  },
  text: {
    type: String,
    required: true,
  },
  styleType: {
    type: String,
  },
});
</script>

<template>
  <button :id="id" class="button" :class="styleType">
    {{ text }}
  </button>
</template>

<style lang="scss" scoped>
.button {
  padding: 0.6rem;

  color: var(--color-tertiary);

  background-color: var(--color-main);
  border: 0;

  cursor: pointer;
}
</style>
