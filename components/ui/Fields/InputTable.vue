<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  id: {
    type: [String, Number],
  },
  name: {
    type: String,
  },
  placeholder: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
  },
});

const emit = defineEmits(["update:modelValue"]);

const onInput = (event) => {
  emit("update:modelValue", event.target.value);
};
</script>

<template>
  <div class="field">
    <input
      class="field__input"
      :id="id"
      :value="modelValue"
      :type="type"
      :name="name"
      :placeholder="placeholder"
      @input="onInput"
    />
  </div>
</template>

<style lang="scss" scoped>
.field {
  &__input {
    width: 100%;
    height: 34px;

    border: 1px solid var(--color-main-tertiary-light-2);
    border-radius: 3px;
  }
}
</style>
