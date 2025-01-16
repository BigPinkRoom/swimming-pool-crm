<template>
  <input type="submit" value="text" :id="id" @click="clickHandler" class="button" :class="styleType" />
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
    clickHandler() {
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
