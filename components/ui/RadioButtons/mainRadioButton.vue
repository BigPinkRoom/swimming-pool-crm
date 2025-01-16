<template>
  <div class="radio-button" :class="classObject">
    <div class="radio-button__item" v-for="buttonData in inputData" :key="buttonData.id">
      <label :for="buttonData.id">
        <input
          :id="buttonData.id"
          :name="name"
          :value="buttonData.value"
          class="radio-button__input"
          type="radio"
          @input="updateValue($event.target.value)"
        />

        {{ buttonData.label }}
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RadioButton',
  props: {
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
        return 'row';
      },
    },
  },
  computed: {
    classObject() {
      const obj = {
        'radio-button_row': this.direction === 'row',
        'radio-button_column': this.direction === 'column',
      };

      return obj;
    },
  },
  methods: {
    updateValue(value) {},
  },
};
</script>
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
  }

  &__item:last-child {
    margin-right: 0;
  }
}

input[type='radio'] {
  --s: 1.6rem; /* control the size */
  --c: var(--color-main); /* the active color */

  height: var(--s);
  aspect-ratio: 1;
  border: calc(var(--s) / 8) solid var(--color-main-tertiary-light);
  padding: calc(var(--s) / 8);
  background: radial-gradient(farthest-side, var(--c) 100%, #0000) 50%/0 0 no-repeat content-box;
  border-radius: 50%;
  outline-offset: calc(var(--s) / 10);
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
  font-size: inherit;
  transition: 0.3s;
}
input[type='radio']:checked {
  border-color: var(--c);
  background-size: 100% 100%;
}

input[type='radio']:disabled {
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
