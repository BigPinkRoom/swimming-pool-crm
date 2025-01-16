<template>
  <div class="checkbox" :class="classObject">
    <label :for="id">
      <input
        :id="id"
        :checked="checked"
        :name="name"
        class="checkbox__input"
        type="checkbox"
        @input="updateValue($event.target.checked)"
      />

      {{ label }}
    </label>
  </div>
</template>

<script>
export default {
  name: 'MainCheckbox',
  props: {
    checked: {
      type: Boolean,
    },
    id: {
      type: [String, Number],
    },
    name: {
      type: String,
    },
    label: {
      type: String,
    },
  },
  computed: {
    classObject() {
      const obj = {};

      return obj;
    },
  },
  methods: {
    updateValue(value) {
      this.$emit('checkboxChange', value);
    },
  },
};
</script>
<style lang="scss" scoped></style>
