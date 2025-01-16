<template>
  <div class="footer-main">
    <v-button class="footer-main__left" :text="leftText" @click="clickHandlerLeft" />
    <v-button class="footer-main__right" :text="rightText" @click="clickHandlerRight" />
  </div>
</template>

<script>
import Button from '@/components/ui/Buttons/ButtonMain';

export default {
  name: 'FooterMain',
  components: {
    vButton: Button,
  },
  props: {
    leftText: {
      type: String,
      default() {
        return 'Ok';
      },
    },
    rightText: {
      type: String,
      default() {
        return 'Cancel';
      },
    },
  },
  methods: {
    clickHandlerLeft() {
      this.$emit('clickLeft');
    },

    clickHandlerRight() {
      this.$emit('clickRight');
    },
  },
};
</script>

<style lang="scss" scoped>
.footer-main {
  display: flex;
  justify-content: space-between;
  width: 100%;

  &__left {
    min-width: 10rem;
  }

  &__right {
    min-width: 10rem;
  }
}
</style>
