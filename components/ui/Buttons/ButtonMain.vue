<template>
  <button :id="id" @click="clickHandler" class="button" :class="styleType">
    {{ text }}
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    id: {
      type: [String, Number],
    },
    text: {
      type: String,
      required: true,
    },
    styleType: {
      type: String,
    },
  },
  methods: {
    clickHandler(event) {
      event.preventDefault();
      this.$emit('click');
    },
  },
};
</script>

<style lang="scss" scoped>
.button {
  padding: 0.6rem;

  color: var(--color-tertiary);

  background-color: var(--color-main);
  border: 0;

  cursor: pointer;
}
</style>
