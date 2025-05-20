<script setup>
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
  },
  errorSubmit: {
    type: String,
  },
  successMessage: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    default: "",
  },
  maxlength: {
    type: Number,
  },
  placeholderProp: {
    type: String,
  },
  defaultClass: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const { value, errorMessage, meta } = useField(props.name || "", undefined, {
  syncVModel: true,
});

const fieldClass = computed(() => ({
  "field__input--default": Boolean(props.defaultClass),
  "field__input--error": Boolean(errorMessage.value || props.errorSubmit),
  "field__input--success": Boolean(meta.valid),
}));

const titleClass = computed(() => ({
  "field__title--default": Boolean(props.defaultClass),
  "field__title--error": Boolean(errorMessage.value || props.errorSubmit),
  "field__title--success": Boolean(meta.valid),
}));

const subtitleClass = computed(() => ({
  "field__subtitle--default": Boolean(props.defaultClass),
  "field__subtitle--error": Boolean(errorMessage.value || props.errorSubmit),
  "field__subtitle--success": Boolean(meta.valid),
}));
</script>

<template>
  <div class="field">
    <label class="field__title" :for="id" :class="titleClass">
      {{ title }}
    </label>
    <input
      :id="id"
      v-model="value"
      class="field__input"
      :class="fieldClass"
      :type="type"
      :name="name"
      :maxlength="maxlength"
      :placeholder="placeholderProp"
    />
    <div
      v-if="errorMessage || errorSubmit || meta.valid"
      class="field__subtitle"
      :class="subtitleClass"
    >
      {{ errorMessage || errorSubmit || successMessage }}
    </div>
    <div v-else class="field__subtitle--empty" :class="subtitleClass"></div>
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
    font-size: 1.3rem;
    background-color: var(--color-white);

    border-left: 0.1rem solid;
    border-right: 0.1rem solid;
    border-radius: 0.4rem;

    &--error {
      color: var(--color-warning);
    }

    &--success {
      color: var(--color-main);
    }

    &--default {
      color: var(--color-main-tertiary-light);
    }
  }

  &__input {
    width: 100%;
    height: 3.4rem;

    font-size: 1.4rem;
    color: var(--color-main-tertiary);

    border: 0.1rem solid var(--color-main-tertiary-light-2);
    border-radius: 0.3rem;

    transition: all 0.6s ease;

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

    &--default {
      background-color: var(--color-white);
      border: 0.1rem solid var(--color-main-tertiary-light-2);
    }
  }

  &__subtitle {
    display: flex;
    margin-top: 0.3rem;

    font-size: 1.1rem;

    &--error {
      color: var(--color-warning);
    }

    &--success {
      color: var(--color-main);
    }

    &--default {
      color: var(--color-main-tertiary-light);
    }

    &--empty {
      height: 15px;
    }
  }
}
</style>
