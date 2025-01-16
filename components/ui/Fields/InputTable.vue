<template>
  <div class="field">
    <input
      class="field__input"
      :id="id"
      :value="value"
      :type="type"
      :name="name"
      :placeholder="placeholder"
      @input="updateValue($event.target.value)"
    />
  </div>
</template>

<script>
export default {
  name: 'FieldInput',
  props: {
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
  },
  methods: {
    updateValue(value) {},
  },
};
</script>
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
