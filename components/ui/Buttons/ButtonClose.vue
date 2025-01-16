<template>
  <button :id="id" :class="styleType" class="button" type="button" @click="clickHandler"></button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    id: {
      type: [String, Number],
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
  position: relative;

  // padding: 0.4rem;
  width: 2.8rem;
  height: 2.8rem;

  background-color: var(--color-tertiary);
  border: 1rem solid var(--color-secondary);
  border-radius: 50%;

  cursor: pointer;

  &::before {
    position: absolute;
    top: 50%;
    left: 50%;

    width: 60%;
    height: 2rem;

    background-color: var(--color-warning);
    border-radius: 25%;
    transform: translateX(-50%) translateY(-50%) rotate(45deg);

    content: '';
  }

  &::after {
    position: absolute;
    top: 50%;
    left: 50%;

    width: 60%;
    height: 2rem;

    background-color: var(--color-warning);
    border-radius: 25%;
    transform: translateX(-50%) translateY(-50%) rotate(-45deg);

    content: '';
  }

  &__symbol {
    color: var(--color-warning);
    font-size: 3.2rem;
    line-height: 0.88;
  }
}
</style>
