<script setup>
import Button from "@/components/ui/Buttons/ButtonMain";

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

const emit = defineEmits(["clickLeft", "clickRight"]);

const clickHandlerLeft = () => {
  emit("clickLeft");
};

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
