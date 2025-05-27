<script setup>
import Button from "@/components/ui/Buttons/ButtonMain";

/**
 * @typedef {Object} Props
 * @property {string} [leftText="Ok"] - Текст для левой кнопки.
 * @property {string} [rightText="Cancel"] - Текст для правой кнопки.
 */

/** @type {Props} */
const props = defineProps({
  leftText: {
    type: String,
    default() {
      return "Ok";
    },
  },
  rightText: {
    type: String,
    default() {
      return "Cancel";
    },
  },
});

/**
 * @typedef {Object} Emits
 * @property {() => void} clickLeft - Событие, возникающее при нажатии на левую кнопку.
 * @property {() => void} clickRight - Событие, возникающее при нажатии на правую кнопку.
 */

/** @type {Emits} */
const emit = defineEmits(["clickLeft", "clickRight"]);

/**
 * Обработчик клика по левой кнопке.
 * @fires Emits#clickLeft
 */
const clickHandlerLeft = () => {
  emit("clickLeft");
};

/**
 * Обработчик клика по правой кнопке.
 * @fires Emits#clickRight
 */
const clickHandlerRight = () => {
  emit("clickRight");
};
</script>

<template>
  <div class="footer-main">
    <uiButtonsButtonMain
      class="footer-main__left"
      :text="leftText"
      @click="clickHandlerLeft"
    />
    <uiButtonsButtonMain
      class="footer-main__right"
      :text="rightText"
      @click="clickHandlerRight"
    />
  </div>
</template>

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
