<template>
  <div class="checkbox" :class="classObject">
    <label :for="id">
      <input
        :id="id"
        class="checkbox__input"
        type="checkbox"
        :checked="checked"
        :name="name"
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
