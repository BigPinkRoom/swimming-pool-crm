<script setup>
import vCheckbox from "@/components/ui/Checkboxes/MainCheckbox";
import FieldsetClientAdd from "./components/AddGroupClient";
import FieldsetAbonements from "./components/AddGroupAbonements";
import FieldsetRelatives from "./components/AddGroupRelatives";

const props = defineProps({
  actionType: { type: String },
});

const emit = defineEmits(["submit"]);

const formRef = ref(null);

const showAbonements = ref(true);

const checkboxAbonementHandler = (value) => {
  showAbonements.value = value;
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
      <fieldset-client-add :action-type="actionType" />
    </div>

    <div class="client-main__item">
      <fieldset-relatives :action-type="actionType" />
    </div>

    <div class="client-main__item client-main__item--add-abonements">
      <v-checkbox
        id="mainAbonementCheckbox"
        name="mainAbonementCheckbox"
        :label="$t(`forms.client.${actionType}.fields.abonementBinding.label`)"
        checked
        @checkboxChange="checkboxAbonementHandler"
      />
    </div>

    <div class="client-main__item">
      <fieldset-abonements :action-type="actionType" v-if="showAbonements" />
    </div>
  </form>
</template>

<style lang="scss" scoped>
.client-main {
  &__item {
    margin-bottom: 1.2rem;

    &--add-abonements {
      padding-left: 12px;
    }
  }

  &__item:last-child {
    margin-bottom: 0;
  }
}
</style>
