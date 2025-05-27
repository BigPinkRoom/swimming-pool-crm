<script setup>
/**
 * @file Компонент радиокнопок.
 * @vue/component
 */

/**
 * @typedef {Object} RadioButtonData
 * @property {string | number} id - Уникальный идентификатор кнопки.
 * @property {string | number} value - Значение кнопки.
 * @property {string} label - Текст метки для кнопки.
 */

/**
 * Props компонента.
 * @vue-prop {RadioButtonData[]} inputData - Массив объектов для создания радиокнопок. Обязательный.
 * @vue-prop {string} [name] - Имя для группы радиокнопок.
 * @vue-prop {string} [direction="row"] - Направление отображения радиокнопок ("row" или "column").
 * @vue-prop {string | number} modelValue - Текущее выбранное значение. Обязательный.
 */
const props = defineProps({
  inputData: {
    type: Array,
    require: true,
  },
  name: {
    type: String,
  },
  direction: {
    type: String,
    default() {
      return "row";
    },
  },
  modelValue: {
    type: [String, Number],
    required: true,
  },
});

/**
 * Emits компонента.
 * @vue-event {string | number} update:modelValue - Событие, возникающее при изменении выбранного значения.
 */
const emit = defineEmits(["update:modelValue"]);

/**
 * Обновляет значение модели.
 * @param {string | number} value - Новое значение.
 */
const updateValue = (value) => {
  emit("update:modelValue", value);
};

/**
 * Возвращает объект с классами для корневого элемента в зависимости от направления.
 * @returns {Object} Объект с CSS-классами.
 */
const classObject = () => {
  const obj = {
    "radio-button_row": props.direction === "row",
    "radio-button_column": props.direction === "column",
  };

  return obj;
};
</script>

<template>
  <div class="radio-button" :class="classObject">
    <div
      v-for="buttonData in inputData"
      :key="buttonData.id"
      class="radio-button__item"
    >
      <label :for="buttonData.id">
        <input
          :id="buttonData.id"
          class="radio-button__input"
          type="radio"
          :name="name"
          :value="buttonData.value"
          :checked="modelValue === buttonData.value"
          @change="updateValue(buttonData.value)"
        />

        {{ buttonData.label }}
      </label>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.radio-button {
  display: flex;

  &_row {
    flex-direction: row;
  }

  &_column {
    flex-direction: column;
  }

  &__item {
    margin-right: 1.2rem;

    & label {
      font-size: 14px;
    }
  }

  &__item:last-child {
    margin-right: 0;
  }
}

input[type="radio"] {
  --s: 1.6rem; /* control the size */
  --c: var(--color-main); /* the active color */

  height: var(--s);
  aspect-ratio: 1;
  border: calc(var(--s) / 8) solid var(--color-main-tertiary-light);
  padding: calc(var(--s) / 8);
  background: radial-gradient(farthest-side, var(--c) 100%, #0000) 50%/0 0
    no-repeat content-box;
  border-radius: 50%;
  outline-offset: calc(var(--s) / 10);
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
  font-size: inherit;
  transition: 0.3s;
}
input[type="radio"]:checked {
  border-color: var(--c);
  background-size: 100% 100%;
}

input[type="radio"]:disabled {
  background: linear-gradient(#939393 0 0) 50%/100% 20% no-repeat content-box;
  opacity: 0.5;
  cursor: not-allowed;
}

label {
  display: flex;
  align-items: center;
  margin: 5px 0;
  cursor: pointer;
}

label input {
  margin-right: 5px;
}
</style>
