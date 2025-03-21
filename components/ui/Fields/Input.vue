<script setup>
const props = defineProps({
  id: {
    type: [String, Number],
  },
  name: {
    type: String,
  },
  title: {
    type: String,
  },
  errorMessage: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const updateValue = (event) => {
  const value = event.target.value;
  emit("update:modelValue", value);
};

const fieldErrorClass = computed(() => ({
  "field__input--error": Boolean(props.errorMessage),
}));

const titleErrorClass = computed(() => ({
  "field__title--error": Boolean(props.errorMessage),
}));
</script>

<template>
  <div class="field">
    <label :for="id" class="field__title" :class="titleErrorClass">
      {{ title }}
    </label>
    <input
      class="field__input"
      :class="fieldErrorClass"
      :id="id"
      :type="type"
      :name="name"
      @input="updateValue"
    />
    <div v-if="errorMessage" class="field__error">{{ errorMessage }}</div>
  </div>
</template>

<style lang="scss" scoped>
.field {
  position: relative;

  width: 100%;

  &__title {
    position: absolute;
    top: -0.6rem;
    left: 0.8rem;

    padding: 0 3px;

    color: var(--color-main-tertiary-light);
    font-size: 1.2rem;
    background-color: var(--color-white);

    &--error {
      color: var(--color-warning);
    }
  }

  &__input {
    width: 100%;
    height: 3.4rem;

    font-size: 1.4rem;

    border: 1px solid var(--color-main-tertiary-light-2);
    border-radius: 3px;

    box-shadow: 0 0 0 0 var(--color-main-tertiary-light-2);

    transition: all 0.5s ease;

    &:focus {
      box-shadow: 0 0 0 1px;
      outline: none;
    }

    &--error {
      border: 1px solid var(--color-warning);

      &:focus {
        border: 1px solid var(--color-warning);
        outline: none;

        box-shadow: 0 0 0 1px var(--color-warning);
      }
    }
  }

  &__error {
    display: block; // Явно указываем блочный тип
    width: 100%;

    color: var(--color-warning);
    font-size: 1.3rem;
  }
}
</style>
