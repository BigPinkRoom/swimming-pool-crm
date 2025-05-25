/** * @file Компонент верхнего уровня для добавления или редактирования
информации о клиенте/семье. * Объединяет в себе компоненты для поиска
существующей семьи, добавления/редактирования клиентов, * родственников и
абонементов. */
<script setup>
import vCheckbox from "@/components/ui/Checkboxes/MainCheckbox";
import FieldsetSearch from "./components/Search.vue";
import FieldsetClientAdd from "./components/AddGroupClient";
import FieldsetAbonements from "./components/AddGroupAbonements";
import FieldsetRelatives from "./components/AddGroupRelatives";
import { ref, computed } from "vue";

/**
 * Пропсы компонента.
 * @typedef {Object} Props
 * @property {Object} [actionType] - Объект, определяющий тип действия (например, добавление, редактирование) и исходные данные.
 * @property {string} [actionType.type] - Тип действия (например, 'add', 'edit').
 * @property {string} [actionType.source] - Источник данных (например, 'search', если семья выбрана из поиска).
 * @property {Object} [actionType.family] - Данные семьи, если они передаются для редактирования или были выбраны.
 */
const props = defineProps({
  actionType: { type: Object },
});

/**
 * Определяет события, которые компонент может эмитировать.
 * @property {function(Object): void} submit - Событие, возникающее при отправке формы (в данном коде не используется напрямую, но может быть предусмотрено для будущей логики отправки всей формы).
 * @property {function(Object): void} family-data-updated - Событие, возникающее при обновлении данных семьи, например, после выбора семьи из поиска.
 */
const emit = defineEmits(["submit", "family-data-updated"]);

/**
 * Реактивная ссылка на DOM-элемент формы.
 * @type {import('vue').Ref<HTMLFormElement | null>}
 */
const formRef = ref(null);

/**
 * Реактивная переменная, определяющая, следует ли отображать секцию с абонементами.
 * @type {import('vue').Ref<boolean>}
 */
const showAbonements = ref(true);

/**
 * Вычисляемое свойство, определяющее, была ли семья выбрана из результатов поиска.
 * @type {import('vue').ComputedRef<boolean>}
 */
const isFamilyFromSearch = computed(() => {
  return (
    props.actionType?.source === "search" ||
    (props.actionType?.family &&
      Object.keys(props.actionType.family).length > 0)
  );
});

/**
 * Обработчик изменения состояния чекбокса для отображения/скрытия секции абонементов.
 * @param {boolean} value - Новое состояние чекбокса (true - отмечен, false - не отмечен).
 */
const checkboxAbonementHandler = (value) => {
  showAbonements.value = value;
};

/**
 * Обработчик события `family-selected` от компонента `FieldsetSearch`.
 * Передает данные выбранной семьи родительскому компоненту через событие `family-data-updated`.
 * @param {Object} familyData - Данные выбранной семьи.
 */
const handleFamilySelectedFromSearch = (familyData) => {
  emit("family-data-updated", familyData);
};
</script>

<template>
  <form ref="formRef" class="client-main">
    <div class="client-main__item">
      <fieldset-search
        :action-type="actionType"
        @family-selected="handleFamilySelectedFromSearch"
      />
    </div>

    <div class="client-main__item">
      <fieldset-client-add
        :action-type="actionType"
        :is-family-from-search="isFamilyFromSearch"
      />
    </div>

    <div class="client-main__item">
      <fieldset-relatives :action-type="actionType" />
    </div>

    <div class="client-main__item client-main__item--add-abonements">
      <v-checkbox
        id="mainAbonementCheckbox"
        name="mainAbonementCheckbox"
        :label="
          $t(
            `forms.client.${
              actionType?.type || 'add'
            }.fields.abonementBinding.label`,
          )
        "
        checked
        @checkboxChange="checkboxAbonementHandler"
      />
    </div>

    <div class="client-main__item">
      <fieldset-abonements
        v-if="showAbonements"
        ref="fieldsetAbonements"
        :action-type="actionType"
      />
    </div>
  </form>
</template>

<style lang="scss" scoped>
.client-main {
  &__item {
    margin-bottom: 1.2rem;

    &--add-abonements {
      padding-left: 0;
    }
  }

  &__item:last-child {
    margin-bottom: 0;
  }
}
</style>
