<script setup>
import { uuid } from "vue-uuid";

const props = defineProps({
  id: {
    type: [String, Number],
  },
  name: {
    type: String,
  },
  title: {
    type: String,
    default: () => "",
  },
  optionsList: {
    type: Array,
  },
});

const uuidV4 = uuid.v4();
</script>

<template>
  <div class="select">
    <label :for="id" class="select__title">
      {{ title }}
    </label>
    <select :id="id" :name="name" class="select__field">
      <option v-if="placeholder" value="null" disabled selected>
        {{ placeholder }}
      </option>
      <option
        v-for="option in optionsList"
        :key="`${option.value}_${uuidV4}`"
        :disabled="option.disabled"
        :selected="option.selected"
        :value="option.value"
        class="select__option"
      >
        {{ option.text }}
      </option>
    </select>
  </div>
</template>

<style lang="scss" scoped>
.select {
  position: relative;

  &__field {
    width: 100%;
    height: 3.4rem;

    font-size: 1.4rem;
  }

  &__option {
  }

  &__title {
    position: absolute;
    top: -0.6rem;
    left: 0.8rem;

    padding: 0 3px;

    color: var(--color-main-tertiary-light);
    font-size: 1.2rem;
    background-color: var(--color-white);
  }
}
</style>
