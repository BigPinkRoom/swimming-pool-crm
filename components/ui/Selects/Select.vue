<script setup>
import { uuid } from "vue-uuid";
import { useField } from "vee-validate";

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
  errorSubmit: {
    type: String,
  },
  successMessage: {
    type: String,
    default: "",
  },
  modelValue: {
    type: [String, Number],
    default: "1",
  },
  placeholder: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const { value, errorMessage, meta } = useField(props.name || "", undefined, {
  syncVModel: true,
});

const fieldClass = computed(() => ({
  "select__field--error": Boolean(errorMessage.value || props.errorSubmit),
  "select__field--success": Boolean(meta.valid),
}));

const titleClass = computed(() => ({
  "select__title--error": Boolean(errorMessage.value || props.errorSubmit),
  "select__title--success": Boolean(meta.valid),
}));

const subtitleClass = computed(() => ({
  "select__subtitle--error": Boolean(errorMessage.value || props.errorSubmit),
  "select__subtitle--success": Boolean(meta.valid),
}));

const uuidV4 = uuid.v4();
</script>

<template>
  <div class="select" :class="{ 'select--disabled': props.disabled }">
    <label class="select__title" :for="id" :class="titleClass">
      {{ title }}
    </label>
    <select
      :id="id"
      v-model="value"
      class="select__field"
      :name="name"
      :class="fieldClass"
      :disabled="props.disabled"
    >
      <option v-if="placeholder" value="" disabled>
        {{ placeholder }}
      </option>
      <option
        v-for="option in optionsList"
        :key="`${option.value}_${uuidV4}`"
        class="select__option"
        :disabled="option.disabled"
        :value="option.value"
      >
        {{ option.text }}
      </option>
    </select>
    <div
      v-if="errorMessage || errorSubmit || meta.valid"
      class="select__subtitle"
      :class="subtitleClass"
    >
      {{ errorMessage || errorSubmit || successMessage }}
    </div>
    <div v-else class="select__subtitle--empty" :class="subtitleClass"></div>
  </div>
</template>

<style lang="scss" scoped>
.select {
  position: relative;

  width: 100%;

  &--disabled {
    .select__title {
      color: var(--color-main-tertiary-light-2);
    }
  }

  &__title {
    position: absolute;
    top: -0.6rem;
    left: 0.8rem;
    z-index: 10;

    padding: 0 3px;

    color: var(--color-main-tertiary-light);
    font-size: 1.3rem;
    background-color: var(--color-white);

    border-left: 0.1rem solid;
    border-right: 0.1rem solid;
    border-radius: 0.4rem;

    .select__field:disabled + & {
      opacity: 50%;
      background-color: green; // Пример стиля
    }

    &--error {
      color: var(--color-warning);
    }

    &--success {
      color: var(--color-main);
    }
  }

  &__field {
    width: 100%;
    height: 3.4rem;

    font-size: 1.4rem;

    background-color: var(--color-white);
    border: 0.1rem solid var(--color-main-tertiary-light-2);
    border-radius: 0.3rem;

    transition: all 0.6s ease;

    &:disabled .select__title {
      opacity: 50%;
      background-color: green;
    }

    &:focus {
      outline: none;
      box-shadow: 0rem 0rem 0rem 0.2rem var(--color-main-tertiary-light-2);
    }

    &--error {
      background-color: var(--color-main-secondary-light-extra);
      border: 0.1rem solid var(--color-warning);

      &:focus {
        outline: none;
        box-shadow: 0rem 0rem 0rem 0.2rem var(--color-warning);
      }
    }

    &--success {
      background-color: var(--color-main-lighter);
      border: 0.1rem solid var(--color-main-light);

      &:focus {
        box-shadow: 0rem 0rem 0rem 0.2rem var(--color-main);
      }
    }
  }

  &__subtitle {
    display: flex;
    width: 100%;
    margin-top: 0.3rem;

    font-size: 1.1rem;

    &--error {
      color: var(--color-warning);
    }

    &--success {
      color: var(--color-main);
    }

    &--empty {
      height: 15px;
    }
  }

  &__option {
  }

  &__error {
    display: block;
    width: 100%;

    color: var(--color-warning);
    font-size: 1.3rem;
  }
}
</style>
