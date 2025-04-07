<script setup>
import vCheckbox from "@/components/ui/Checkboxes/MainCheckbox";
import FieldsetClientAdd from "./components/AddGroupClient";
import FieldsetAbonements from "./components/AddGroupAbonements";
import FieldsetRelatives from "./components/AddGroupRelatives";

const props = defineProps({
  selectedClientData: {
    type: Object,
  },
});
const showAbonements = ref(true);
const clientsList = ref([0]);

const actionType = computed(() => {
  return props.selectedClientData ? "edit" : "add";
});

const addOneMoreClientHandler = () => {
  this.clientsList.push(true);
};
const checkboxAbonementHandler = (value) => {
  this.showAbonements = value;
};
// const addClose = (index) => {
//   return Number(index) !== 0;
// };
// const deleteClient = (index) => {
//   this.clientsList.splice(index, 1);
// };
</script>

<template>
  <form class="client-main">
    <div
      class="client-main__item"
      v-for="(client, index) in clientsList"
      :key="index"
    >
      <fieldset-client-add @addOneMoreChildren="addOneMoreClientHandler" />
    </div>

    <div class="client-main__item">
      <fieldset-relatives :action-type="actionType" />
    </div>

    <div class="client-main__item">
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
  }

  &__item:last-child {
    margin-bottom: 0;
  }
}
</style>
