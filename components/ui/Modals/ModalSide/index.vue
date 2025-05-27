<script setup>
/**
 * @file Компонент боковой модальной панели.
 * @description Отображает модальное окно, которое может быть прикреплено к левой или правой стороне экрана.
 */
import FooterMain from "@/components/ui/Modals/ModalSide/components/FooterMain.vue";

const props = defineProps({
  /**
   * Заголовок модального окна.
   * @type {String}
   * @required
   */
  title: {
    type: String,
    require: true,
  },
  /**
   * Дополнительный класс стиля для модального окна.
   * @type {String}
   */
  styleType: {
    type: String,
  },
  /**
   * Определяет, является ли модальное окно "липким" (position: sticky).
   * @type {Boolean}
   */
  sticky: {
    type: Boolean,
  },
  /**
   * Позиция модального окна на экране.
   * @type {String}
   * @required
   * @default 'left'
   * @values 'left', 'right'
   */
  position: {
    type: String,
    require: true,
    default() {
      return "left";
    },
  },
});

/**
 * Вычисляемый объект классов для динамического применения стилей к модальному окну.
 * @returns {Object} Объект с классами CSS.
 * @property {Boolean} side-modal_sticky - Применяется, если props.sticky истинно.
 * @property {Boolean} [props.styleType] - Применяется, если props.styleType определен.
 * @property {Boolean} side-modal_left - Применяется, если props.position равен 'left'.
 * @property {Boolean} side-modal_right - Применяется, если props.position равен 'right'.
 */
computed({
  classObject() {
    const obj = {
      "side-modal_sticky": this.sticky,
      [this.styleType]: this.styleType,
    };

    if (this.position === "left") {
      obj["side-modal_left"] = true;
    } else if (this.position === "right") {
      obj["side-modal_right"] = true;
    }

    return obj;
  },
});
</script>

<template>
  <!--
    @slot content - Слот для основного содержимого модального окна.
    @slot footer - Слот для футера модального окна. По умолчанию отображает стандартный футер.
  -->
  <div class="side-modal" :class="classObject">
    <h2 class="side-modal__title">
      {{ title }}
    </h2>
    <div class="side-modal__content">
      <slot name="content"></slot>
    </div>
    <div class="side-modal__footer">
      <slot name="footer"> </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* Стили для компонента боковой модальной панели */
.side-modal {
  position: fixed;
  z-index: 10;

  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 45.8rem;
  height: calc(100% - 50px);
  padding: 1.2rem;

  box-shadow: -14px 20px 25px;
  background-color: #fff;

  &_sticky {
    position: sticky;

    margin-right: 1rem;
  }

  &_left {
    left: 0;

    box-shadow: 0.9rem 0 1.5rem -0.5rem rgba(34, 60, 80, 0.2);
  }

  &_right {
    right: 0;
  }

  &__title {
    margin-bottom: 1.2rem;

    font-size: 2rem;
    font-weight: 500;
    color: var(--color-main-tertiary);
    text-transform: uppercase;
  }

  &__content {
    overflow-y: auto;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    margin-top: auto;
    padding: 0.4rem;

    // TODO
    border-top: 1px solid black;
  }
}
</style>
