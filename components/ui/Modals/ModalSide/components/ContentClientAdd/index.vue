<script setup>
import vCheckbox from "@/components/ui/Checkboxes/MainCheckbox";
import FieldsetSearch from "./components/Search.vue";
import FieldsetClientAdd from "./components/AddGroupClient";
import FieldsetAbonements from "./components/AddGroupAbonements";
import FieldsetRelatives from "./components/AddGroupRelatives";
import { ref, computed } from "vue";

const props = defineProps({
  actionType: { type: Object },
});

const emit = defineEmits(["submit", "family-data-updated"]);

const formRef = ref(null);

const showAbonements = ref(true);

const isFamilyFromSearch = computed(() => {
  return (
    props.actionType?.source === "search" ||
    (props.actionType?.family &&
      Object.keys(props.actionType.family).length > 0)
  );
});

const checkboxAbonementHandler = (value) => {
  showAbonements.value = value;
};

const handleFamilySelectedFromSearch = (familyData) => {
  emit("family-data-updated", familyData);
};

// const submitForm = () => {
//   emit("submit");
// };

// defineExpose({
//   submitForm,
// });
</script>

<template>
  <form class="client-main" ref="formRef">
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
            }.fields.abonementBinding.label`
          )
        "
        checked
        @checkboxChange="checkboxAbonementHandler"
      />
    </div>

    <div class="client-main__item">
      <fieldset-abonements
        ref="fieldsetAbonements"
        :action-type="actionType"
        v-if="showAbonements"
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
